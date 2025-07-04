# C:\Users\germa\Desktop\academic_system\backend\academic\views\admin_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from collections import defaultdict
from academic.models import (
    Teacher, CourseSubject, Assignment, GradeEntry, 
    Attendance, AcademicPeriod
)
from analytics.course_analysis_service import get_course_subject_full_analysis
from collections import OrderedDict
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