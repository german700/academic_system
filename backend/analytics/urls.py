# C:\Users\germa\Desktop\academic_system\backend\analytics\urls.py
from django.urls import path
from .views import student_analysis_view

urlpatterns = [
    path('student-analysis/', student_analysis_view, name='student-analysis'),
]