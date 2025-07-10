# C:\Users\germa\Desktop\academic_system\backend\academic\views\admin_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from collections import defaultdict
from academic.models import (
    Teacher, CourseSubject, Assignment, GradeEntry, 
    Attendance, AcademicPeriod
)
from academic.serializers import AcademicPeriodSerializer
from analytics.course_analysis_service import get_course_subject_full_analysis
from collections import OrderedDict
from datetime import datetime
import subprocess
import os

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_engagement_overview(request, teacher_id):
    """
    Devuelve métricas de asistencia y entregas tardías por materia, curso y periodo.
    Incluye texto narrativo resumen.
    """
    teacher = get_object_or_404(Teacher, id=teacher_id)

    resumen = defaultdict(lambda: {
        "course": "",
        "subject": "",
        "periods": defaultdict(lambda: {
            "late_submissions": 0,
            "attendance_records": 0,
            "absences": 0,
        })
    })

    # --- 1. ENTREGAS TARDÍAS ---
    assignments = Assignment.objects.filter(course_subject__teacher=teacher).select_related('course_subject__course', 'course_subject__subject')
    for a in assignments:
        for grade in a.grade_entries.all():
            key = (a.course_subject.course.name, a.course_subject.subject.name)
            resumen[key]["course"] = a.course_subject.course.name
            resumen[key]["subject"] = a.course_subject.subject.name
            periodo = f"Periodo {a.period}"
            if grade.late_submission:
                resumen[key]["periods"][periodo]["late_submissions"] += 1

    # --- 2. ASISTENCIA ---
    course_subjects = CourseSubject.objects.filter(teacher=teacher).select_related("course", "subject")
    cs_map = {cs.subject_id: cs for cs in course_subjects}

    attendances = Attendance.objects.filter(subject_id__in=cs_map.keys()).select_related('student', 'subject')

    for ar in attendances:
        cs = cs_map.get(ar.subject_id)
        if not cs:
            continue

        period = AcademicPeriod.objects.filter(
            start_date__lte=ar.date,
            end_date__gte=ar.date
        ).first()
        if not period:
            continue

        periodo_key = period.name
        key = (cs.course.name, cs.subject.name)
        resumen[key]["course"] = cs.course.name
        resumen[key]["subject"] = cs.subject.name
        resumen[key]["periods"][periodo_key]["attendance_records"] += 1
        if not ar.present:
            resumen[key]["periods"][periodo_key]["absences"] += 1

    # --- 3. CONVERTIR resumen dict -> lista para JSON ---
    overview_list = []
    for (course_name, subject_name), data in resumen.items():
        # Convertir periods defaultdict a dict normal
        periods_dict = {period: dict(vals) for period, vals in data["periods"].items()}
        overview_list.append({
            "course": course_name,
            "subject": subject_name,
            "periods": periods_dict,
        })

    # --- 4. NARRATIVA RESUMEN ---
    narrativa = []
    for item in overview_list:
        curso = item["course"]
        materia = item["subject"]
        for periodo, vals in item["periods"].items():
            narrativa.append(
                f"En {periodo}, en {materia} ({curso}), se registraron {vals['absences']} ausencias y {vals['late_submissions']} entregas tardías."
            )

    return Response({
        "overview": overview_list,
        "narrative": " ".join(narrativa)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_ia_analysis(request, teacher_id):
    """
    Devuelve para un docente:
    - narrative: texto global interpretativo
    - delivery_compliance: % entregas a tiempo por curso
    - risk_distribution: conteo de estudiantes por nivel de riesgo (low/medium/high) por curso
    Parámetro opcional: ?period=1
    """
    teacher = get_object_or_404(Teacher, id=teacher_id)
    # periodo en query params (default 1)
    period = int(request.query_params.get('period', 1))

    # 1) Recolectar análisis por cada CourseSubject del docente
    cs_list = CourseSubject.objects.filter(teacher=teacher).select_related('course', 'subject')
    
    # Usar diccionarios para agrupar por curso y materia
    delivery_compliance = {}
    risk_distribution = {}
    narratives = []
    
    # Agrupar por curso para evitar duplicados
    course_data = {}

    for cs in cs_list:
        analysis = get_course_subject_full_analysis(
            course_id=cs.course_id,
            subject_id=cs.subject_id,
            period=period
        )
        
        course_name = cs.course.name
        subject_name = cs.subject.name
        
        # Inicializar curso si no existe
        if course_name not in course_data:
            course_data[course_name] = {
                'total_evaluaciones': 0,
                'entregas_tardias': 0,
                'students_risk': {'low': 0, 'medium': 0, 'high': 0},
                'subjects': []
            }
        
        # Agregar datos de esta materia
        course_data[course_name]['subjects'].append(subject_name)
        
        # 2) Calcular entregas tardías por materia
        total_evaluaciones_materia = 0
        entregas_tardias_materia = 0
        
        for rep in analysis['studentReports']:
            # Contar evaluaciones totales del estudiante
            total_evaluaciones_materia += rep.get('total_evaluaciones', 0)
            # Contar entregas tardías del estudiante
            entregas_tardias_materia += rep.get('entregas_tardias', 0)
        
        # Acumular para el curso
        course_data[course_name]['total_evaluaciones'] += total_evaluaciones_materia
        course_data[course_name]['entregas_tardias'] += entregas_tardias_materia
        
        # 3) Acumular riesgo por materia
        for rep in analysis['studentReports']:
            pred = rep.get('prediccion_riesgo')
            if isinstance(pred, dict) and pred.get('riesgo') is not None:
                r = pred.get('riesgo', 0)
                if r < 0.4:
                    course_data[course_name]['students_risk']['low'] += 1
                elif r < 0.7:
                    course_data[course_name]['students_risk']['medium'] += 1
                else:
                    course_data[course_name]['students_risk']['high'] += 1
            else:
                # Si no hay predicción, contar como riesgo medio
                course_data[course_name]['students_risk']['medium'] += 1

    # 4) Procesar datos finales por curso
    for course_name, data in course_data.items():
        # Calcular porcentaje de entregas a tiempo
        total_eval = data['total_evaluaciones']
        entregas_tardias = data['entregas_tardias']
        
        if total_eval > 0:
            entregas_a_tiempo = total_eval - entregas_tardias
            pct_on_time = round((entregas_a_tiempo / total_eval) * 100, 1)
        else:
            pct_on_time = None
        
        delivery_compliance[course_name] = pct_on_time
        risk_distribution[course_name] = data['students_risk']
        
        # Calcular porcentaje de estudiantes en riesgo alto
        total_students = sum(data['students_risk'].values())
        high_risk_pct = round((data['students_risk']['high'] / total_students) * 100, 1) if total_students > 0 else 0
        
        # Crear narrativa
        subjects_str = ", ".join(data['subjects'])
        narratives.append(
            f"En {course_name} ({subjects_str}), el cumplimiento de entregas es "
            f"{pct_on_time or 0}% y el {high_risk_pct}% de estudiantes "
            "se encuentran en riesgo alto."
        )

    return Response({
        "narrative": " ".join(narratives),
        "delivery_compliance": delivery_compliance,
        "risk_distribution": risk_distribution,
    })

# ==================== NUEVA FUNCIONALIDAD: CRUD PERIODOS ACADÉMICOS ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def academic_periods_view(request):
    """
    GET: Listar todos los periodos académicos
    POST: Crear nuevo periodo académico
    """
    if request.method == 'GET':
        periods = AcademicPeriod.objects.all().order_by('-start_date')
        serializer = AcademicPeriodSerializer(periods, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = AcademicPeriodSerializer(data=request.data)
        if serializer.is_valid():
            new_period = serializer.save()
            
            # Si el periodo es el último del año, reentrenar IA
            if is_last_period_of_year(new_period):
                try:
                    retrain_ia_model(new_period.academic_year)
                    return Response({
                        "period": serializer.data,
                        "message": "Periodo creado y modelo de IA reentrenado exitosamente."
                    }, status=status.HTTP_201_CREATED)
                except Exception as e:
                    return Response({
                        "period": serializer.data,
                        "message": "Periodo creado pero el reentrenamiento falló.",
                        "error": str(e)
                    }, status=status.HTTP_201_CREATED)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def academic_period_detail(request, period_id):
    """
    GET: Obtener un periodo académico específico
    PUT: Editar un periodo académico existente
    DELETE: Eliminar un periodo académico
    """
    try:
        period = AcademicPeriod.objects.get(id=period_id)
    except AcademicPeriod.DoesNotExist:
        return Response({"error": "Periodo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = AcademicPeriodSerializer(period)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = AcademicPeriodSerializer(period, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        period.delete()
        return Response({"message": "Periodo eliminado exitosamente"}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_retrain_model(request):
    """
    Permite reentrenar manualmente el modelo de IA para un año específico.
    Body: {"year": 2024}
    """
    year = request.data.get('year')
    if not year:
        return Response({"error": "Año requerido"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        retrain_ia_model(year)
        return Response({
            "message": f"Modelo reentrenado exitosamente para el año {year}"
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            "error": f"Error en reentrenamiento: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==================== FUNCIONES AUXILIARES ====================

def is_last_period_of_year(period_obj):
    """
    Determina si el periodo creado es el último del año lectivo.
    Asume que se reentrena el modelo cuando se crea el último periodo del año.
    """
    same_year_periods = AcademicPeriod.objects.filter(academic_year=period_obj.academic_year)
    if not same_year_periods.exists():
        return False
    
    latest_end = max([p.end_date for p in same_year_periods])
    return period_obj.end_date == latest_end

import sys

def retrain_ia_model(year):
    """
    Ejecuta la generación del dataset y el reentrenamiento del modelo de IA.
    """
    print(f"🤖 Iniciando reentrenamiento del modelo para el año {year}")
    
    # Obtener la ruta del backend
    backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    dataset_script = os.path.join(backend_path, "analytics", "ml_model", "generar_dataset.py")
    training_script = os.path.join(backend_path, "analytics", "ml_model", "entrenar_modelo.py")

    try:
        # Ejecutar generación del dataset
        print("📊 Generando dataset...")
        gen_output = subprocess.check_output(
            [sys.executable, dataset_script],  # ✅ usar el python activo del entorno virtual
            stderr=subprocess.STDOUT,
            cwd=backend_path
        )
        print("✅ Generación dataset completada:", gen_output.decode())

        # Ejecutar entrenamiento del modelo
        print("🎯 Entrenando modelo...")
        train_output = subprocess.check_output(
            [sys.executable, training_script],  # ✅ usar el python activo del entorno virtual
            stderr=subprocess.STDOUT,
            cwd=backend_path
        )
        print("[OK] Entrenamiento modelo completado:", train_output.decode())

        print(f"[OK] Reentrenamiento del modelo para el año {year} completado exitosamente")

    except subprocess.CalledProcessError as e:
        print(f"X Error en reentrenamiento: {e}")
        print(f"X Output: {e.output.decode()}")
        raise Exception(f"Error en reentrenamiento del modelo: {e.output.decode()}")
    except Exception as e:
        print(f"X Error inesperado: {e}")
        raise Exception(f"Error inesperado en reentrenamiento: {str(e)}")
    """
from academic.models import Student, Subject, Grade, Grado

def promote_students(academic_year):
    
    Promociona automáticamente a los estudiantes si no reprueban 3 o más materias.
    Condición: promedio de los 4 periodos por materia >= 3.0 (sobre 5).
    
    students = Student.objects.all()
    
    for student in students:
        if not student.course or not student.grado:
            continue

        current_course = student.course
        current_grado = student.grado

        subjects = Subject.objects.filter(grado=current_grado)

        failed_subjects = 0

        for subject in subjects:
            # Calcular el promedio de los 4 periodos para esa materia
            grades = Grade.objects.filter(
                student=student,
                course=current_course,
                period__in=[1, 2, 3, 4],
                year=academic_year
            )

            # Filtrar solo las notas de esta materia
            subject_grades = [
                g.value for g in grades if g.course.course_subjects.filter(subject=subject).exists()
            ]

            if len(subject_grades) == 4:
                avg = sum(subject_grades) / 4
                if avg < 3.0:
                    failed_subjects += 1

        if failed_subjects >= 3:
            # Repite el grado → no hacer nada
            continue

        # PROMOCIÓN
        next_grado = Grado.objects.filter(numero=current_grado.numero + 1).first()
        if next_grado:
            student.grado = next_grado

            # Buscar un curso en ese grado para el nuevo año (o asignarlo luego manualmente)
            next_course = student.course  # mantener mismo curso o buscar dinámicamente
            student.course = None  # o next_course si lo manejas

            student.save()
    """

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
import random, string

from academic.models import Administrator
from academic.serializers import AdministratorSerializer
from authentication.models import User  # Modelo de usuario

class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.objects.all()
    serializer_class = AdministratorSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            admin = serializer.save()

            provisional_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
            user = User.objects.create_user(
                email=admin.email,
                password=provisional_password,
                first_name=admin.first_name,
                last_name=admin.last_name,
                user_type="director",
                email_confirmed=False
            )
            admin.user = user
            admin.save()

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_link = f"http://localhost:5173/cambiar-contraseña/{uid}/{token}/"

            print(f"Enviando correo a {admin.email} con link {frontend_link}")
            print(f"[DEBUG] Creando usuario admin {admin.email}")
            print(f"[DEBUG] Enviando correo a {admin.email}")
            send_mail(
                subject="Activa tu cuenta de administrador",
                message=(
                    f"¡Hola {admin.first_name}!\n\n"
                    f"Para activar tu cuenta y elegir tu contraseña, haz clic aquí:\n\n"
                    f"{frontend_link}\n\n"
                    "Este enlace expira en 24 horas. Si tienes problemas, copia y pega la URL en tu navegador."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin.email],
                fail_silently=False,
            )
            print(f"[DEBUG] Correo enviado")
            return Response(self.get_serializer(admin).data, status=status.HTTP_201_CREATED)


