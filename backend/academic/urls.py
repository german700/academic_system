# C:\Users\germa\Desktop\academic_system\backend\academic\urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from academic.views.admin_views import teacher_engagement_overview
from academic.views.admin_views import teacher_ia_analysis
# Student
from .views.student_views import (
    StudentProfileView,
    StudentViewSet,
    student_grades_view
)

# Student IA Analysis
from .views.studentIA_views import StudentIAAnalysisView

# Teacher
from .views.teacher_views import (
    TeacherViewSet,
    teacher_student_profile,
    TeacherDashboardView,
    CourseStudentsByTeacherView, 
)
from academic.views.teacherIA_view import TeacherIAViewSet

# Common (ViewSets genéricos + búsqueda)
from .views.common_views import (
    SubjectViewSet,
    GradoViewSet,
    CourseViewSet,
    GradeViewSet,
    GradeEntryViewSet,
    AttendanceViewSet,
    AssignmentViewSet,
    GradoMateriaViewSet,
    CourseSubjectViewSet,
    AdministratorViewSet
)

# AcademicPeriod
from .views.period_views import AcademicPeriodView

router = DefaultRouter()

# Student ViewSets
router.register(r'students', StudentViewSet)

# Teacher ViewSets
router.register(r'teachers', TeacherViewSet, basename='teacher')

# Genéricos / Comunes
router.register(r'subjects', SubjectViewSet)
router.register(r'grados', GradoViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'grades', GradeViewSet)
router.register(r'administrators', AdministratorViewSet, basename="administrator")
router.register(r'course-subjects', CourseSubjectViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'grade-entries', GradeEntryViewSet, basename='gradeentry')

router.register(r'attendances', AttendanceViewSet, basename='attendance')

router.register(r'teachers/ia', TeacherIAViewSet, basename='teacher-ia')

urlpatterns = [
    # Estudiante – PRIORIDAD primero (antes del router)
    path('students/my-grades/', student_grades_view, name='student-grades'),
    path('students/my-profile/', StudentProfileView.as_view(), name='my-student-profile'),
    
    # Student IA Analysis - NUEVA RUTA
    path('students/<int:pk>/ia-analysis/', StudentIAAnalysisView.as_view(), name='student-ia-analysis'),
    
    # Teacher routes
    path('teachers/student-profile/<int:student_id>/', teacher_student_profile, name='teacher-student-profile'),
    path("teachers/<int:pk>/dashboard/", TeacherDashboardView.as_view()),
    
    # 👈 NUEVA RUTA: Estudiantes por docente y curso
    path("teachers/<int:teacher_id>/course/<int:course_id>/students/", CourseStudentsByTeacherView.as_view()),
    
    # Periodo académico
    path('periodo-actual/', AcademicPeriodView.as_view(), name='periodo-actual'),
    
    # Grado–Materia
    path('grados/<int:grado_id>/materias/', GradoMateriaViewSet.as_view({'get': 'list', 'post': 'create'}), name='gestionar_materias_por_grado'),
    path('grados/<int:grado_id>/materias/<int:materia_id>/', GradoMateriaViewSet.as_view({'delete': 'destroy'}), name='eliminar_materia_grado'),
    path('teachers/<int:teacher_id>/engagement/', teacher_engagement_overview, name='teacher-engagement-overview'),
     path('teachers/<int:teacher_id>/ia-analysis/', teacher_ia_analysis, name='teacher-ia-analysis'),
    # ViewSets (router) - AL FINAL para evitar conflictos
    path('', include(router.urls)),
]