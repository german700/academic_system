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
    TeacherCoursesView,
    TeacherCourseStudentsView,
    TeacherCoursePDFView,
    TeacherCourseSubjectGradesView,
    TeacherStudentSubjectAnalysisView,
    TeacherDashboardView
)

# Common (ViewSets genéricos + búsqueda)
from .views.common_views import (
    TeacherSearchStudentsView,
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
router.register(r'teachers', TeacherViewSet)

# Genéricos / Comunes
router.register(r'subjects', SubjectViewSet)
router.register(r'grados', GradoViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'grades', GradeViewSet)
router.register(r'administrators', AdministratorViewSet, basename="administrator")
router.register(r'course-subjects', CourseSubjectViewSet)
router.register(r'attendances', AttendanceViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'grade-entries', GradeEntryViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # Estudiante
    path('students/my-profile/', StudentProfileView.as_view(), name='my-student-profile'),
    path('students/my-grades/', student_grades_view, name='student-grades'),

    # Periodo académico
    path('periodo-actual/', AcademicPeriodView.as_view(), name='periodo-actual'),

    # Docente
    path('teacher/courses/', TeacherCoursesView.as_view(), name='teacher-courses'),
    path('teacher/course/<int:course_id>/students/', TeacherCourseStudentsView.as_view(), name='teacher-course-students'),
    path('teacher/search-students/', TeacherSearchStudentsView.as_view(), name='teacher-search-students'),
    path('teacher/course/<int:course_id>/planilla-pdf/', TeacherCoursePDFView.as_view(), name='teacher-course-planilla-pdf'),
    path('teacher/course/<int:course_id>/subject/<int:subject_id>/grades/', TeacherCourseSubjectGradesView.as_view(), name='teacher-course-subject-grades'),
    path('teacher/student/<int:student_id>/analysis/', TeacherStudentSubjectAnalysisView.as_view(), name='teacher-student-subject-analysis'),
    path('teacher/dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),

    # Grado–Materia
    path('grados/<int:grado_id>/materias/', GradoMateriaViewSet.as_view({'get': 'list', 'post': 'create'}), name='gestionar_materias_por_grado'),
    path('grados/<int:grado_id>/materias/<int:materia_id>/', GradoMateriaViewSet.as_view({'delete': 'destroy'}), name='eliminar_materia_grado'),
]
