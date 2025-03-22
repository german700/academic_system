# ..\academic_system\backend\academic\admin.py
from django.contrib import admin
from .models import Student, Teacher, Course, Grade, Subject, CourseSubject
from authentication.models import User

class TeacherAdmin(admin.ModelAdmin):
    list_display = ('get_first_name', 'get_last_name', 'get_username', 'specialization', 'teacher_id')
    search_fields = ('user__first_name', 'user__last_name', 'user__username', 'specialization')
    
    def get_first_name(self, obj):
        return obj.user.first_name
    get_first_name.short_description = 'Nombre'

    def get_last_name(self, obj):
        return obj.user.last_name
    get_last_name.short_description = 'Apellido'

    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['user'].queryset = User.objects.filter(
            user_type='teacher',
            teacher_profile__isnull=True
        )
        if obj:
            form.base_fields['user'].queryset |= User.objects.filter(id=obj.user.id)
        form.base_fields['user'].widget.attrs['style'] = 'width: 300px;'
        return form

    def save_model(self, request, obj, form, change):
        if not change and obj.user:
            obj.user.first_name = obj.user.first_name or obj.get_first_name()
            obj.user.last_name = obj.user.last_name or obj.get_last_name()
            obj.user.save()
        super().save_model(request, obj, form, change)


class StudentAdmin(admin.ModelAdmin):
    list_display = ('get_first_name', 'get_last_name', 'get_username', 'grade_level', 'student_id')
    search_fields = ('user__first_name', 'user__last_name', 'user__username', 'student_id')

    def get_first_name(self, obj):
        return obj.user.first_name
    get_first_name.short_description = 'Nombre'

    def get_last_name(self, obj):
        return obj.user.last_name
    get_last_name.short_description = 'Apellido'

    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['user'].queryset = User.objects.filter(
            user_type='student',
            student_profile__isnull=True
        )
        if obj:
            form.base_fields['user'].queryset |= User.objects.filter(id=obj.user.id)
        form.base_fields['user'].widget.attrs['style'] = 'width: 300px;'
        return form

    def save_model(self, request, obj, form, change):
        if not change and obj.user:
            obj.user.first_name = obj.user.first_name or obj.get_first_name()
            obj.user.last_name = obj.user.last_name or obj.get_last_name()
            obj.user.save()
        super().save_model(request, obj, form, change)

if not admin.site.is_registered(Course):
    @admin.register(Course)
    class CourseAdmin(admin.ModelAdmin):
        list_display = ('name', 'code', 'academic_year')
        list_filter = ('academic_year',)  
        search_fields = ('name', 'code')
        filter_horizontal = ('students',)

class CourseSubjectAdmin(admin.ModelAdmin):
    list_display = ('course', 'subject', 'teacher')
    list_filter = ('course', 'subject', 'teacher')
    search_fields = ('course__name', 'subject__name', 'teacher__user__first_name', 'teacher__user__last_name')

admin.site.register(CourseSubject, CourseSubjectAdmin)

class GradeAdmin(admin.ModelAdmin):
    list_display = ('get_student_name', 'get_course_name', 'value', 'period', 'date_assigned')
    list_filter = ('course', 'period', 'date_assigned')
    search_fields = ('student__user__first_name', 'course__name')

    def get_student_name(self, obj):
        return obj.student.user.first_name if obj.student else 'Sin estudiante'
    get_student_name.short_description = 'Estudiante'

    def get_course_name(self, obj):
        return obj.course.name if obj.course else 'Sin curso'
    get_course_name.short_description = 'Curso'


admin.site.register(Teacher, TeacherAdmin)
admin.site.register(Student, StudentAdmin)
admin.site.register(Grade, GradeAdmin)
