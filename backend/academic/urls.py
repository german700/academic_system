# C:\Users\germa\Desktop\academic_system\backend\academic\urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Student
from .views.student_views import (
    StudentProfileView,
    StudentViewSet,
    student_grades_view
)

# Teacher
from .views.teacher_views import (
    TeacherViewSet,
    teacher_student_profile,  # AGREGADO
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

# CORREGIDO: Cambiar 'attendance' por 'attendances' para que coincida con la URL
router.register(r'attendances', AttendanceViewSet, basename='attendance')

router.register(r'teachers/ia', TeacherIAViewSet, basename='teacher-ia')

urlpatterns = [
    # Estudiante – PRIORIDAD primero (antes del router)
    path('students/my-grades/', student_grades_view, name='student-grades'),
    path('students/my-profile/', StudentProfileView.as_view(), name='my-student-profile'),
    
    # Teacher routes - AGREGADO
    path('teachers/student-profile/<int:student_id>/', teacher_student_profile, name='teacher-student-profile'),
    
    # Periodo académico
    path('periodo-actual/', AcademicPeriodView.as_view(), name='periodo-actual'),
    
    # Grado–Materia
    path('grados/<int:grado_id>/materias/', GradoMateriaViewSet.as_view({'get': 'list', 'post': 'create'}), name='gestionar_materias_por_grado'),
    path('grados/<int:grado_id>/materias/<int:materia_id>/', GradoMateriaViewSet.as_view({'delete': 'destroy'}), name='eliminar_materia_grado'),
    
    # ViewSets (router) - AL FINAL para evitar conflictos
    path('', include(router.urls)),
]