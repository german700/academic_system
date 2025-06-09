# C:\Users\germa\Desktop\academic_system\backend\academic\views\period_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from academic.models import AcademicPeriod
from academic.serializers import AcademicPeriodSerializer
from django.utils import timezone
class AcademicPeriodView(APIView):
    """
    GET /api/academic/periodo-actual/
    Devuelve el periodo académico activo en el sistema.
    """
    def get(self, request):
        today = timezone.now().date()
        period = AcademicPeriod.objects.filter(
            start_date__lte=today,
            end_date__gte=today
        ).first()
        
        if not period:
            return Response(
                {"detail": "No hay periodo activo."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AcademicPeriodSerializer(period)
        return Response(serializer.data, status=status.HTTP_200_OK)
