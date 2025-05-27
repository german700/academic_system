# C:\Users\germa\Desktop\academic_system\backend\academic\urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import GradoViewSet, GradoMateriaViewSet, StudentViewSet, student_grades_view, StudentProfileView

router = DefaultRouter()
router.register(r'students', views.StudentViewSet)
router.register(r'teachers', views.TeacherViewSet)
router.register(r'subjects', views.SubjectViewSet)
router.register(r'courses', views.CourseViewSet)
router.register(r'grades', views.GradeViewSet)
router.register(r'administrators', views.AdministratorViewSet, basename="administrator")
router.register(r'grados', views.GradoViewSet)
router.register(r'course-subjects', views.CourseSubjectViewSet)
# Nuevos viewsets agregados
router.register(r'attendances', views.AttendanceViewSet)
router.register(r'assignments', views.AssignmentViewSet)
router.register(r'grade-entries', views.GradeEntryViewSet)

urlpatterns = [
    path('students/my-profile/', StudentProfileView.as_view(), name='my-student-profile'),
    path("students/my-grades/", student_grades_view),
    path('', include(router.urls)),
    path('grados/<int:grado_id>/materias/', GradoMateriaViewSet.as_view({'get': 'list', 'post': 'create'}), name='gestionar_materias_por_grado'),
    path('grados/<int:grado_id>/materias/<int:materia_id>/', GradoMateriaViewSet.as_view({'delete': 'destroy'}), name='eliminar_materia_grado'),
    
]