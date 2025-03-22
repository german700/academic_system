# C:\Users\germa\Desktop\academic_system\backend\authentication\models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPES = (
        ('teacher', 'Docente'),
        ('director', 'Directivo'),
        ('student', 'Estudiante'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='director')
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    second_last_name = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'