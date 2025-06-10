# C:\Users\germa\Desktop\academic_system\backend\academic\permissions.py
from rest_framework import permissions
from rest_framework.permissions import BasePermission
from django.utils import timezone
from academic.models import AcademicPeriod

class IsTeacher(permissions.BasePermission):
    """
    Permiso que solo permite acceso si el usuario es un docente confirmado 
    (user_type == 'teacher').
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'teacher'

class IsTeacherOrAdmin(permissions.BasePermission):
    """
    Permiso que permite acceso a docentes y administradores.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.user_type == 'teacher' or 
            request.user.is_superuser
        )

class IsTeacherOfCourse(permissions.BasePermission):
    """
    Permiso a nivel de objeto: permite al docente ver/administrar solo los cursos 
    donde él está asignado.
    """
    def has_object_permission(self, request, view, obj):
        # obj será un Course o CourseSubject
        if request.user.is_superuser:
            return True
            
        if not request.user.is_authenticated:
            return False
            
        # Verificar si el usuario tiene perfil de docente
        if hasattr(request.user, 'teacher_profile'):
            # Si el objeto tiene una relación many-to-many con teachers
            if hasattr(obj, 'teachers'):
                return obj.teachers.filter(pk=request.user.teacher_profile.pk).exists()
            # Si el objeto tiene una relación directa con teacher
            elif hasattr(obj, 'teacher'):
                return obj.teacher == request.user.teacher_profile
        
        # Fallback para compatibilidad con tu estructura actual
        if hasattr(request.user, 'teacher') and hasattr(obj, 'teacher'):
            return obj.teacher == request.user.teacher
            
        return False

    def has_permission(self, request, view):
        """
        También verificar permisos a nivel de vista.
        """
        return request.user.is_authenticated and (
            request.user.is_superuser or 
            request.user.user_type == 'teacher'
        )

class IsStudentViewingSelf(permissions.BasePermission):
    """
    Permiso que permite a los estudiantes ver solo su propia información.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
            
        return request.user.is_authenticated and (
            request.user.user_type == 'student' and obj.user == request.user
        )

    def has_permission(self, request, view):
        """
        Verificar que el usuario esté autenticado y sea estudiante o admin.
        """
        return request.user.is_authenticated and (
            request.user.is_superuser or 
            request.user.user_type == 'student'
        )

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permiso genérico para permitir acceso al propietario del objeto o admin.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
            
        # Verificar si el objeto tiene un campo 'user'
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Verificar si el objeto tiene un campo 'owner'
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
            
        return False

class CanViewGrades(permissions.BasePermission):
    """
    Permiso para ver calificaciones: docentes pueden ver las de sus cursos,
    estudiantes solo las propias.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
            
        # Si es un docente, verificar que sea docente del curso relacionado
        if request.user.user_type == 'teacher':
            # Asumiendo que obj es una Grade con student.course_subject.course
            if hasattr(obj, 'student') and hasattr(obj.student, 'course_subject'):
                course = obj.student.course_subject.course
                return self._is_teacher_of_course(request.user, course)
        
        # Si es un estudiante, solo puede ver sus propias calificaciones
        if request.user.user_type == 'student':
            return hasattr(obj, 'student') and obj.student.user == request.user
            
        return False
    
    def _is_teacher_of_course(self, user, course):
        """Helper method para verificar si el usuario es docente del curso."""
        if hasattr(user, 'teacher_profile'):
            if hasattr(course, 'teachers'):
                return course.teachers.filter(pk=user.teacher_profile.pk).exists()
            elif hasattr(course, 'teacher'):
                return course.teacher == user.teacher_profile
        
        # Fallback
        if hasattr(user, 'teacher') and hasattr(course, 'teacher'):
            return course.teacher == user.teacher
            
        return False
    
class IsWithinPeriod(BasePermission):
    """
    Permite crear/editar GradeEntry solo si la fecha actual está antes del
    edit_deadline del AcademicPeriod correspondiente a la asignación.
    """

    def has_object_permission(self, request, view, obj):
        # obj es una instancia de GradeEntry
        assignment = obj.assignment
        period_number = assignment.period
        year = assignment.year

        try:
            period = AcademicPeriod.objects.get(
                number=period_number,
                academic_year=year
            )
        except AcademicPeriod.DoesNotExist:
            return False

        # Solo permitir si estamos antes del deadline
        return timezone.now().date() <= period.edit_deadline
