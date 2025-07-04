#C:\Users\germa\Desktop\academic_system\backend\academic\views\studentIA_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.db.models import Avg, Count, Q, Prefetch

from academic.models import (
    Student, Attendance, Grade, Assignment, CourseSubject, GradeEntry
)
from academic.serializers import StudentProfileSerializer

class StudentIAAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """
        GET /api/academic/students/{pk}/ia-analysis/
        Devuelve análisis IA completo del estudiante incluyendo:
        - Datos básicos del perfil
        - Análisis de asistencia
        - Análisis de calificaciones  
        - Análisis IA con predicciones y recomendaciones
        - Comparación de promedios por materia (estudiante vs curso vs grado)
        """
        try:
            student = Student.objects.select_related('course', 'grado').get(pk=pk)
        except Student.DoesNotExist:
            return Response({"error": "Estudiante no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        student_data = StudentProfileSerializer(student).data

        # Análisis de asistencia con validación mejorada
        attends = Attendance.objects.filter(student=student)
        total_days = attends.count()
        present_days = attends.filter(present=True).count()
        absent_days = total_days - present_days
        
        # Validación explícita para división por cero
        if total_days > 0:
            attendance_rate = round((present_days / total_days) * 100, 2)
        else:
            attendance_rate = 0.0

        att_by_subject = (
            attends
            .values('subject__name')
            .annotate(present_count=Count('id', filter=Q(present=True)),
                      total=Count('id'))
        )
        asistencia_por_materia = {
            rec['subject__name']: round((rec['present_count'] / rec['total']) * 100, 2)
            for rec in att_by_subject
            if rec['subject__name'] is not None and rec['total'] > 0
        }

        # Análisis de calificaciones
        grades = Grade.objects.filter(student=student, course=student.course)
        avg_overall = grades.aggregate(avg=Avg('value'))['avg'] or 0.0
        avg_by_period = {
            g['period']: round(g['value__avg'], 2)
            for g in grades.values('period').annotate(value__avg=Avg('value'))
            if g['value__avg'] is not None
        }
        
        # Corregir el análisis de calificaciones por materia
        grades_by_subject = {}
        if student.course:
            for cs in CourseSubject.objects.filter(course=student.course).select_related('subject'):
                subj_name = cs.subject.name
                
                entries_avg = GradeEntry.objects.filter(
                    student=student,
                    assignment__course_subject=cs
                ).aggregate(avg=Avg('score'))

                if entries_avg['avg'] is not None:
                    grades_by_subject[subj_name] = round(entries_avg['avg'], 2)

        # NUEVO: Promedios comparativos por materia: estudiante vs curso vs grado
        comparative_subject_averages = []

        if student.course and student.grado:
            # Obtener todos los periodos existentes para ese curso o estudiante (opcional)
            period_list = GradeEntry.objects.filter(
                assignment__course_subject__course=student.course,
                student=student
            ).values_list('assignment__period', flat=True).distinct()

            for period in period_list:
                for cs in CourseSubject.objects.filter(course=student.course).select_related('subject'):
                    subj_name = cs.subject.name
                    
                    student_avg = GradeEntry.objects.filter(
                        student=student,
                        assignment__course_subject=cs,
                        assignment__period=period
                    ).aggregate(avg=Avg('score'))['avg'] or 0
                    
                    course_avg = GradeEntry.objects.filter(
                        assignment__course_subject=cs,
                        assignment__period=period
                    ).aggregate(avg=Avg('score'))['avg'] or 0
                    
                    course_ids_in_grade = student.grado.courses.values_list('id', flat=True)
                    grade_avg = GradeEntry.objects.filter(
                        assignment__course_subject__subject=cs.subject,
                        assignment__course_subject__course__in=course_ids_in_grade,
                        assignment__period=period
                    ).aggregate(avg=Avg('score'))['avg'] or 0
                    
                    comparative_subject_averages.append({
                        "subject_name": subj_name,
                        "period": period,
                        "student_avg": round(student_avg, 2),
                        "course_avg": round(course_avg, 2),
                        "grade_avg": round(grade_avg, 2),
                        "performance_vs_course": round(student_avg - course_avg, 2) if student_avg > 0 and course_avg > 0 else 0,
                        "performance_vs_grade": round(student_avg - grade_avg, 2) if student_avg > 0 and grade_avg > 0 else 0
                    })

        # NUEVO: Crear diccionario resumen para análisis IA
        comparative_averages_dict = {}
        for item in comparative_subject_averages:
            subj = item['subject_name']
            # Si ya existe la materia, mantenemos el último periodo (o podrías hacer promedio)
            # Para este ejemplo, tomamos el último valor que aparezca
            comparative_averages_dict[subj] = {
                "performance_vs_course": item["performance_vs_course"],
                "performance_vs_grade": item["performance_vs_grade"],
                "period": item["period"]  # Información adicional por si es útil
            }

       # OPCIÓN B: Obtener TODAS las actividades del curso (con y sin calificaciones) - CORREGIDO
        actividades = []
        late_count = 0

        if student.course:
            seen_ids = set()

            assignments = Assignment.objects.filter(
                course_subject__course=student.course
            ).select_related('course_subject__subject').prefetch_related(
                Prefetch(
                    'grade_entries',
                    queryset=GradeEntry.objects.filter(student=student),
                    to_attr='student_entries'
                )
            ).order_by('id')



            for a in assignments:
                # Evitar agregar actividades duplicadas
                if a.id in seen_ids:
                    continue
                seen_ids.add(a.id)

                ge = None
                # Validación extra: evitar múltiples entradas para un mismo estudiante y actividad
                if a.student_entries:
                    # Si hay más de una, tomamos la más reciente (si hay timestamps), o la de mayor puntaje
                    if len(a.student_entries) == 1:
                        ge = a.student_entries[0]
                    else:
                        # ordena por puntaje descendente como fallback (puedes cambiar esto)
                        ge = sorted(a.student_entries, key=lambda x: x.score if x.score is not None else 0, reverse=True)[0]

                actividades.append({
                    "id": a.id,
                    "name": a.name,
                    "subject": a.course_subject.subject.name,
                    "period": a.period,
                    "type": a.assignment_type,
                    "due_date": a.due_date,
                    "score": float(ge.score) if ge and ge.score is not None else None,
                    "late": ge.late_submission if ge else False,
                    "weight": a.weight,
                    "has_grade": ge is not None and ge.score is not None,
                })

                if ge and ge.late_submission:
                    late_count += 1


        try:
            ia_result = self._predict_risk_for_student(student, {
                'attendance_rate': attendance_rate,
                'avg_overall': avg_overall,
                'late_submissions': late_count,
                'grades_by_subject': grades_by_subject,
                'avg_by_period': avg_by_period,
                'comparative_averages': comparative_averages_dict  # Pasamos el diccionario
            })
        except Exception as e:
            return Response({"error": f"Error en análisis IA: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response_data = {
            "student": student_data,
            "attendance": {
                "total_days": total_days,
                "present_days": present_days,
                "absent_days": absent_days,
                "attendance_rate": attendance_rate,
                "by_subject": asistencia_por_materia
            },
            "grades_summary": {
                "average_overall": round(avg_overall, 2),
                "average_by_period": avg_by_period,
                "grades_by_subject": grades_by_subject,
                "late_submissions": late_count,
                "activities": actividades
            },
            "subject_comparison": comparative_subject_averages,  # Lista para frontend
            "ia_analysis": ia_result
        }

        return Response(response_data)

    def _predict_risk_for_student(self, student, metrics):
        """
        Función interna que realiza el análisis IA del estudiante.
        Aquí puedes integrar tu modelo de ML entrenado.
        """
        attendance_rate = metrics['attendance_rate']
        avg_overall = metrics['avg_overall']
        late_submissions = metrics['late_submissions']
        grades_by_subject = metrics['grades_by_subject']
        comparative_averages = metrics.get('comparative_averages', {})  # Ahora es diccionario

        risk_factors = []
        subjects_at_risk = []
        
        # Identificar factores de riesgo
        if attendance_rate < 75:
            risk_factors.append("Baja asistencia")
        if avg_overall < 3.0:
            risk_factors.append("Promedio bajo")
        if late_submissions > 3:
            risk_factors.append("Entregas tardías frecuentes")

        # Identificar materias en riesgo
        for subject, grade in grades_by_subject.items():
            if grade < 3.0:
                subjects_at_risk.append(subject)

        # NUEVO: Identificar materias donde el estudiante está por debajo del promedio del curso/grado
        underperforming_subjects = []
        for subject, comparison in comparative_averages.items():  # Ahora itera correctamente sobre diccionario
            if comparison['performance_vs_course'] < -0.5:  # Más de 0.5 puntos por debajo del curso
                underperforming_subjects.append(f"{subject} (vs curso)")
            if comparison['performance_vs_grade'] < -0.5:  # Más de 0.5 puntos por debajo del grado
                underperforming_subjects.append(f"{subject} (vs grado)")

        # Cálculo de risk_index más claro y modular
        risk_score = 0
        
        # Factor de asistencia (peso: 0.3)
        if attendance_rate < 75:
            risk_score += 0.3
        
        # Factor de promedio general (peso: 0.4)
        if avg_overall < 3.0:
            risk_score += 0.4
        
        # Factor de entregas tardías (peso: 0.2)
        if late_submissions > 3:
            risk_score += 0.2
        
        # Factor de materias en riesgo (peso: 0.1)
        if len(subjects_at_risk) > 0:
            risk_score += 0.1
        
        # NUEVO: Factor de rendimiento comparativo (peso: 0.1)
        if len(underperforming_subjects) > 2:
            risk_score += 0.1
        
        # Asegurar que el índice esté entre 0 y 1
        risk_index = min(1.0, risk_score)

        # Calcular confianza basada en factores de riesgo
        confidence = 0.85 if len(risk_factors) > 0 else 0.95

        # Generar recomendaciones
        recommendations = []
        if attendance_rate < 80:
            recommendations.append("Mejorar asistencia a clases")
        if avg_overall < 3.5:
            recommendations.append("Reforzar estudio en materias con bajo rendimiento")
        if late_submissions > 2:
            recommendations.append("Trabajar en organización y gestión del tiempo")
        if len(subjects_at_risk) > 0:
            recommendations.append(f"Considerar tutorías en: {', '.join(subjects_at_risk)}")
        if len(underperforming_subjects) > 0:
            recommendations.append(f"Reforzar en materias donde está por debajo del promedio: {', '.join(set(underperforming_subjects))}")

        # Análisis por tipo de evaluación
        evaluation_breakdown = {}
        if student.course:
            for assignment in Assignment.objects.filter(course_subject__course=student.course):
                assignment_type = assignment.assignment_type
                if assignment_type not in evaluation_breakdown:
                    evaluation_breakdown[assignment_type] = {"scores": [], "count": 0}
                
                # CORRECCIÓN: Usar grade_entries en lugar de entries
                entry = assignment.grade_entries.filter(student=student).first()
                if entry:
                    evaluation_breakdown[assignment_type]["scores"].append(float(entry.score))
                    evaluation_breakdown[assignment_type]["count"] += 1

        # Calcular promedios por tipo de evaluación con validación de división por cero
        for eval_type, data in evaluation_breakdown.items():
            if data["scores"] and len(data["scores"]) > 0:
                data["average"] = round(sum(data["scores"]) / len(data["scores"]), 2)
            else:
                data["average"] = 0
            del data["scores"]

        return {
            "risk_index": round(risk_index, 2),
            "confidence": round(confidence, 2),
            "risk_factors": risk_factors,
            "subjects_at_risk": subjects_at_risk,
            "underperforming_subjects": underperforming_subjects,
            "evaluation_type_breakdown": evaluation_breakdown,
            "trend_over_periods": metrics['avg_by_period'],
            "recommendations": recommendations
        }