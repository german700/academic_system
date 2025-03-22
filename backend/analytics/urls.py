# .\academic_system\backend\analytics\urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('student-analysis/<int:student_id>/', views.StudentAnalysisView.as_view(), name='student-analysis'),
    path('course-statistics/<int:course_id>/', views.CourseStatisticsView.as_view(), name='course-statistics'),
]