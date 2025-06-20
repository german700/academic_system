# C:\Users\germa\Desktop\academic_system\backend\academic\views\teacherIA_view.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from academic.models import Course, Subject, Student, CourseSubject
from analytics.course_analysis_service import (
    get_course_subject_full_analysis,
    get_student_course_subject_analysis
)


class TeacherIAViewSet(viewsets.ViewSet):
    """
    ViewSet para funcionalidades de IA dirigidas a profesores
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='course-analysis')
    def course_analysis(self, request):
        """
        Análisis completo de un curso-materia en un periodo específico
        GET /api/academic/teachers/ia/course-analysis/?course_id=1&subject_id=2&period=1
        """
        try:
            course_id = request.query_params.get('course_id')
            subject_id = request.query_params.get('subject_id')
            period = request.query_params.get('period')

            if not all([course_id, subject_id, period]):
                return Response({
                    'error': 'Parámetros requeridos: course_id, subject_id, period'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validar que existan los objetos
            get_object_or_404(Course, id=course_id)
            get_object_or_404(Subject, id=subject_id)
            get_object_or_404(CourseSubject, course_id=course_id, subject_id=subject_id)

            # Obtener análisis completo
            analysis = get_course_subject_full_analysis(
                course_id=int(course_id),
                subject_id=int(subject_id),
                period=int(period)
            )

            return Response(analysis, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Error en análisis del curso: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='student-analysis')
    def student_analysis(self, request):
        """
        Análisis específico de un estudiante en una materia y periodo
        GET /api/academic/teachers/ia/student-analysis/?course_id=1&subject_id=2&student_id=3&period=1
        """
        try:
            course_id = request.query_params.get('course_id')
            subject_id = request.query_params.get('subject_id')
            student_id = request.query_params.get('student_id')
            period = request.query_params.get('period')

            if not all([course_id, subject_id, student_id, period]):
                return Response({
                    'error': 'Parámetros requeridos: course_id, subject_id, student_id, period'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validar que existan los objetos
            get_object_or_404(Course, id=course_id)
            get_object_or_404(Subject, id=subject_id)
            get_object_or_404(Student, id=student_id, course_id=course_id)
            get_object_or_404(CourseSubject, course_id=course_id, subject_id=subject_id)

            # Obtener análisis del estudiante
            analysis = get_student_course_subject_analysis(
                course_id=int(course_id),
                subject_id=int(subject_id),
                student_id=int(student_id),
                period_id=int(period)
            )

            return Response(analysis, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Error en análisis del estudiante: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='course-recommendations')
    def course_recommendations(self, request):
        """
        Recomendaciones generales para un curso basadas en IA
        GET /api/academic/teachers/ia/course-recommendations/?course_id=1&subject_id=2&period=1
        """
        try:
            course_id = request.query_params.get('course_id')
            subject_id = request.query_params.get('subject_id')
            period = request.query_params.get('period')

            if not all([course_id, subject_id, period]):
                return Response({
                    'error': 'Parámetros requeridos: course_id, subject_id, period'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Obtener análisis completo para generar recomendaciones
            analysis = get_course_subject_full_analysis(
                course_id=int(course_id),
                subject_id=int(subject_id),
                period=int(period)
            )

            # Generar recomendaciones basadas en el análisis
            recommendations = self._generate_course_recommendations(analysis)

            return Response({
                'course_id': course_id,
                'subject_id': subject_id,
                'period': period,
                'recommendations': recommendations,
                'analysis_summary': {
                    'realAverage': analysis.get('realAverage', 0),
                    'iaAverage': analysis.get('iaAverage', 0),
                    'totalStudents': len(analysis.get('studentReports', []))
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Error generando recomendaciones: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _generate_course_recommendations(self, analysis):
        """
        Genera recomendaciones basadas en el análisis del curso
        """
        recommendations = []
        real_avg = analysis.get('realAverage', 0)
        ia_avg = analysis.get('iaAverage', 0)
        student_reports = analysis.get('studentReports', [])

        # Análisis de rendimiento general
        if real_avg < 3.0:
            recommendations.append({
                'type': 'warning',
                'title': 'Rendimiento Bajo del Curso',
                'description': f'El promedio del curso ({real_avg}) está por debajo del mínimo esperado.',
                'actions': [
                    'Revisar metodología de enseñanza',
                    'Implementar actividades de refuerzo',
                    'Considerar tutorías grupales'
                ]
            })

        # Análisis de predicciones IA
        high_risk_students = [
            s for s in student_reports
            if s.get("prediccion_riesgo") and s["prediccion_riesgo"].get("riesgo", 0) > 0.7
        ]
        if len(high_risk_students) > len(student_reports) * 0.3:  # Más del 30%
            recommendations.append({
                'type': 'alert',
                'title': 'Alto Riesgo Académico',
                'description': f'{len(high_risk_students)} estudiantes en alto riesgo.',
                'actions': [
                    'Intervención inmediata requerida',
                    'Contactar padres de familia',
                    'Plan de recuperación personalizado'
                ]
            })

        # Comparación con cursos hermanos
        sibling_courses = analysis.get('siblingCourses', [])
        if sibling_courses:
            sibling_avg = sum(s['average'] for s in sibling_courses) / len(sibling_courses)
            if real_avg < sibling_avg - 0.5:
                recommendations.append({
                    'type': 'info',
                    'title': 'Rendimiento Comparativo',
                    'description': f'El curso está {sibling_avg - real_avg:.1f} puntos por debajo del promedio de cursos similares.',
                    'actions': [
                        'Comparar metodologías con otros profesores',
                        'Revisar material didáctico',
                        'Coordinar con otros docentes del grado'
                    ]
                })

        # Recomendaciones positivas
        if real_avg >= 4.0 and ia_avg >= 4.0:
            recommendations.append({
                'type': 'success',
                'title': 'Excelente Rendimiento',
                'description': 'El curso muestra un rendimiento excepcional.',
                'actions': [
                    'Mantener metodología actual',
                    'Compartir buenas prácticas',
                    'Considerar actividades de profundización'
                ]
            })

        return recommendations if recommendations else [{
            'type': 'info',
            'title': 'Rendimiento Normal',
            'description': 'El curso presenta un rendimiento dentro de los parámetros esperados.',
            'actions': ['Continuar con el seguimiento regular']
        }]

    def list(self, request):
        """
        Endpoint principal que muestra información general del módulo IA
        """
        return Response({
            'message': 'Módulo de IA para Profesores',
            'version': '1.0',
            'available_endpoints': [
                '/api/academic/teachers/ia/course-analysis/',
                '/api/academic/teachers/ia/student-analysis/',
                '/api/academic/teachers/ia/course-recommendations/'
            ],
            'description': 'Endpoints para análisis y recomendaciones basadas en IA'
        })