# poblar_notas_materia.py
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

print("📌 Limpiando actividades, calificaciones y asistencias anteriores…")
Assignment.objects.all().delete()
GradeEntry.objects.all().delete()
Grade.objects.all().delete()
Attendance.objects.all().delete()

PERIODOS = [1, 2, 3, 4]
TIPOS = ['TAREA', 'EXAMEN', 'PROYECTO', 'QUIZ', 'PARTICIPACION']
ANIO = 2024
PERFILES = [
    {'tipo': 'Excelente', 'rango': (4.5, 5.0), 'variabilidad': 0.2, 'asistencia': 0.95},
    {'tipo': 'Bueno',     'rango': (3.8, 4.4), 'variabilidad': 0.3, 'asistencia': 0.9},
    {'tipo': 'Promedio',  'rango': (3.0, 3.9), 'variabilidad': 0.4, 'asistencia': 0.85},
    {'tipo': 'Irregular', 'rango': (2.3, 3.5), 'variabilidad': 0.6, 'asistencia': 0.75},
    {'tipo': 'Bajo',      'rango': (1.0, 2.9), 'variabilidad': 0.5, 'asistencia': 0.6},
]
NOMBRES_ACTIVIDADES = {
    'TAREA': ['Ejercicio', 'Taller', 'Investigación'],
    'EXAMEN': ['Parcial', 'Prueba escrita'],
    'PROYECTO': ['Proyecto grupal', 'Presentación'],
    'QUIZ': ['Quiz rápido', 'Evaluación'],
    'PARTICIPACION': ['Debate', 'Discusión', 'Participación activa']
}

print("📌 Creando actividades por curso→materia→periodo…")
with transaction.atomic():
    for cs in CourseSubject.objects.all():
        for per in PERIODOS:
            num_acts = random.randint(3, 5)
            for _ in range(num_acts):
                tipo = random.choice(TIPOS)
                nombre = random.choice(NOMBRES_ACTIVIDADES[tipo])
                Assignment.objects.create(
                    course_subject=cs,
                    name=f"{nombre} P{per}",
                    assignment_type=tipo,
                    weight=1.0 if tipo != 'EXAMEN' else 2.0,
                    period=per,
                    year=ANIO,
                    max_score=5.0,
                    date_assigned=timezone.now().date() - timedelta(days=random.randint(10, 60)),
                    due_date=timezone.now().date() - timedelta(days=random.randint(1, 30))
                )
print("✅ Actividades creadas.")

print("📌 Generando calificaciones por estudiante…")
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
                        random.uniform(-perfil['variabilidad'], perfil['variabilidad']),
                        1
                    )
                    nota = max(1.0, min(5.0, nota))
                    GradeEntry.objects.create(
                        assignment=act,
                        student=est,
                        grade=grade_obj,
                        score=nota,
                        submitted_date=make_aware(datetime.now() - timedelta(days=random.randint(1, 10))),
                        late_submission=random.random() < 0.2
                    )
                    total_pesos   += act.weight
                    total_ponderado += nota * act.weight

                if total_pesos:
                    grade_obj.value = round(total_ponderado / total_pesos, 1)
                    grade_obj.save()
print("✅ Calificaciones generadas.")

print("📌 Generando asistencias simuladas para el año lectivo 2024…")
with transaction.atomic():
    # Una fecha por semana desde el 1-Feb-2024 (200 días)
    fechas = [date(2024, 2, 1) + timedelta(days=i) for i in range(0, 200, 7)]
    for cs in CourseSubject.objects.all():
        student_ids = list(cs.course.students.values_list('id', flat=True))
        for fecha in fechas:
            for idx, sid in enumerate(student_ids):
                presente = (idx % 2 == 0)
                estado = "PRESENTE" if presente else "AUSENTE"
                a = Attendance.objects.create(
                    student_id=sid,
                    subject_id=cs.subject_id,
                    date=fecha,
                    present=presente,
                    comments=estado
                )
                # imprime para verificar ids
                print(f"ID={a.id} | CursoMateria={cs.id} | Estudiante={sid} | Fecha={fecha} | {estado}")
print("✅ Asistencias generadas.")
