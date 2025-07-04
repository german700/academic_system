from academic.models import Teacher, CourseSubject, Assignment, GradeEntry

teacher_id = 1
period = 1

teacher = Teacher.objects.get(id=teacher_id)
cs_list = CourseSubject.objects.filter(teacher=teacher).select_related("course", "subject")

print(f"📊 Análisis del docente: {teacher.first_name} {teacher.last_name} (ID {teacher_id})\n")

for cs in cs_list:
    print(f"➡ Curso: {cs.course.name} | Materia: {cs.subject.name}")

    # Tareas del periodo
    tasks = Assignment.objects.filter(course_subject=cs, period=period)
    print(f"   📝 Tareas asignadas: {tasks.count()}")

    # Calificaciones para esas tareas
    grades = GradeEntry.objects.filter(assignment__in=tasks)
    print(f"   🎯 Calificaciones registradas: {grades.count()}")

    # Entregas tardías
    late = grades.filter(late_submission=True).count()
    print(f"   ⏰ Entregas tardías: {late}")

    # Estudiantes distintos con calificaciones
    students = grades.values_list("student", flat=True).distinct()
    print(f"   👥 Estudiantes con alguna nota: {len(students)}\n")
