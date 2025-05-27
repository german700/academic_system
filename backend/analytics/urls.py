# C:\Users\germa\Desktop\academic_system\backend\analytics\urls.py
from django.urls import path
from .views import student_analysis_view, riesgo_academico_view, student_full_analysis_view

urlpatterns = [
    path('student/analysis/', student_analysis_view, name='student-analysis'),
    path('student/risk/',     riesgo_academico_view, name='student-risk'),
    path('student/full-analysis/', student_full_analysis_view, name='student-full-analysis'),
]