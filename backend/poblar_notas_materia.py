# poblar_datos_academicos.py
import os
import django
import random
from datetime import timedelta, datetime, date
from django.utils import timezone
from django.utils.timezone import make_aware
from django.db import transaction

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_project.settings')
django.setup()

from academic.models import Student, Assignment, GradeEntry, Grade, Attendance, CourseSubject

# Constantes
PERIODOS = [1, 2, 3, 4]
TIPOS = ['TAREA', 'EXAMEN', 'PROYECTO', 'QUIZ', 'PARTICIPACION']
ANIO = 2024

PERFILES = [
    {'nombre': 'Excelente', 'rango': (4.5, 5.0), 'variabilidad': 0.1, 'asistencia': 0.98},
    {'nombre': 'Alto',      'rango': (4.0, 4.5), 'variabilidad': 0.2, 'asistencia': 0.95},
    {'nombre': 'Medio',     'rango': (3.0, 4.0), 'variabilidad': 0.3, 'asistencia': 0.85},
    {'nombre': 'Bajo',      'rango': (2.0, 3.0), 'variabilidad': 0.4, 'asistencia': 0.75},
    {'nombre': 'Crítico',  'rango': (1.0, 2.5), 'variabilidad': 0.5, 'asistencia': 0.6},
]

NOMBRES_ACTIVIDADES = {
    'TAREA': ['Taller práctico', 'Investigación guiada'],
    'EXAMEN': ['Parcial', 'Evaluación escrita'],
    'PROYECTO': ['Proyecto final', 'Presentación grupal'],
    'QUIZ': ['Quiz sorpresa', 'Evaluación corta'],
    'PARTICIPACION': ['Aporte en clase', 'Discusión dirigida']
}

print("\n📌 Limpiando registros anteriores…")
Assignment.objects.all().delete()
GradeEntry.objects.all().delete()
Grade.objects.all().delete()
Attendance.objects.all().delete()

print("📌 Creando actividades variadas por materia y periodo…")
with transaction.atomic():
    for cs in CourseSubject.objects.all():
        for per in PERIODOS:
            for tipo in TIPOS:
                for i in range(random.randint(1, 2)):
                    nombre = random.choice(NOMBRES_ACTIVIDADES[tipo])
                    Assignment.objects.create(
                        course_subject=cs,
                        name=f"{nombre} P{per}",
                        assignment_type=tipo,
                        weight=2.0 if tipo == 'EXAMEN' else 1.0,
                        period=per,
                        year=ANIO,
                        max_score=5.0,
                        date_assigned=timezone.now().date() - timedelta(days=random.randint(30, 90)),
                        due_date=timezone.now().date() - timedelta(days=random.randint(5, 20))
                    )
print("✅ Actividades creadas.")

print("📌 Generando calificaciones según perfiles…")
with transaction.atomic():
    estudiantes = list(Student.objects.select_related('course').all())
    for idx, est in enumerate(estudiantes):
        perfil = PERFILES[idx % len(PERFILES)]
        for cs in CourseSubject.objects.filter(course=est.course):
            for per in PERIODOS:
                acts = Assignment.objects.filter(course_subject=cs, period=per)
                if not acts.exists():
                    continue
                grade_obj, _ = Grade.objects.get_or_create(
                    student=est,
                    course=est.course,
                    period=per,
                    year=ANIO,
                    defaults={'value': 0.0, 'comments': f'Auto P{per}'}
                )
                total_pesos = 0
                total_ponderado = 0
                for act in acts:
                    nota = round(
                        random.uniform(*perfil['rango']) +
                        random.uniform(-perfil['variabilidad'], perfil['variabilidad']), 2
                    )
                    nota = max(1.0, min(5.0, nota))
                    GradeEntry.objects.create(
                        assignment=act,
                        student=est,
                        grade=grade_obj,
                        score=nota,
                        submitted_date=make_aware(datetime.now() - timedelta(days=random.randint(1, 10))),
                        late_submission=random.random() < 0.25
                    )
                    total_pesos += act.weight
                    total_ponderado += nota * act.weight
                if total_pesos:
                    grade_obj.value = round(total_ponderado / total_pesos, 2)
                    grade_obj.save()
print("✅ Calificaciones generadas.")

print("📌 Generando asistencias simuladas ciclo calendario A (Feb-Nov)…")
with transaction.atomic():
    fechas = [date(2024, 2, 1) + timedelta(days=i) for i in range(0, 200, 7)]
    for cs in CourseSubject.objects.all():
        for est in cs.course.students.all():
            perfil = PERFILES[est.id % len(PERFILES)]
            for fecha in fechas:
                presente = random.random() < perfil['asistencia']
                Attendance.objects.create(
                    student=est,
                    subject=cs.subject,
                    date=fecha,
                    present=presente,
                    comments="PRESENTE" if presente else "AUSENTE"
                )
print("✅ Asistencias generadas.")
