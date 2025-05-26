#C:\Users\germa\Desktop\academic_system\backend\academic\signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Subject, Course, CourseSubject

@receiver(post_save, sender=Subject)
def sync_subject_to_courses(sender, instance, created, **kwargs):
    grado = instance.grado
    cursos = Course.objects.filter(grado=grado)

    for curso in cursos:
        # Verifica si ya está asignada esa materia
        if not CourseSubject.objects.filter(course=curso, subject=instance).exists():
            CourseSubject.objects.create(course=curso, subject=instance)

@receiver(post_delete, sender=Subject)
def remove_subject_from_courses(sender, instance, **kwargs):
    # Eliminar la materia de todos los cursos del mismo grado
    course_subjects = CourseSubject.objects.filter(subject=instance)
    course_subjects.delete()