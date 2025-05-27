# backend/listar_estudiantes.py

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "academic_project.settings")
django.setup()

from authentication.models import User
from academic.models import Student

def listar_estudiantes_confirmados():
    estudiantes = Student.objects.select_related("user", "course", "grado").all()
    
    if not estudiantes.exists():
        print("No hay estudiantes registrados.")
        return

    print("📋 Estudiantes registrados y confirmados:\n")
    for estudiante in estudiantes:
        user = estudiante.user
        if user and user.is_active:
            print(f"- {user.first_name} {user.last_name} ({user.email})")
            print(f"  ID estudiante: {estudiante.student_id}")
            print(f"  Curso: {estudiante.course.name if estudiante.course else 'Sin curso'}")
            print(f"  Grado: {estudiante.course.grado.numero if estudiante.course and estudiante.course.grado else 'N/A'}")
            print(f"  Edad: {(2025 - estudiante.date_of_birth.year) if estudiante.date_of_birth else 'N/A'}")
            print("")

if __name__ == "__main__":
    listar_estudiantes_confirmados()