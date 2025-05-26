#C:\Users\germa\Desktop\academic_system\backend\authentication\models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True or extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_staff=True y is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    USER_TYPES = (
        ('teacher', 'Docente'),
        ('director', 'Directivo'),
        ('student', 'Estudiante'),
    )

    username = None  # Eliminar el campo username
    email = models.EmailField('email address', unique=True)

    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='director')
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    second_last_name = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    email_confirmed = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # No se requiere username ni otro campo adicional

    objects = UserManager()

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return self.email
