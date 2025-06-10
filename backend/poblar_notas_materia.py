# poblar_notas_materia.py
import os
import django
import random
from datetime import timedelta, date
from django.utils import timezone

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_project.settings')
django.setup()

# Importar modelos
from academic.models import Student, Assignment, GradeEntry, Grade, Attendance, CourseSubject
from django.db.models import Q

print("📌 Poblando datos académicos de 1-A, 1-B, 1-C, 1-D…")

PERIODOS = [1, 2, 3, 4]
TIPOS = ['TAREA', 'EXAMEN', 'PROYECTO', 'QUIZ', 'PARTICIPACION']
ANIO = str(timezone.now().year)

PERFILES = [
    {'tipo': 'Excelente', 'rango': (4.5, 5.0), 'variabilidad': 0.2, 'asistencia': 0.95},
    {'tipo': 'Bueno', 'rango': (3.8, 4.4), 'variabilidad': 0.3, 'asistencia': 0.9},
    {'tipo': 'Promedio', 'rango': (3.0, 3.9), 'variabilidad': 0.4, 'asistencia': 0.85},
    {'tipo': 'Irregular', 'rango': (2.3, 3.5), 'variabilidad': 0.6, 'asistencia': 0.75},
    {'tipo': 'Bajo', 'rango': (1.0, 2.9), 'variabilidad': 0.5, 'asistencia': 0.6}
]

NOMBRES_ACTIVIDADES = {
    'TAREA': ['Ejercicio', 'Taller', 'Investigación'],
    'EXAMEN': ['Parcial', 'Prueba escrita'],
    'PROYECTO': ['Proyecto grupal', 'Presentación'],
    'QUIZ': ['Quiz rápido', 'Evaluación'],
    'PARTICIPACION': ['Debate', 'Discusión', 'Participación activa']
}

cursos_codigo = ['1-A', '1-B', '1-C', '1-D']

estudiantes = Student.objects.filter(course__name__in=["1-A", "1-B", "1-C", "1-D"])

print(f"👥 Estudiantes encontrados: {estudiantes.count()}")

for idx, est in enumerate(estudiantes):
    perfil = PERFILES[idx % len(PERFILES)]
    print(f"\n📚 {est.user.get_full_name()} - Perfil {perfil['tipo']}")

    for cs in CourseSubject.objects.filter(course=est.course):
        print(f"   ➤ Materia: {cs.subject.name}")

        for per in PERIODOS:
            actividades = []
            for _ in range(random.randint(3, 5)):
                tipo = random.choice(TIPOS)
                nombre = random.choice(NOMBRES_ACTIVIDADES[tipo])
                act = Assignment.objects.create(
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
                actividades.append(act)

            entradas = []
            for act in actividades:
                nota = round(random.uniform(*perfil['rango']) + random.uniform(-perfil['variabilidad'], perfil['variabilidad']), 1)
                nota = max(1.0, min(5.0, nota))
                entrada = GradeEntry.objects.create(
                    assignment=act,
                    student=est,
                    score=nota,
                    submitted_date=timezone.now() - timedelta(days=random.randint(1, 10)),
                    late_submission=random.random() < 0.2
                )
                entradas.append(entrada)

            # Calcular y guardar la nota final del periodo
            if entradas:
                total, pesos = 0, 0
                for e in entradas:
                    total += e.score * e.assignment.weight
                    pesos += e.assignment.weight
                promedio = round(total / pesos, 1) if pesos else 3.0
                grade, _ = Grade.objects.get_or_create(
                    student=est,
                    course=est.course,
                    period=per,
                    year=ANIO,
                    defaults={'value': promedio, 'comments': f"Promedio generado P{per}"}
                )
                for e in entradas:
                    e.grade = grade
                    e.save()
                print(f"     🧮 Periodo {per}: {promedio}")

    # Poblar asistencia distribuida
    fechas = [date(timezone.now().year, 2, 1) + timedelta(days=i*7) for i in range(30)]
    for cs in CourseSubject.objects.filter(course=est.course):
        for f in fechas:
            if f.weekday() < 5:
                present = random.random() < perfil['asistencia']
                Attendance.objects.get_or_create(
                    student=est,
                    date=f,
                    subject=cs.subject,
                    defaults={
                        'present': present,
                        'comments': '' if present else random.choice(['Sin justificación', 'Ausencia médica', 'Permiso especial'])
                    }
                )

print("\n✅ Poblamiento completo.")
