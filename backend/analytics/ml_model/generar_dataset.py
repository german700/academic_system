# backend/analytics/ml_model/generar_dataset.py

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
import csv
from datetime import date
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_project.settings')
django.setup()

from academic.models import Student, Attendance, GradeEntry

# Mapeo colombiano de estratos 1 a 6
ESTRATO_MAP = {
    "BAJO_BAJO": 1,
    "BAJO": 2,
    "MEDIO_BAJO": 3,
    "MEDIO": 4,
    "MEDIO_ALTO": 5,
    "ALTO": 6
}

# Construimos la ruta absoluta al dataset.csv asumiendo que el cwd es
#   C:\Users\germa\Desktop\academic_system\backend\
base_dir = os.getcwd()  # Debe ser …/academic_system/backend
dataset_path = os.path.join(base_dir, "analytics", "ml_model", "dataset.csv")

# Abrimos (o creamos) el CSV en modo escritura
with open(dataset_path, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow([
        "student_id", "student_email", "course", "grade", "subject", "period", "late",
        "year", "attendance", "assignment_type", "exam_score", "task_score", "estrato", "edad"
    ])

    for student in Student.objects.all():
        try:
            estrato_str = (student.socioeconomic_status or "").upper()
            estrato = ESTRATO_MAP.get(estrato_str, 3)  # Por defecto: MEDIO_BAJO = 3

            edad = (date.today() - student.date_of_birth).days // 365

            total = Attendance.objects.filter(student=student).count()
            presentes = Attendance.objects.filter(student=student, present=True).count()
            attendance_ratio = round(presentes / total, 2) if total > 0 else 0

            for entry in GradeEntry.objects.filter(student=student).select_related(
                    "assignment", "assignment__course_subject__subject"):
                assignment = entry.assignment
                if not assignment:
                    continue

                grade = round((float(entry.score) / float(assignment.max_score)) * 5.0, 2)
                assignment_type = assignment.assignment_type

                exam_score = grade if assignment_type == "EXAMEN" else 0
                task_score = grade if assignment_type in ["TAREA", "PROYECTO"] else 0

                writer.writerow([
                    student.id,
                    student.user.email,
                    student.course.name if student.course else "",
                    grade,
                    assignment.course_subject.subject.name,
                    assignment.period,
                    int(entry.late_submission),
                    assignment.year,
                    attendance_ratio,
                    assignment_type,
                    exam_score,
                    task_score,
                    estrato,
                    edad
                ])
        except Exception as e:
            print(f"❌ Error con estudiante {student.id}: {e}")

print("✅ Dataset generado exitosamente con columnas enriquecidas.")
