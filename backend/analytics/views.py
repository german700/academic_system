#C:\Users\germa\Desktop\academic_system\backend\analytics\views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from analytics.services import analizar_rendimiento_estudiante_completo, predecir_riesgo_estudiante
import logging

logger = logging.getLogger(__name__)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_analysis_view(request):
    """
    Endpoint para obtener el análisis de rendimiento del estudiante autenticado.
    """
    try:
        user = request.user
        student = getattr(user, "student_profile", None)
        
        if not student:
            return Response({
                "detail": "Este usuario no es un estudiante."
            }, status=status.HTTP_403_FORBIDDEN)

        analysis = analizar_rendimiento_estudiante_completo(student)
        return Response(analysis, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en análisis de rendimiento: {str(e)}")
        return Response({
            "detail": "Error interno del servidor al procesar el análisis.",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def riesgo_academico_view(request):
    """
    Endpoint para obtener la predicción de riesgo académico del estudiante autenticado.
    """
    try:
        user = request.user
        student = getattr(user, "student_profile", None)
        
        if not student:
            return Response({
                "detail": "Este usuario no es un estudiante."
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Obtener la predicción de riesgo
        resultado = predecir_riesgo_estudiante(student)
        
        return Response(resultado, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en predicción de riesgo académico: {str(e)}")
        return Response({
            "detail": "Error interno del servidor al procesar la predicción.",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_full_analysis_view(request):
    """
    Endpoint completo que combina análisis de rendimiento y predicción de riesgo
    """
    try:
        user = request.user
        student = getattr(user, 'student_profile', None)
        
        if not student:
            return Response({
                "detail": "Este usuario no es un estudiante."
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Obtener análisis completo y predicción de riesgo
        analysis = analizar_rendimiento_estudiante_completo(student)
        riesgo = predecir_riesgo_estudiante(student)
        
        # Combinar resultados
        resultado_completo = {
            "estudiante": {
                "id": student.id,
                "nombre": f"{student.user.first_name} {student.user.last_name}",
                "email": student.user.email
            },
            "analisis_rendimiento": analysis,
            "prediccion_riesgo": riesgo,
            "timestamp": timezone.now().isoformat()
        }
        
        return Response(resultado_completo, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en análisis completo del estudiante: {str(e)}")
        return Response({
            "detail": "Error interno del servidor al procesar el análisis completo.",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)