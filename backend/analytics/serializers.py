# C:\Users\germa\Desktop\academic_system\backend\analytics\serializers.py
from rest_framework import serializers

class StudentsPerGradeSerializer(serializers.Serializer):
    grado = serializers.CharField()
    cantidad_estudiantes = serializers.IntegerField()