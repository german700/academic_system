# C:\Users\germa\Desktop\academic_system\backend\academic_project\populate_fields.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_project.settings')  # ← corregido
django.setup()

from academic.models import GradeEntry, Assignment, Student

def populate_null_fields():
    assignment = Assignment.objects.first()
    student = Student.objects.first()
    
    if assignment and student:
        # Actualizar GradeEntries sin assignment
        entries = GradeEntry.objects.filter(assignment__isnull=True)
        count_assignments = entries.count()
        for entry in entries:
            entry.assignment = assignment
            entry.save()
        print(f"Asignado Assignment por defecto a {count_assignments} GradeEntries.")
        
        # Actualizar GradeEntries sin student
        entries = GradeEntry.objects.filter(student__isnull=True)
        count_students = entries.count()
        for entry in entries:
            entry.student = student
            entry.save()
        print(f"Asignado Student por defecto a {count_students} GradeEntries.")
        
    else:
        print("Faltan datos en Assignment o Student.")
        print(f"Assignment: {assignment}")
        print(f"Student: {student}")

if __name__ == "__main__":
    populate_null_fields()
