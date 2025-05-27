import django
import os
import sys
import pandas as pd

# Agregar el directorio del proyecto al Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "academic_project.settings")
django.setup()

from academic.models import GradeEntry, Student

def exportar_csv():
    rows = []

    for student in Student.objects.select_related("course", "grado").all():
        entries = GradeEntry.objects.filter(student=student).select_related(
            "assignment__course_subject__subject"
        )
        for entry in entries:
            rows.append({
                "student_id": student.id,
                "student_email": student.email,
                "course": student.course.name if student.course else None,
                "grade": round((float(entry.score) / float(entry.assignment.max_score)) * 5.0, 2),
                "subject": entry.assignment.course_subject.subject.name,
                "period": entry.assignment.period,
                "late": int(entry.late_submission),
                "year": entry.assignment.year,
            })

    df = pd.DataFrame(rows)
    
    # Crear el directorio si no existe
    os.makedirs("ml_model", exist_ok=True)
    df.to_csv("ml_model/dataset.csv", index=False)
    print("✅ Datos exportados correctamente")

if __name__ == "__main__":
    exportar_csv()