# C:\Users\germa\Desktop\academic_system\backend\academic\models.py
from django.db import models
from django.utils import timezone
from authentication.models import User
import uuid
import random
import string

class Teacher(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'teacher'},
        related_name='teacher_profile',
        null=True, blank=True
    )
    first_name = models.CharField(max_length=100, default="Defecto")
    middle_name = models.CharField(max_length=100, blank=True, null=True, default="Defecto")
    last_name = models.CharField(max_length=100, default="Defecto")
    second_last_name = models.CharField(max_length=100, blank=True, null=True, default="Defecto")
    title = models.CharField(max_length=50, default="Defecto")
    date_of_birth = models.DateField(default=timezone.now)
    email = models.EmailField(unique=True, default="default@gmail.com")
    specialization = models.CharField(max_length=100, default="General")
    teacher_id = models.CharField(max_length=20, unique=True, blank=True)
    
    # Nuevo campo para foto de perfil
    profile_picture = models.ImageField(
        upload_to='teachers/profile_pictures/',
        null=True,
        blank=True,
        help_text="Foto de perfil del profesor"
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.specialization}"

    def save(self, *args, **kwargs):
        # Solo generar el teacher_id si no existe
        if not self.teacher_id:
            self.teacher_id = f"TCH{str(uuid.uuid4())[:5].upper()}"
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Profesor"
        verbose_name_plural = "Profesores"

class Administrator(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'director'},
        related_name='admin_profile',
        null=True, blank=True
    )
    first_name = models.CharField(max_length=100, default="Defecto")
    middle_name = models.CharField(max_length=100, blank=True, null=True, default="Defecto")
    last_name = models.CharField(max_length=100, default="Defecto")
    second_last_name = models.CharField(max_length=100, blank=True, null=True, default="Defecto")
    title = models.CharField(max_length=50, blank=True, default="")
    date_of_birth = models.DateField(null=True, blank=True, default=timezone.now)
    email = models.EmailField(unique=True, default="default@gmail.com")
    
    # Nuevo campo para foto de perfil
    profile_picture = models.ImageField(
        upload_to='administrators/profile_pictures/',
        null=True,
        blank=True,
        help_text="Foto de perfil del administrador"
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Grado(models.Model):
    numero = models.PositiveSmallIntegerField(unique=True)
    categoria = models.CharField(max_length=20, blank=True)

    def save(self, *args, **kwargs):
        if self.numero <= 5:
            self.categoria = "Primaria"
        else:
            self.categoria = "Secundaria"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Grado {self.numero} ({self.categoria})"

    class Meta:
        verbose_name = "Grado"
        verbose_name_plural = "Grados"

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True, blank=True)
    grado = models.ForeignKey("Grado", on_delete=models.CASCADE, related_name="materias")

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = f"SUB{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.grado.numero}° {self.grado.categoria}"

    class Meta:
        verbose_name = "Materia"
        verbose_name_plural = "Materias"

class Student(models.Model):
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]
    
    SOCIOECONOMIC_CHOICES = [
        ('BAJO', 'Bajo'),
        ('MEDIO_BAJO', 'Medio Bajo'),
        ('MEDIO', 'Medio'),
        ('MEDIO_ALTO', 'Medio Alto'),
        ('ALTO', 'Alto'),
    ]

    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'student'},
        related_name='student_profile',
        null=True, blank=True
    )
    first_name = models.CharField(max_length=100, default="Defecto")
    middle_name = models.CharField(max_length=100, blank=True, null=True, default="Defecto")
    last_name = models.CharField(max_length=100, blank=True, null=True, default="Defecto")
    second_last_name = models.CharField(max_length=100, blank=True, null=True, default="Defecto")
    date_of_birth = models.DateField(default=timezone.now)
    email = models.EmailField(unique=True, default="default@gmail.com")
    student_id = models.CharField(max_length=20, unique=True, blank=True)
    photo = models.ImageField(upload_to='student_photos/', null=True, blank=True)
    
    # Nuevos campos socio-demográficos
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    neighborhood = models.CharField(max_length=100, blank=True, verbose_name="Barrio/Zona")
    socioeconomic_status = models.CharField(
        max_length=50, 
        choices=SOCIOECONOMIC_CHOICES, 
        blank=True,
        verbose_name="Nivel Socioeconómico"
    )
    
    course = models.ForeignKey(
        "Course", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="students"
    )

    grado = models.ForeignKey(
        "Grado", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="students_in_grado"
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.student_id}"

    def save(self, *args, **kwargs):
        # Solo generar el student_id si no existe
        if not self.student_id:
            self.student_id = f"STD{str(uuid.uuid4())[:5].upper()}"
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Estudiante"
        verbose_name_plural = "Estudiantes"

class Course(models.Model):
    name = models.CharField(max_length=100, default="Curso sin nombre")
    code = models.CharField(max_length=20, unique=True, blank=True)
    subjects = models.ManyToManyField("Subject", through="CourseSubject", blank=True)
    # students = models.ManyToManyField("Student", blank=True, related_name="courses_m2m") ← eliminado
    teachers = models.ManyToManyField("Teacher", blank=True)
    academic_year = models.CharField(max_length=9, default="2023-2024")
    description = models.TextField(blank=True, default="")
    grado = models.ForeignKey("Grado", on_delete=models.SET_NULL, null=True, blank=True, related_name="courses")

    def __str__(self):
        return f"{self.name} - {self.code}"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = f"CRS{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Curso"
        verbose_name_plural = "Cursos"

class CourseSubject(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="course_subjects")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        unique_together = ('course', 'subject')
        verbose_name = "Asignación de Materia"
        verbose_name_plural = "Asignaciones de Materias"

    def __str__(self):
        return f"{self.course.name} - {self.subject.name}"

# Nuevo modelo para registrar asistencias
class Attendance(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    present = models.BooleanField(default=True)
    subject = models.ForeignKey('Subject', on_delete=models.CASCADE, related_name='attendances', null=True, blank=True)
    comments = models.TextField(blank=True, help_text="Justificación de ausencia o comentarios")
    
    class Meta:
        unique_together = ('student', 'date', 'subject')
        verbose_name = "Asistencia"
        verbose_name_plural = "Asistencias"
        ordering = ['-date']

    def __str__(self):
        status = "Presente" if self.present else "Ausente"
        subject_name = f" - {self.subject.name}" if self.subject else ""
        return f"{self.student.first_name} {self.student.last_name} - {self.date} - {status}{subject_name}"

# Nuevo modelo para tareas/actividades con peso
class Assignment(models.Model):
    ASSIGNMENT_TYPES = [
        ('EXAMEN', 'Examen'),
        ('QUIZ', 'Quiz'),
        ('TAREA', 'Tarea'),
        ('PROYECTO', 'Proyecto'),
        ('PARTICIPACION', 'Participación'),
        ('LABORATORIO', 'Laboratorio'),
        ('ENSAYO', 'Ensayo'),
        ('PRESENTACION', 'Presentación'),
        ('OTRO', 'Otro'),
    ]
    
    course_subject = models.ForeignKey('CourseSubject', on_delete=models.CASCADE, related_name='assignments')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    assignment_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPES, default='TAREA')
    date_assigned = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)
    weight = models.FloatField(default=1.0, help_text="Peso relativo en la nota del periodo")
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    period = models.PositiveSmallIntegerField(default=1)
    year = models.CharField(max_length=4, default="2024")
    
    class Meta:
        verbose_name = "Actividad/Tarea"
        verbose_name_plural = "Actividades/Tareas"
        ordering = ['-date_assigned']

    def __str__(self):
        return f"{self.course_subject.course.name} - {self.course_subject.subject.name} - {self.name} ({self.assignment_type})"

class Grade(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    value = models.FloatField(default=0.0)
    date_assigned = models.DateTimeField(default=timezone.now)
    period = models.PositiveSmallIntegerField(default=1)
    year = models.CharField(max_length=4, default="2023")
    comments = models.TextField(blank=True, default="")

    class Meta:
        verbose_name = "Calificación"
        verbose_name_plural = "Calificaciones"
        unique_together = ('student', 'course', 'period', 'year')

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.course.name} - {self.value}"

# Modelo actualizado para entradas de calificaciones con relación a tareas
class GradeEntry(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='grade_entries', null=True, blank=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True)   
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='entries', null=True, blank=True)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    submitted_date = models.DateTimeField(null=True, blank=True)
    late_submission = models.BooleanField(default=False)
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('assignment', 'student')
        verbose_name = "Entrada de Calificación"
        verbose_name_plural = "Entradas de Calificaciones"

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.assignment.name}: {self.score}"

    def get_percentage(self):
        """Calcula el porcentaje obtenido sobre el puntaje máximo"""
        if self.assignment.max_score > 0:
            return (float(self.score) / float(self.assignment.max_score)) * 100
        return 0

    def is_passing(self, passing_threshold=60):
        """Determina si la calificación es aprobatoria"""
        return self.get_percentage() >= passing_threshold
    
#Modelo para el periodo academico
class AcademicPeriod(models.Model):
    """
    Modelo que define un periodo académico (por ejemplo: Periodo 1, Periodo 2, etc.)
    con fechas de inicio, fin y fecha límite de edición de notas.
    """
    number = models.PositiveSmallIntegerField(
        help_text="Número interno del periodo (1, 2, 3…)"
    )
    name = models.CharField(
        max_length=50,
        help_text="Nombre descriptivo (p. ej. 'Primer Periodo', 'Segundo Periodo')"
    )
    start_date = models.DateField(help_text="Fecha de inicio del periodo")
    end_date = models.DateField(help_text="Fecha de fin del periodo")
    edit_deadline = models.DateField(
        help_text="Fecha límite en la que el docente puede editar notas para este periodo"
    )
    academic_year = models.CharField(
        max_length=9,
        help_text="Año académico al que pertenece (p. ej. '2024-2025')"
    )

    class Meta:
        unique_together = ('number', 'academic_year')
        ordering = ['academic_year', 'number']
        verbose_name = "Periodo Académico"
        verbose_name_plural = "Periodos Académicos"

    def __str__(self):
        return f"{self.name} ({self.academic_year})"