# \academic_system\backend\authentication\admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'first_name', 'last_name', 'email', 'user_type')
    list_filter = ('user_type',)
    # Simplificamos los campos mostrados
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información Personal', {'fields': ('first_name', 'last_name', 'email', 'user_type', 'profile_picture')}),
        ('Estado', {'fields': ('is_active',)}),
    )
    # Simplificamos los campos para nuevo usuario
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'user_type', 'first_name', 'last_name', 'email'),
        }),
    )
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

admin.site.register(User, CustomUserAdmin)