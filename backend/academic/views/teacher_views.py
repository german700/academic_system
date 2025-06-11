# C:\Users\germa\Desktop\academic_system\backend\academic\views\teacher_views.py
# Importaciones de Django
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings

# Importaciones de Django REST Framework
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

# Importaciones para generación de PDF
from io import BytesIO
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet

# Importaciones del proyecto - Modelos
from academic.models import (
    Teacher,
    Course,
    Student,
    CourseSubject,
    Assignment,
    GradeEntry,
    Subject,
    AcademicPeriod
)

# Importaciones del proyecto - Serializers
from academic.serializers import (
    TeacherSerializer,
    CourseSerializer,
    StudentSerializer,
    AssignmentSerializer,
    GradeEntrySerializer,
    AcademicPeriodSerializer,
    CourseSerializerMinimal
)

# Importaciones del proyecto - Permisos
from academic.permissions import IsTeacher, IsTeacherOrAdmin

# Importaciones para análisis (si se usa)
from analytics.services import analizar_rendimiento_estudiante_completo

# Importaciones para autenticación (si se usa en create method)
from authentication.models import User

# ✅ Importación del helper ML
from analytics.services import MLModelHandler, predecir_riesgo_estudiante

# ✅ Funciones de utilidad para verificaciones comunes
def get_course_if_teacher(request, course_id):
    """
    Devuelve el curso si el docente autenticado está asignado a él.
    Lanza Response 403 si no está autorizado.
    """
    teacher = request.user.teacher_profile
    try:
        return Course.objects.get(id=course_id, course_subjects__teacher=teacher)
    except Course.DoesNotExist:
        return Response({"error": "No tiene permiso para este curso"}, status=status.HTTP_403_FORBIDDEN)

from academic.models import CourseSubject

def get_course_subject_if_teacher(request, course_id, subject_id):
    teacher = request.user.teacher_profile
    try:
        cs = CourseSubject.objects.get(course__id=course_id, subject__id=subject_id, teacher=teacher)
        return cs
    except CourseSubject.DoesNotExist:
        return Response({"error": "No tienes acceso a esta materia o no estás asignado"}, status=403)

def is_teacher_assigned_to_subject(course_id, subject_id, teacher):
    """
    Verifica si un docente está asignado a una materia específica en un curso.
    """
    return CourseSubject.objects.filter(
        course_id=course_id, 
        subject_id=subject_id, 
        teacher=teacher
    ).exists()


def get_course_subject_if_teacher(request, course_id, subject_id):
    """
    Devuelve el CourseSubject si el docente está asignado.
    Lanza Response 403 si no está autorizado.
    """
    teacher = request.user.teacher_profile
    if not is_teacher_assigned_to_subject(course_id, subject_id, teacher):
        return Response({"error": "No autorizado para esta materia en este curso."}, status=status.HTTP_403_FORBIDDEN)
    
    return get_object_or_404(CourseSubject, course_id=course_id, subject_id=subject_id)

class TeacherCourseSubjectComparisonAPIView(APIView):
    """
    GET /api/academic/teacher/course/{course_id}/subject/{subject_id}/comparison/
    Compara el rendimiento promedio de una materia en un curso con otros cursos del mismo grado
    """
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def get(self, request, course_id, subject_id):
        # 1) Validar que el docente enseña esa materia en ese curso
        cs = get_course_subject_if_teacher(request, course_id, subject_id)
        if isinstance(cs, Response):
            return cs
        
        # 2) Obtener periodo académico actual
        today = timezone.now().date()
        current_period = AcademicPeriod.objects.filter(
            start_date__lte=today,
            end_date__gte=today
        ).first()
        
        if not current_period:
            return Response({
                "error": "No hay periodo académico activo"
            }, status=400)
        
        # 3) Obtener todos los cursos del mismo grado
        grado = cs.course.grado
        sibling_courses = Course.objects.filter(grado=grado).order_by('name')
        
        # 4) Para cada curso, calcular promedio de la materia
        data = []
        for course in sibling_courses:
            # Solo materias con el mismo subject_id
            try:
                cs_sib = CourseSubject.objects.get(course=course, subject_id=subject_id)
            except CourseSubject.DoesNotExist:
                # Si el curso no tiene esta materia, lo omitimos
                continue
            
            # Calcular promedio general del periodo activo
            entries = GradeEntry.objects.filter(
                assignment__course_subject=cs_sib,
                assignment__period=current_period.number
            )
            
            if not entries.exists():
                # Si no hay calificaciones, agregar con promedio None
                data.append({
                    'course_id': course.id,
                    'course': course.name,
                    'average': None,
                    'student_count': course.students.count()
                })
                continue
            
            # Convertir a escala 1–5 y promediar
            notas = []
            for entry in entries:
                if entry.assignment.max_score > 0:  # Evitar división por cero
                    nota_normalizada = (float(entry.score) / float(entry.assignment.max_score)) * 5.0
                    notas.append(nota_normalizada)
            
            avg = round(sum(notas) / len(notas), 2) if notas else None
            
            data.append({
                'course_id': course.id,
                'course': course.name,
                'average': avg,
                'student_count': course.students.count(),
                'total_grades': len(notas)
            })
        
        # 5) Generar texto de análisis
        target_course = next((d for d in data if d['course'] == cs.course.name), None)
        other_courses = [d for d in data if d['course'] != cs.course.name]
        
        if target_course:
            target_avg = target_course['average']
            target_avg_text = f"{target_avg:.2f}" if target_avg is not None else "N/A"
            
            comparisons = []
            for d in other_courses:
                avg_text = f"{d['average']:.2f}" if d['average'] is not None else "N/A"
                comparisons.append(f"{d['course']}: {avg_text}")
            
            comparison_text = (
                f"En {cs.course.name} la nota promedio en {cs.subject.name} es "
                f"{target_avg_text}. "
            )
            
            if comparisons:
                comparison_text += "Cursos hermanos → " + "; ".join(comparisons)
            else:
                comparison_text += "No hay otros cursos del mismo grado con esta materia para comparar."
        else:
            comparison_text = "No se pudo generar la comparación."
        
        # 6) Invocar tu modelo ML para el curso entero:
        # promedia el riesgo de todos los estudiantes de cs.course en este subject y periodo
        entradas = GradeEntry.objects.filter(
            assignment__course_subject=cs,
            assignment__period=current_period.number
        ).select_related('student')
        
        riesgos = []
        for ge in entradas:
            result = predecir_riesgo_estudiante(ge.student)
            if result["riesgo"] is not None:
                riesgos.append(result["riesgo"])
        
        riesgo_curso = round(sum(riesgos)/len(riesgos), 3) if riesgos else None
        
        # 7) Construye tu chart_data_ia
        ia_chart = []
        for d in data:
            # para cada curso hermano
            siblings_entries = GradeEntry.objects.filter(
                assignment__course_subject__course_id=d['course_id'],
                assignment__period=current_period.number
            ).select_related('student')
            
            sib_riesgos = [
                predecir_riesgo_estudiante(ge.student)["riesgo"] or 0
                for ge in siblings_entries
            ]
            
            ia_chart.append({
                "label": d['course'],
                "avg": d['average'] or 0,
                "risk": round(sum(sib_riesgos)/len(sib_riesgos), 3) if sib_riesgos else 0
            })
        
        return Response({
            'course_info': {
                'id': cs.course.id,
                'name': cs.course.name,
                'grado': cs.course.grado.numero
            },
            'subject_info': {
                'id': cs.subject.id,
                'name': cs.subject.name
            },
            'period_info': {
                'number': current_period.number,
                'name': current_period.name
            },
            'comparison_text': comparison_text,
            'chart_data': data,
            'ia_course_analysis': (
                f"El riesgo promedio IA estimado para {cs.course.name} en {cs.subject.name} es "
                f"{riesgo_curso:.3f} " if riesgo_curso is not None else "No se pudo calcular el riesgo IA. "
            ),
            'ia_course_chart': ia_chart
        })
    
class TeacherViewSet(viewsets.ModelViewSet):
    """
    /api/academic/teachers/
    CRUD de docentes + GET /api/academic/teachers/{pk}/assignments/
    """
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrAdmin]

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def assignments(self, request, pk=None):
        """
        GET /api/academic/teachers/{pk}/assignments/
        Obtiene todas las tareas creadas por un profesor
        """
        teacher = self.get_object()
        course_subjects = CourseSubject.objects.filter(teacher=teacher)
        assignments = Assignment.objects.filter(course_subject__in=course_subjects)
        return Response(AssignmentSerializer(assignments, many=True).data)

    def create(self, request, *args, **kwargs):
        """
        Al crear un docente, también se genera un usuario y se envía correo de activación.
        """
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            teacher = serializer.save()

            from authentication.models import User
            from django.contrib.auth.tokens import default_token_generator
            from django.utils.http import urlsafe_base64_encode
            from django.utils.encoding import force_bytes
            from django.core.mail import send_mail
            from django.conf import settings
            import random, string

            provisional_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
            user = User.objects.create_user(
                email=teacher.email,
                password=provisional_password,
                first_name=teacher.first_name,
                last_name=teacher.last_name,
                user_type="teacher",
                email_confirmed=False
            )

            teacher.user = user
            teacher.save()

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_link = f"http://localhost:5173/cambiar-contraseña/{uid}/{token}/"

            send_mail(
                subject="Activa tu cuenta de docente",
                message=(
                    f"¡Hola {teacher.first_name}!\n\n"
                    f"Para activar tu cuenta y elegir tu contraseña, haz clic aquí:\n\n"
                    f"{frontend_link}\n\n"
                    "Este enlace expira en 24 horas. Si tienes problemas, copia y pega la URL en tu navegador."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[teacher.email],
                fail_silently=False,
            )

            return Response(self.get_serializer(teacher).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], 
            url_path='course/(?P<course_id>[^/.]+)/subject/(?P<subject_id>[^/.]+)/assignments')
    def course_subject_assignments(self, request, course_id=None, subject_id=None):
        """
        GET /api/academic/teachers/course/{course_id}/subject/{subject_id}/assignments/
        Obtiene las tareas de una materia específica en un curso (solo si el docente está asignado)
        """
        # Verificar que el teacher está asignado a esta materia en este curso
        course_subject = get_course_subject_if_teacher(request, course_id, subject_id)
        if isinstance(course_subject, Response):
            return course_subject
        
        # Obtener las assignments ordenadas por fecha
        assignments = Assignment.objects.filter(
            course_subject=course_subject
        ).order_by('-date_assigned')  # Más recientes primero
        
        # Serializar y retornar
        serializer = AssignmentSerializer(assignments, many=True)
        return Response({
            'course': {
                'id': course_subject.course.id,
                'name': course_subject.course.name
            },
            'subject': {
                'id': course_subject.subject.id,
                'name': course_subject.subject.name
            },
            'assignments': serializer.data,
            'total_assignments': assignments.count()
        })

    @action(detail=False, methods=['get'], url_path='attendance/by_date')
    def attendance_by_date(self, request):
        """
        GET /api/academic/teachers/attendance/by_date/?course_id=X&subject_id=Y&date=YYYY-MM-DD
        Obtiene la asistencia de estudiantes en una fecha específica
        """
        course_id = request.query_params.get("course_id")
        subject_id = request.query_params.get("subject_id")
        date_str = request.query_params.get("date")
        
        if not (course_id and subject_id and date_str):
            return Response({
                "error": "Parámetros requeridos: course_id, subject_id, date"
            }, status=400)
        
        try:
            course_subject = CourseSubject.objects.get(course__id=course_id, subject__id=subject_id)
        except CourseSubject.DoesNotExist:
            return Response({
                "error": "Asignación curso-materia no encontrada"
            }, status=404)
        
        try:
            date = timezone.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({
                "error": "Formato de fecha inválido. Use YYYY-MM-DD"
            }, status=400)
        
        students = course_subject.course.students.all()
        data = []
        
        for stu in students:
            from academic.models import Attendance  # Importar el modelo
            record = Attendance.objects.filter(
                student=stu, 
                subject=course_subject.subject, 
                date=date
            ).first()
            
            data.append({
                "studentId": stu.id,
                "studentName": f"{stu.first_name} {stu.last_name}",
                "present": record.present if record else False,
                "id": record.id if record else None
            })
        
        return Response(data)

    # ============================================
    # RUTAS "ME/" PARA EL DOCENTE AUTENTICADO
    # ============================================

    @action(detail=False, url_path='me/dashboard', methods=['get'])
    def me_dashboard(self, request):
        from academic.models import AcademicPeriod

        teacher = getattr(request.user, 'teacher_profile', None)
        if not teacher:
            return Response({"error": "No eres un docente"}, status=404)

        # 1) periodo activo
        today = timezone.now().date()
        period = AcademicPeriod.objects.filter(
            start_date__lte=today, end_date__gte=today
        ).first()
        current_period = {
            "name": period.name,
            "number": period.number
        } if period else None

        # 2) tus cursos+materias (ya los tienes)
        course_subjects = CourseSubject.objects.filter(teacher=teacher).select_related('course', 'subject')

        # 3) agrupa por curso y cuenta estudiantes
        from collections import defaultdict
        courses_map = defaultdict(lambda: {
            "subjects": [], "student_count": 0, "grado": None
        })
        for cs in course_subjects:
            c = cs.course
            entry = courses_map[c.id]
            entry.update({
                "id": c.id,
                "name": c.name,
                "grado": c.grado.numero if c.grado else None,
                "student_count": c.students.count()
            })
            entry["subjects"].append({
                "id": cs.subject.id,
                "name": cs.subject.name,
                "course_subject_id": cs.id
            })

        courses = list(courses_map.values())

        # 4) estadísticas generales
        total_courses = len(courses)
        total_students = sum(c["student_count"] for c in courses)
        total_grades = len({c['grado'] for c in courses if c['grado'] is not None})

        return Response({
            "current_period": current_period,
            "total_courses": total_courses,
            "total_students": total_students,
            "total_grades": total_grades,
            "courses": courses
        })

    # GET /api/academic/teachers/me/courses/
    @action(detail=False, url_path='me/courses', methods=['get'])
    def me_courses(self, request):
        """
        Cursos del docente autenticado
        """
        teacher = getattr(request.user, 'teacher_profile', None)
        if teacher is None:
            return Response({"error": "Este usuario no es un docente"}, status=404)

        # Obtener todos los CourseSubject del docente
        course_subjects = CourseSubject.objects.filter(teacher=teacher).select_related('course', 'subject')
        
        # Agrupar por curso
        from collections import defaultdict
        courses_dict = defaultdict(lambda: {'subjects': []})
        
        for cs in course_subjects:
            course = cs.course
            if course.id not in courses_dict:
                courses_dict[course.id].update({
                    'id': course.id,
                    'name': course.name,
                    'grado': course.grado.numero if hasattr(course, 'grado') else None,
                    'student_count': course.students.count(),
                    'subjects': []
                })
            
            courses_dict[course.id]['subjects'].append({
                'id': cs.subject.id,
                'name': cs.subject.name,
                'course_subject_id': cs.id
            })
        
        # Convertir a lista
        courses_list = list(courses_dict.values())
        
        return Response({
            'teacher': {
                'id': teacher.id,
                'name': f"{teacher.first_name} {teacher.last_name}"
            },
            'courses': courses_list,
            'total_courses': len(courses_list)
        })

    # GET /api/academic/teachers/me/course/{course_id}/students/
    @action(detail=False, methods=['get'], url_path='me/course/(?P<course_id>[^/.]+)/students')
    def me_course_students(self, request, course_id=None):
        """
        GET /api/academic/teachers/me/course/{course_id}/students/
        Devuelve los estudiantes del curso y las materias que enseña el docente en ese curso
        """
        teacher = request.user.teacher_profile
    
        # 1. Validar que el docente enseña en ese curso
        if not CourseSubject.objects.filter(course__id=course_id, teacher=teacher).exists():
            return Response(
                {"error": "No estás asignado a ese curso."},
                status=status.HTTP_403_FORBIDDEN
            )
    
        # 2. Obtener estudiantes del curso
        students = Student.objects.filter(course__id=course_id).order_by('last_name', 'first_name')
    
        # 3. Obtener las materias (CourseSubject) que enseña este docente en ese curso
        course_subjects = CourseSubject.objects.filter(
            course__id=course_id, 
            teacher=teacher
        ).select_related('subject')
    
        # 4. Formatear las materias
        subjects = []
        for cs in course_subjects:
            subjects.append({
                "id": cs.subject.id,
                "name": cs.subject.name,
                "course_subject_id": cs.id,
                "subject_code": cs.subject.code if hasattr(cs.subject, 'code') else None
            })
    
        # 5. Serializar y responder
        return Response({
            "course_id": int(course_id),
            "students": StudentSerializer(students, many=True).data,
            "subjects": subjects,
            "total_students": students.count(),
            "total_subjects": len(subjects)
        }, status=status.HTTP_200_OK)

    # GET /api/academic/teachers/me/course/{course_id}/subject/{subject_id}/grades/
    @action(detail=False, url_path='me/course/(?P<course_id>[^/.]+)/subject/(?P<subject_id>[^/.]+)/grades', methods=['get'])
    def me_course_subject_grades(self, request, course_id=None, subject_id=None):
        """
        Calificaciones de una materia específica en un curso del docente autenticado
        """
        # Verificar que el teacher está asignado a esta materia en este curso
        course_subject = get_course_subject_if_teacher(request, course_id, subject_id)
        if isinstance(course_subject, Response):
            return course_subject
        
        # Obtener el periodo académico actual
        today = timezone.now().date()
        current_period = AcademicPeriod.objects.filter(
            start_date__lte=today,
            end_date__gte=today
        ).first()
        
        if not current_period:
            return Response({
                "error": "No hay periodo académico activo"
            }, status=400)
        
        # Obtener todas las calificaciones del periodo actual
        grade_entries = GradeEntry.objects.filter(
            assignment__course_subject=course_subject,
            assignment__period=current_period.number
        ).select_related('student', 'assignment').order_by('student__last_name', 'student__first_name', 'assignment__date_assigned')
        
        # Agrupar por estudiante
        from collections import defaultdict
        student_grades = defaultdict(list)
        
        for entry in grade_entries:
            student_grades[entry.student].append({
                'assignment_id': entry.assignment.id,
                'assignment_title': entry.assignment.name,
                'assignment_date': entry.assignment.date_assigned,
                'score': entry.score,
                'max_score': entry.assignment.max_score,
                'percentage': round((float(entry.score) / float(entry.assignment.max_score)) * 100, 2) if entry.assignment.max_score > 0 else 0
            })
        
        # Estructurar respuesta
        students_data = []
        for student, grades in student_grades.items():
            # Calcular promedio del estudiante
            total_percentage = sum(grade['percentage'] for grade in grades)
            average = round(total_percentage / len(grades), 2) if grades else 0
            
            students_data.append({
                'student_id': student.id,
                'student_name': f"{student.first_name} {student.last_name}",
                'grades': grades,
                'average': average,
                'total_assignments': len(grades)
            })
        
        return Response({
            'course': {
                'id': course_subject.course.id,
                'name': course_subject.course.name
            },
            'subject': {
                'id': course_subject.subject.id,
                'name': course_subject.subject.name
            },
            'period': {
                'number': current_period.number,
                'name': current_period.name
            },
            'students': students_data,
            'total_students': len(students_data)
        })

    # GET /api/academic/teachers/me/course/{course_id}/subject/{subject_id}/assignments/
    @action(detail=False, url_path='me/course/(?P<course_id>[^/.]+)/subject/(?P<subject_id>[^/.]+)/assignments', methods=['get'])
    def me_course_subject_assignments(self, request, course_id=None, subject_id=None):
        """
        Tareas de una materia específica en un curso del docente autenticado
        """
        # Verificar que el teacher está asignado a esta materia en este curso
        course_subject = get_course_subject_if_teacher(request, course_id, subject_id)
        if isinstance(course_subject, Response):
            return course_subject
        
        # Obtener las assignments ordenadas por fecha
        assignments = Assignment.objects.filter(
            course_subject=course_subject
        ).order_by('-date_assigned')  # Más recientes primero
        
        # Serializar y retornar
        serializer = AssignmentSerializer(assignments, many=True)
        return Response({
            'course': {
                'id': course_subject.course.id,
                'name': course_subject.course.name
            },
            'subject': {
                'id': course_subject.subject.id,
                'name': course_subject.subject.name
            },
            'assignments': serializer.data,
            'total_assignments': assignments.count()
        })

    # GET /api/academic/teachers/me/attendance/by_date/
    @action(detail=False, url_path='me/attendance/by_date', methods=['get'])
    def me_attendance_by_date(self, request):
        """
        Asistencia por fecha del docente autenticado
        GET /api/academic/teachers/me/attendance/by_date/?course_id=X&subject_id=Y&date=YYYY-MM-DD
        """
        # Reutilizar la misma lógica de attendance_by_date pero con validación de docente
        course_id = request.query_params.get("course_id")
        subject_id = request.query_params.get("subject_id")
        date_str = request.query_params.get("date")
        
        if not (course_id and subject_id and date_str):
            return Response({
                "error": "Parámetros requeridos: course_id, subject_id, date"
            }, status=400)
        
        # Verificar que el docente está asignado a esta materia en este curso
        course_subject = get_course_subject_if_teacher(request, course_id, subject_id)
        if isinstance(course_subject, Response):
            return course_subject
        
        try:
            date = timezone.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({
                "error": "Formato de fecha inválido. Use YYYY-MM-DD"
            }, status=400)
        
        students = course_subject.course.students.all()
        data = []
        
        for stu in students:
            from academic.models import Attendance
            record = Attendance.objects.filter(
                student=stu, 
                subject=course_subject.subject, 
                date=date
            ).first()
            
            data.append({
                "studentId": stu.id,
                "studentName": f"{stu.first_name} {stu.last_name}",
                "present": record.present if record else False,
                "id": record.id if record else None
            })
        
        return Response({
            'course': {
                'id': course_subject.course.id,
                'name': course_subject.course.name
            },
            'subject': {
                'id': course_subject.subject.id,
                'name': course_subject.subject.name
            },
            'date': date_str,
            'attendance': data
        })

class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        teacher = request.user.teacher_profile

        # Periodo actual
        today = timezone.now().date()
        current_period = AcademicPeriod.objects.filter(
            start_date__lte=today,
            end_date__gte=today
        ).first()

        # Cursos del docente
        courses = Course.objects.filter(course_subjects__teacher=teacher).distinct()

        # Serializar cursos
        from academic.serializers import CourseSerializerMinimal
        serialized_courses = CourseSerializerMinimal(courses, many=True).data

        return Response({
            "current_period": {
                "name": current_period.name,
                "number": current_period.number,
                "academic_year": current_period.academic_year
            } if current_period else None,
            "courses": serialized_courses
        })


class TeacherCoursesView(APIView):
    """
    GET /api/academic/teacher/courses/
    Listado de cursos donde el docente autenticado está asignado
    """
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        teacher = request.user.teacher_profile
        # ✅ Corregido: usar course_subjects en lugar de teachers
        courses = Course.objects.filter(course_subjects__teacher=teacher).distinct().prefetch_related('grado')
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TeacherCourseStudentsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, course_id):
        course = get_course_if_teacher(request, course_id)
        if isinstance(course, Response):
            return course

        # estudiantes
        students = course.students.all()
        students_data = StudentSerializer(students, many=True).data

        # materias que enseña este docente en este curso
        teacher = request.user.teacher_profile
        cs_qs = CourseSubject.objects.filter(course=course, teacher=teacher)
        subjects = [
          {"id": cs.subject.id, "name": cs.subject.name}
          for cs in cs_qs
        ]

        return Response({
          "id": course.id,
          "name": course.name,
          "grado": {"numero": course.grado.numero},
          "students": students_data,
          "subjects": subjects
        })


class TeacherCoursePDFView(APIView):
    """
    GET /api/academic/teacher/course/{course_id}/planilla-pdf/
    Genera un PDF con la planilla vacía de los estudiantes de un curso
    """
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, course_id):
        # ✅ Usar función helper unificada
        course = get_course_if_teacher(request, course_id)
        if isinstance(course, Response):
            return course

        students = course.students.all().order_by('last_name', 'first_name')

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        title = Paragraph(f"Planilla Vacía – Curso: {course.name}", styles['Heading2'])
        elements.append(title)
        elements.append(Spacer(1, 12))

        data = [
            ['ID Estudiante', 'Nombre Completo', 'Asistencias', 'Faltas', 'Nota Periodo', 'Observaciones']
        ]
        for est in students:
            full_name = f"{est.first_name} {est.last_name}"
            data.append([est.student_id, full_name, '', '', '', ''])

        table = Table(data, colWidths=[80, 150, 80, 80, 80, 100])
        ts = TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ])
        table.setStyle(ts)
        elements.append(table)

        doc.build(elements)
        buffer.seek(0)
        return Response(buffer.getvalue(), content_type='application/pdf')


class TeacherCourseSubjectGradesView(APIView):
    """
    GET /api/academic/teacher/course/{course_id}/subject/{subject_id}/grades/?period={period}
    Obtiene las notas de un curso en una materia y periodo determinado
    (solo si el docente está asignado a esa materia)
    """
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, course_id, subject_id):
        course_subject = get_course_subject_if_teacher(request, course_id, subject_id)
        if isinstance(course_subject, Response):
            return course_subject

        period = request.query_params.get('period')
        if not period:
            return Response({"error": "Debes indicar período (?period=)."}, status=status.HTTP_400_BAD_REQUEST)

        assignments = Assignment.objects.filter(course_subject=course_subject, period=period)
        grade_entries = GradeEntry.objects.filter(
            assignment__in=assignments,
            student__course__id=course_id
        ).select_related('student', 'assignment')

        result = []
        for est in course_subject.course.students.all():
            entries_est = grade_entries.filter(student=est)
            notas = []
            detalles = []

            for ge in entries_est:
                notas.append(float(ge.score))
                detalles.append({
                    'entryId': ge.id,
                    'assignmentId': ge.assignment.id,
                    'weight': ge.assignment.weight,
                    'score': float(ge.score)
                })

            avg = round(sum(notas) / len(notas), 2) if notas else None
            result.append({
                'student': {
                    'id': est.id,
                    'name': f"{est.first_name} {est.last_name}",
                    'student_id': est.student_id,
                },
                'notas': notas,
                'entries': detalles,
                'promedio': avg
            })

        return Response(result, status=status.HTTP_200_OK)


class TeacherStudentSubjectAnalysisView(APIView):
    """
    GET /api/academic/teacher/student/{student_id}/analysis/?subject_id={subject_id}
    Análisis IA del estudiante en una materia para el periodo actual (solo si el docente enseña esa materia)
    """
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_current_period(self):
        today = timezone.now().date()
        try:
            return AcademicPeriod.objects.get(start_date__lte=today, end_date__gte=today)
        except AcademicPeriod.DoesNotExist:
            return None

    def get(self, request, student_id):
        teacher = request.user.teacher_profile
        subject_id = request.query_params.get('subject_id')
        if not subject_id:
            return Response({"error": "Debes indicar ?subject_id="}, status=status.HTTP_400_BAD_REQUEST)

        student = get_object_or_404(Student, pk=student_id)
        
        # ✅ Usar función helper para verificar autorización
        if not is_teacher_assigned_to_subject(student.course.id, subject_id, teacher):
            return Response({"error": "No autorizado para esta materia en este curso."}, status=status.HTTP_403_FORBIDDEN)

        period_obj = self.get_current_period()
        if not period_obj:
            return Response({"error": "No hay periodo académico activo."}, status=status.HTTP_400_BAD_REQUEST)

        current_period = period_obj.number
        from analytics.services import analizar_rendimiento_estudiante_completo

        full_analysis = analizar_rendimiento_estudiante_completo(student)
        materia_obj = get_object_or_404(Subject, pk=subject_id)
        materia_nombre = materia_obj.name

        promedios_materias = [
            m for m in full_analysis.get("promedios_por_materia", [])
            if m["materia"] == materia_nombre
        ]
        resumen_periodo = [
            p for p in full_analysis.get("resumen_por_periodo", [])
            if p["periodo"] == current_period
        ]

        data = {
            "student": {
                "id": student.id,
                "name": f"{student.first_name} {student.last_name}",
                "student_id": student.student_id
            },
            "subject": {
                "id": materia_obj.id,
                "name": materia_nombre
            },
            "period": current_period,
            "analysis_subject": {
                "promedio_materia": promedios_materias[0] if promedios_materias else None,
                "detalle_periodo": resumen_periodo[0] if resumen_periodo else None,
                "informe_narrativo": full_analysis.get("informe_narrativo", "")
            }
        }
        return Response(data, status=status.HTTP_200_OK)