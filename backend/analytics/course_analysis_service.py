# C:\Users\germa\Desktop\academic_system\backend\analytics\course_analysis_service.py
from collections import OrderedDict
from django.db.models import Avg
from academic.models import CourseSubject, Student, GradeEntry, Attendance
from analytics.services import predecir_riesgo_estudiante

def analizar_estudiante_en_subject_period(student, course_subject_id: int, period: int) -> float:
    """
    Devuelve el valor de 'riesgo' que predice la IA para un estudiante
    en un CourseSubject y periodo dado.
    """
    # Filtra únicamente las calificaciones de esa materia y periodo
    entries = GradeEntry.objects.filter(
        student=student,
        assignment__course_subject_id=course_subject_id,
        assignment__period=period
    )
    if not entries.exists():
        return None
    # Llama a tu servicio de ML; asumimos que predecir_riesgo_estudiante
    # puede adaptarse a recibir una queryset de GradeEntry en lugar de un Student.
    # Si no, tendrás que crear un wrapper que construya un objeto temporal.
    result = predecir_riesgo_estudiante(entries)
    return result.get("riesgo")

def analizar_rendimiento_en_subject_period(student: Student, course_subject_id: int, period: int) -> dict:
    """
    Análisis completo del rendimiento del estudiante en una materia y periodo específico.
    Maneja robustamente los casos donde el estudiante no tiene notas.
    """
    from datetime import date
    from analytics.services import predecir_riesgo_estudiante
    
    entries = GradeEntry.objects.filter(
        student=student,
        assignment__course_subject_id=course_subject_id,
        assignment__period=period
    ).select_related('assignment__course_subject__subject', 'assignment')
    
    # Datos básicos del estudiante que siempre incluimos
    course_name = student.course.name if student.course else "Sin curso"
    
    # MEJORADO: Manejo robusto de casos sin notas
    if not entries.exists():
        # Buscar si tiene entradas en otras materias o periodos
        otros_entries = GradeEntry.objects.filter(student=student)
        otros_periodos = sorted(list(otros_entries.values_list("assignment__period", flat=True).distinct()))
        otras_materias = list(otros_entries.values_list("assignment__course_subject__subject__name", flat=True).distinct())
        
        # Construir mensaje informativo
        mensaje = "No hay notas para este estudiante en esta materia y periodo."
        if otros_entries.exists():
            mensaje += f" Sin embargo, tiene notas en otras materias: {otras_materias} y/o en otros periodos: {otros_periodos}."
        else:
            mensaje += " Este estudiante no tiene notas registradas aún."
        
        return {
            "student_id": student.id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "segundo_apellido": getattr(student, 'second_last_name', ''),
            "student_email": student.user.email,
            "curso": course_name,
            "course_subject_id": course_subject_id,
            "period": period,
            "promedio_general": None,
            "prediccion_riesgo": None,
            "nota_min": None,
            "nota_max": None,
            "asistencia": None,
            "asistencia_periodo": None,
            "resumen_por_periodo": [],
            "mensaje": mensaje
        }
    
    # Datos base (cuando SÍ hay notas)
    materia = entries.first().assignment.course_subject.subject.name
    
    # Promedio de notas y recuentos
    notas = []
    tareas = []
    examenes = []
    tipos = {}
    entregas_tarde = 0
    
    for entry in entries:
        # Validación de datos antes de calcular
        if entry.assignment.max_score <= 0:
            continue  # Evitar división por cero
            
        score = (float(entry.score) / float(entry.assignment.max_score)) * 5.0
        nota = round(score, 2)
        notas.append(nota)
        
        tipo = entry.assignment.assignment_type
        tipos.setdefault(tipo, []).append(nota)
        
        if tipo == "TAREA" or tipo == "PROYECTO":
            tareas.append(nota)
        if tipo == "EXAMEN":
            examenes.append(nota)
        if entry.late_submission:
            entregas_tarde += 1
    
    # Verificar que tengamos notas válidas después del filtrado
    if not notas:
        return {
            "student_id": student.id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "segundo_apellido": getattr(student, 'second_last_name', ''),
            "student_email": student.user.email,
            "curso": course_name,
            "course_subject_id": course_subject_id,
            "period": period,
            "promedio_general": None,
            "prediccion_riesgo": None,
            "nota_min": None,
            "nota_max": None,
            "asistencia": None,
            "asistencia_periodo": None,
            "resumen_por_periodo": [],
            "mensaje": "Las notas encontradas no son válidas para el cálculo."
        }
    
    promedio_general = round(sum(notas) / len(notas), 2)
    
    # Métricas adicionales de notas
    nota_min = min(notas) if notas else None
    nota_max = max(notas) if notas else None
    
    # Distribución de tipos de evaluación
    distribucion_tipos = {}
    if tipos:
        total_evaluaciones = sum(len(scores) for scores in tipos.values())
        for tipo, scores in tipos.items():
            distribucion_tipos[tipo] = {
                "cantidad": len(scores),
                "porcentaje": round((len(scores) / total_evaluaciones) * 100, 1)
            }
    
    # Otros datos personales
    edad = (date.today() - student.date_of_birth).days // 365 if student.date_of_birth else 0
    estrato_str = (student.socioeconomic_status or "").upper()
    estrato_map = {
        "BAJO_BAJO": 1, "BAJO": 2, "MEDIO_BAJO": 3, "MEDIO": 4, "MEDIO_ALTO": 5, "ALTO": 6
    }
    estrato = estrato_map.get(estrato_str, 3)
    
    # Asistencia general del estudiante (mantenemos para compatibilidad)
    total_asistencias = Attendance.objects.filter(student=student).count()
    presentes = Attendance.objects.filter(student=student, present=True).count()
    asistencia = round(presentes / total_asistencias, 2) if total_asistencias > 0 else 0.0
    
    from academic.models import AcademicPeriod
    # Asistencia del estudiante en esta materia y periodo
    try:
        periodo_actual = AcademicPeriod.objects.get(number=period, academic_year="2024-2025")
        asistencias_periodo = Attendance.objects.filter(
            student=student,
            subject__id=course_subject_id,
            date__range=(periodo_actual.start_date, periodo_actual.end_date)
        )
    except AcademicPeriod.DoesNotExist:
        asistencias_periodo = Attendance.objects.none()

    if asistencias_periodo.exists():
        presentes_periodo = asistencias_periodo.filter(present=True).count()
        asistencia_periodo = round(presentes_periodo / asistencias_periodo.count(), 2)
    else:
        asistencia_periodo = asistencia  # Fallback general
    
    # Evolución por periodo - agregado para solucionar el gráfico vacío
    resumen_por_periodo = []
    all_periods = GradeEntry.objects.filter(
        student=student,
        assignment__course_subject_id=course_subject_id
    ).values_list('assignment__period', flat=True).distinct()
    
    for p in sorted(all_periods):
        period_entries = GradeEntry.objects.filter(
            student=student,
            assignment__course_subject_id=course_subject_id,
            assignment__period=p
        )
        if period_entries.exists():
            notas_p = []
            for entry in period_entries:
                if entry.assignment.max_score > 0:  # Validación adicional
                    nota = (float(entry.score) / float(entry.assignment.max_score)) * 5.0
                    notas_p.append(nota)
            if notas_p:  # Solo agregar si hay notas válidas
                resumen_por_periodo.append({
                    "periodo": p,
                    "nota": round(sum(notas_p) / len(notas_p), 2)
                })
    
    # Riesgo IA - Solo si hay entries válidos
    try:
        prediccion_riesgo = predecir_riesgo_estudiante(entries)
    except Exception as e:
        prediccion_riesgo = {"riesgo": None, "error": str(e)}
    
    return {
        "student_id": student.id,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "segundo_apellido": getattr(student, 'second_last_name', ''),
        "student_email": student.user.email,
        "curso": course_name,
        "course_subject_id": course_subject_id,
        "materia": materia,
        "period": period,
        "promedio_general": promedio_general,
        "nota_min": nota_min,
        "nota_max": nota_max,
        "total_evaluaciones": len(notas),
        "promedio_tareas": round(sum(tareas)/len(tareas), 2) if tareas else None,
        "promedio_examenes": round(sum(examenes)/len(examenes), 2) if examenes else None,
        "entregas_tardias": entregas_tarde,
        "asistencia": asistencia,
        "asistencia_periodo": asistencia_periodo,
        "edad": edad,
        "estrato": estrato,
        "promedios_por_tipo": {
            tipo: {
                "promedio": round(sum(scores) / len(scores), 2),
                "evaluaciones": len(scores)
            } for tipo, scores in tipos.items()
        },
        "distribucion_tipos": distribucion_tipos,
        "resumen_por_periodo": resumen_por_periodo,
        "prediccion_riesgo": prediccion_riesgo
    }

def get_course_subject_full_analysis(course_id: int, subject_id: int, period: int) -> dict:
    """
    - realAverage: promedio real del curso en el periodo
    - iaAverage: promedio de IA (con student reports)
    - periodComparisons: promedios reales de todos los periodos
    - siblingCourses: promedios reales de cursos hermanos
    - studentReports: lista de informes por estudiante
    - highPerformancePct: porcentaje de estudiantes con promedio >= 4.0
    - lowPerformancePct: porcentaje de estudiantes con promedio < 3.0
    - promediosPorTipoCurso: promedios por tipo de evaluación del curso
    - avgAsistenciaCurso: promedio de asistencia del curso
    """
    # 1) CourseSubject y estudiantes
    cs = CourseSubject.objects.get(course_id=course_id, subject_id=subject_id)
    students = Student.objects.filter(course=cs.course)
    
    # Obtener información del docente asignado
    teacher_name = "No asignado"
    try:
        # Buscar el docente asignado a esta materia del curso
        # Asumiendo que tienes una relación Teacher -> CourseSubject
        if hasattr(cs, 'teacher') and cs.teacher:
            teacher_name = f"{cs.teacher.first_name} {cs.teacher.last_name}".strip()
        elif hasattr(cs, 'teachers') and cs.teachers.exists():
            # Si es una relación ManyToMany, tomar el primer docente
            first_teacher = cs.teachers.first()
            teacher_name = f"{first_teacher.first_name} {first_teacher.last_name}".strip()
    except:
        teacher_name = "No asignado"
    
    # 2) Informes por estudiante
    reports = [analizar_rendimiento_en_subject_period(s, cs.id, period) for s in students]
    
    # 3) Promedios básicos - MEJORADO: Manejo robusto de None
    real_avgs = [r["promedio_general"] for r in reports if r.get("promedio_general") is not None]
    ia_avgs = []
    for r in reports:
        if (r.get("prediccion_riesgo") and 
            isinstance(r["prediccion_riesgo"], dict) and 
            r["prediccion_riesgo"].get("riesgo") is not None):
            ia_avgs.append(r["prediccion_riesgo"]["riesgo"])
    
    real_avg = round(sum(real_avgs)/len(real_avgs), 2) if real_avgs else 0.0
    ia_avg = round(sum(ia_avgs)/len(ia_avgs), 2) if ia_avgs else 0.0
    
    # 4) Distribución de rendimiento - MEJORADO: Verificación de None
    buenos = sum(1 for r in reports if r.get("promedio_general") is not None and r["promedio_general"] >= 4.0)
    riesgo = sum(1 for r in reports if r.get("promedio_general") is not None and r["promedio_general"] < 3.0)
    total = len([r for r in reports if r.get("promedio_general") is not None])
    high_perf_pct = round((buenos / total) * 100, 1) if total > 0 else 0
    low_perf_pct = round((riesgo / total) * 100, 1) if total > 0 else 0
    
    # 5) Promedios por tipo en el curso
    tipos_acumulados = {}
    for r in reports:
        for tipo, datos in r.get("promedios_por_tipo", {}).items():
            if tipo not in tipos_acumulados:
                tipos_acumulados[tipo] = []
            # Agregamos cada nota según la cantidad de evaluaciones
            tipos_acumulados[tipo].extend([datos["promedio"]] * datos["evaluaciones"])
    
    promedios_por_tipo = {}
    for tipo, notas in tipos_acumulados.items():
        if notas:
            promedios_por_tipo[tipo] = round(sum(notas) / len(notas), 2)
    
    # 6) Asistencia promedio del curso (solo asistencia general)
    asistencias = [r.get("asistencia") for r in reports if r.get("asistencia") is not None]
    avg_asistencia = round(sum(asistencias) / len(asistencias), 2) if asistencias else 0.0
    
    # 7) Comparativa de periodos reales
    period_comparisons = OrderedDict()
    all_periods = GradeEntry.objects.filter(
        assignment__course_subject=cs
    ).values_list("assignment__period", flat=True).distinct()
    
    for p in sorted(all_periods):
        avg_p = GradeEntry.objects.filter(
            assignment__course_subject=cs, 
            assignment__period=p
        ).aggregate(avg=Avg("score"))["avg"] or 0.0
        period_comparisons[p] = round(avg_p, 2)
    
    # 8) Cursos hermanos
    grado = cs.course.grado
    siblings = CourseSubject.objects.filter(
        course__grado=grado, subject=cs.subject
    )
    sibling_courses = []
    for sib in siblings:
        avg_sib = GradeEntry.objects.filter(
            assignment__course_subject=sib, assignment__period=period
        ).aggregate(avg=Avg("score"))["avg"] or 0.0
        sibling_courses.append({
            "courseId": sib.course_id,
            "courseName": sib.course.name,
            "subjectName": cs.subject.name,
            "average": round(avg_sib, 2)
        })
    
    return {
        "realAverage": real_avg,
        "iaAverage": ia_avg,
        "metadata": {
            "courseName": cs.course.name,
            "subjectName": cs.subject.name,
            "teacherName": teacher_name,
            "period": period,
            "courseId": course_id,
            "subjectId": subject_id,
        },
        "highPerformancePct": high_perf_pct,
        "lowPerformancePct": low_perf_pct,
        "promediosPorTipoCurso": promedios_por_tipo,
        "avgAsistenciaCurso": avg_asistencia,
        "periodComparisons": period_comparisons,
        "siblingCourses": sibling_courses,
        "studentReports": reports
    }

def get_student_course_subject_analysis(course_id: int, subject_id: int, student_id: int, period_id: int, academic_year: str = "2024-2025") -> dict:
    """
    Análisis específico de un estudiante en una materia y periodo,
    reutilizando la lógica de análisis usada para el análisis completo del curso.
    """
    try:
        student = Student.objects.get(id=student_id)
        course_subject = CourseSubject.objects.get(course_id=course_id, subject_id=subject_id)
    except (Student.DoesNotExist, CourseSubject.DoesNotExist):
        return {
            "error": "Estudiante o materia no encontrada.",
            "student_id": student_id,
            "course_id": course_id,
            "subject_id": subject_id,
            "period_id": period_id
        }

    # Reutiliza la lógica de análisis centralizada
    report = analizar_rendimiento_en_subject_period(
        student=student,
        course_subject_id=course_subject.id,
        period=period_id
    )

    # Enriquecer si deseas campos adicionales para la vista individual
    report["course_id"] = course_id
    report["subject_id"] = subject_id
    report["period_id"] = period_id

    return report