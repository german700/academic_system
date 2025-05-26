# C:\Users\germa\Desktop\academic_system\backend\analytics\views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from academic.models import Grade
from analytics.services import analizar_rendimiento_estudiante

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_analysis_view(request):
    user = request.user
    student = getattr(user, "student_profile", None)
    if not student:
        return Response({"detail": "Este usuario no es un estudiante."}, status=403)

    analysis = analizar_rendimiento_estudiante(student)
    return Response(analysis)