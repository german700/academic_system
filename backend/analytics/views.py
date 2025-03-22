# .\academic_system\backend\analytics\views.py
from django.db.models import Avg
from rest_framework import generics, permissions
from rest_framework.response import Response
import pandas as pd
from .serializers import StudentAnalysisSerializer, CourseStatisticsSerializer
from academic.models import Grade, Student, Course, Teacher

class StudentAnalysisView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentAnalysisSerializer

    def get(self, request, student_id):
        # Obtener todas las calificaciones del estudiante
        grades = Grade.objects.filter(student_id=student_id).values_list('value', flat=True)
        
        # Convertir a DataFrame de pandas
        df = pd.DataFrame(list(grades), columns=['grade'])
        
        # Realizar análisis
        analysis = {
            'student_name': Student.objects.get(id=student_id).name,
            'overall_performance': df['grade'].mean() if not df.empty else 0,
            'strengths': self._identify_strengths(df),
            'areas_for_improvement': self._identify_improvements(df),
            'comparative_analysis': self._compare_with_class(student_id),
            'learning_patterns': self._analyze_learning_patterns(df)
        }
        
        serializer = self.get_serializer(analysis)
        return Response(serializer.data)

    def _identify_strengths(self, df):
        strengths = []
        if not df.empty:
            mean_grade = df['grade'].mean()
            if mean_grade > 4.0:
                strengths.append("Excelente desempeño general")
            elif mean_grade > 3.5:
                strengths.append("Buen desempeño general")
        return strengths

    def _identify_improvements(self, df):
        improvements = []
        if not df.empty:
            mean_grade = df['grade'].mean()
            if mean_grade < 3.0:
                improvements.append("Necesita refuerzo general")
            elif mean_grade < 3.5:
                improvements.append("Hay espacio para mejora")
        return improvements

    def _compare_with_class(self, student_id):
        # Obtener promedio del estudiante
        student_grades = Grade.objects.filter(student_id=student_id)
        if not student_grades.exists():
            return {"percentile": 0, "average_comparison": 0}
            
        student_average = student_grades.values_list('value', flat=True).aggregate(Avg('value'))['value__avg']
        
        # Obtener promedio general de todos los cursos del estudiante
        courses = student_grades.values_list('course_id', flat=True).distinct()
        class_grades = Grade.objects.filter(course_id__in=courses)
        class_average = class_grades.values_list('value', flat=True).aggregate(Avg('value'))['value__avg']
        
        return {
            "student_average": student_average,
            "class_average": class_average
        }

    def _analyze_learning_patterns(self, df):
        if df.empty:
            return {"consistency": "No hay suficientes datos"}
            
        std = df['grade'].std()
        if std < 0.5:
            consistency = "alta"
        elif std < 1.0:
            consistency = "media"
        else:
            consistency = "baja"
            
        return {"consistency": consistency}

class CourseStatisticsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseStatisticsSerializer

    def get(self, request, course_id):
        # Obtener todas las calificaciones del curso
        grades = Grade.objects.filter(course_id=course_id).values_list('value', flat=True)
        
        # Convertir a DataFrame
        df = pd.DataFrame(list(grades), columns=['grade'])
        
        statistics = {
            'course_average': df['grade'].mean() if not df.empty else 0,
            'grade_distribution': self._calculate_distribution(df),
            'performance_metrics': self._calculate_metrics(df)
        }
        
        serializer = self.get_serializer(statistics)
        return Response(serializer.data)

    def _calculate_distribution(self, df):
        if df.empty:
            return {}
        return df['grade'].value_counts().sort_index().to_dict()

    def _calculate_metrics(self, df):
        if df.empty:
            return {'mean': 0, 'median': 0, 'std': 0}
        return {
            'mean': df['grade'].mean(),
            'median': df['grade'].median(),
            'std': df['grade'].std()
        }