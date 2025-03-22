# academic/permissions.py
from rest_framework import permissions

class IsTeacherOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.user_type == 'teacher' or 
            request.user.is_superuser
        )

class IsTeacherOfCourse(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and (
            request.user.is_superuser or 
            (hasattr(request.user, 'teacher') and obj.teacher == request.user.teacher)
        )

class IsStudentViewingSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and (
            request.user.is_superuser or 
            (request.user.user_type == 'student' and obj.user == request.user)
        )