#C:\Users\germa\Desktop\academic_system\backend\cargar_datos_prueba.py
import os
import django
from decimal import Decimal
from datetime import date, timedelta
import random

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "academic_project.settings")
django.setup()

from authentication.models import User
from academic.models import Student, CourseSubject, Grade, Assignment, GradeEntry

def cargar_datos_prueba_colombia():
    user = User.objects.get(email="juan@correo.com")
    student = user.student_profile
    course = student.course

    # Limpiar entradas anteriores
    GradeEntry.objects.filter(student=student).delete()
    Grade.objects.filter(student=student).delete()

    # Configuración de notas por materia y tipo de actividad
    notas_por_materia = {
        # Materias fuertes del estudiante
        "Matemáticas": {
            "EXAMEN": [4.2, 4.5, 3.8, 4.1],
            "TAREA": [4.0, 4.3, 4.1, 3.9],
            "PARTICIPACIÓN": [4.5, 4.2, 4.4, 4.0],
        },
        "Física": {
            "EXAMEN": [4.0, 3.8, 4.2, 3.9],
            "TAREA": [3.8, 4.1, 3.7, 4.0],
            "PARTICIPACIÓN": [4.1, 3.9, 4.0, 4.2],
        },
        "Química": {
            "EXAMEN": [3.9, 4.1, 3.7, 4.0],
            "TAREA": [4.2, 3.8, 4.0, 3.9],
            "PARTICIPACIÓN": [4.0, 4.3, 3.8, 4.1],
        },
        
        # Materias intermedias
        "Biología": {
            "EXAMEN": [3.5, 3.8, 3.6, 3.7],
            "TAREA": [3.7, 3.9, 3.6, 3.8],
            "PARTICIPACIÓN": [4.0, 3.8, 3.9, 3.7],
        },
        "Historia": {
            "EXAMEN": [3.4, 3.6, 3.8, 3.5],
            "TAREA": [3.8, 3.7, 4.0, 3.6],
            "PARTICIPACIÓN": [3.9, 4.1, 3.7, 3.8],
        },
        "Geografía": {
            "EXAMEN": [3.6, 3.4, 3.7, 3.5],
            "TAREA": [3.9, 3.8, 3.5, 3.7],
            "PARTICIPACIÓN": [4.0, 3.6, 3.8, 3.9],
        },
        "Filosofía": {
            "EXAMEN": [3.3, 3.7, 3.5, 3.6],
            "TAREA": [3.8, 3.6, 3.9, 3.4],
            "PARTICIPACIÓN": [4.2, 3.8, 4.0, 3.7],
        },
        
        # Materias más desafiantes
        "Lengua Castellana": {
            "EXAMEN": [3.2, 3.4, 3.1, 3.3],
            "TAREA": [3.5, 3.3, 3.7, 3.4],
            "PARTICIPACIÓN": [3.8, 3.6, 3.9, 3.5],
        },
        "Literatura": {
            "EXAMEN": [3.1, 3.3, 3.0, 3.2],
            "TAREA": [3.4, 3.6, 3.2, 3.5],
            "PARTICIPACIÓN": [3.7, 3.8, 3.6, 3.9],
        },
        "Inglés": {
            "EXAMEN": [2.9, 3.1, 2.8, 3.0],
            "TAREA": [3.3, 3.2, 3.4, 3.1],
            "PARTICIPACIÓN": [3.6, 3.4, 3.7, 3.5],
        },
        
        # Materias prácticas
        "Educación Física": {
            "EXAMEN": [4.3, 4.5, 4.2, 4.4],
            "TAREA": [4.1, 4.0, 4.3, 4.2],
            "PARTICIPACIÓN": [4.8, 4.6, 4.7, 4.5],
        },
        "Artes": {
            "EXAMEN": [3.8, 4.0, 3.9, 3.7],
            "TAREA": [4.2, 4.1, 4.0, 4.3],
            "PARTICIPACIÓN": [4.4, 4.2, 4.5, 4.1],
        },
        "Tecnología": {
            "EXAMEN": [3.7, 3.9, 3.8, 4.0],
            "TAREA": [4.0, 3.8, 4.1, 3.9],
            "PARTICIPACIÓN": [4.2, 4.0, 4.3, 3.8],
        },
    }

    # Notas por defecto para materias no especificadas
    notas_default = {
        "EXAMEN": [3.5, 3.7, 3.4, 3.6],
        "TAREA": [3.8, 3.6, 3.9, 3.7],
        "PARTICIPACIÓN": [4.0, 3.9, 4.1, 3.8],
    }

    for cs in CourseSubject.objects.filter(course=course):
        materia_name = cs.subject.name
        
        # Usar notas específicas de la materia o las por defecto
        notas_materia = notas_por_materia.get(materia_name, notas_default)
        
        for period in (1, 2):
            # Crear Grade solo si no existe
            grade, _ = Grade.objects.get_or_create(
                student=student,
                course=course,
                period=period,
                year="2025",
                defaults={"value": 0.0}
            )

            actividades = [
                ("Examen", 0.5, "EXAMEN"),
                ("Tarea", 0.3, "TAREA"),
                ("Participación", 0.2, "PARTICIPACIÓN"),
            ]

            for nombre, peso, tipo_actividad in actividades:
                # Obtener notas para esta actividad y materia
                notas_disponibles = notas_materia[tipo_actividad]
                
                # Seleccionar una nota aleatoria de las disponibles
                nota_valor = random.choice(notas_disponibles)
                
                # Crear variaciones menores para diferentes periodos
                if period == 2:
                    # En el segundo periodo, aplicar una pequeña variación
                    variacion = random.uniform(-0.2, 0.3)
                    nota_valor = max(1.0, min(5.0, nota_valor + variacion))
                    nota_valor = round(nota_valor, 1)

                assign = Assignment.objects.create(
                    course_subject=cs,
                    name=f"{nombre} - {cs.subject.name} (P{period})",
                    description=f"{nombre} de periodo {period} para {cs.subject.name}",
                    assignment_type=tipo_actividad,
                    date_assigned=date.today() - timedelta(days=7),
                    due_date=date.today(),
                    weight=peso,
                    max_score=Decimal("5.0"),
                    period=period,
                    year="2025",
                )

                GradeEntry.objects.create(
                    assignment=assign,
                    student=student,
                    grade=grade,
                    score=Decimal(str(nota_valor)),
                    submitted_date=date.today(),
                    late_submission=False,
                    comments=f"Evaluación {nombre.lower()} - Rendimiento {'bueno' if nota_valor >= 4.0 else 'regular' if nota_valor >= 3.0 else 'bajo'}"
                )

    print("✅ Datos cargados correctamente con notas variadas por materia y actividad.")
    print("📊 Patrón de notas:")
    print("   - Matemáticas, Física, Química: Rendimiento alto (3.7-4.5)")
    print("   - Biología, Historia, Geografía: Rendimiento medio (3.4-4.1)")
    print("   - Lengua, Literatura, Inglés: Rendimiento bajo-medio (2.8-3.9)")
    print("   - Ed. Física, Artes, Tecnología: Rendimiento alto en prácticas (3.7-4.8)")

if __name__ == "__main__":
    cargar_datos_prueba_colombia()