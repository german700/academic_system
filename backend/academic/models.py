from django.db import models
from django.utils import timezone
from authentication.models import User
import uuid

def generate_unique_username(first_name, last_name):
    base_username = f"{first_name.lower()}{last_name.lower()}"
    username = base_username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    return username

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
    title = models.CharField(max_length=50, default="Defecto")  # Ejemplo: "Lic.", "Dr.", etc.
    date_of_birth = models.DateField(default=timezone.now)
    email = models.EmailField(unique=True, default="default@gmail.com")
    specialization = models.CharField(max_length=100, default="General")
    teacher_id = models.CharField(max_length=20, unique=True, blank=True)  # Generado automáticamente

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.specialization}"

    def save(self, *args, **kwargs):
        if not self.user:
            username = generate_unique_username(self.first_name, self.last_name)
            self.user = User.objects.create(
                username=username,
                first_name=self.first_name,
                last_name=self.last_name,
                email=self.email,
                user_type="teacher"
            )
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
    title = models.CharField(max_length=50, blank=True, default="")  # Título opcional
    date_of_birth = models.DateField(null=True, blank=True, default=timezone.now)
    email = models.EmailField(unique=True, default="default@gmail.com")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def save(self, *args, **kwargs):
        if not self.user:
            username = generate_unique_username(self.first_name, self.last_name)
            self.user = User.objects.create(
                username=username,
                first_name=self.first_name,
                last_name=self.last_name,
                email=self.email,
                user_type="director"
            )
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Administrativo"
        verbose_name_plural = "Administrativos"

class Grado(models.Model):
    numero = models.PositiveSmallIntegerField(unique=True)  # Ejemplo: 1, 2, …, 12
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
    grade_level = models.CharField(max_length=50, default="10")
    student_id = models.CharField(max_length=20, unique=True, blank=True)
    photo = models.ImageField(upload_to='student_photos/', null=True, blank=True)
    
    course = models.ForeignKey(
        "Course", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="students_in_course"
    )

    grado = models.ForeignKey(
        "Grado", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="students_in_grado"
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.student_id}"

    def save(self, *args, **kwargs):
        if not self.user:
            username = generate_unique_username(self.first_name, self.last_name)
            self.user = User.objects.create(
                username=username,
                first_name=self.first_name,
                last_name=self.last_name,
                email=self.email,
                user_type="student"
            )
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
    students = models.ManyToManyField("Student", blank=True, related_name="courses_m2m")
    teachers = models.ManyToManyField("Teacher", blank=True)
    academic_year = models.CharField(max_length=9, default="2023-2024")
    description = models.TextField(blank=True, default="")
    grado = models.ForeignKey("Grado", on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.code}"

    def save(self, *args, **kwargs):
        if not self.code:
            import uuid
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

class Grade(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    value = models.FloatField(default=0.0)
    date_assigned = models.DateTimeField(default=timezone.now)
    period = models.PositiveSmallIntegerField(default=1)  # Valores: 1, 2, 3 o 4
    year = models.CharField(max_length=4, default="2023")  # Año en formato "2023"
    comments = models.TextField(blank=True, default="")

    class Meta:
        verbose_name = "Calificación"
        verbose_name_plural = "Calificaciones"
        unique_together = ('student', 'course', 'period', 'year')

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name} - {self.course.name} - {self.value}"