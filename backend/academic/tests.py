# C:\Users\germa\Desktop\academic_system\backend\academic\tests.py

from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from academic.models import (
    Teacher, Course, Student, Grado, Subject,
    CourseSubject, AcademicPeriod, Assignment, GradeEntry
)
from datetime import date, timedelta

User = get_user_model()

class TeacherViewsTests(APITestCase):
    def setUp(self):
        # 1) Crear usuario docente y autenticarlo
        self.user = User.objects.create_user(
            email='teacher1@example.com',
            password='pass1234',
            user_type='teacher',
            first_name='Docente',
            last_name='Prueba'
        )
        self.teacher = Teacher.objects.create(
            user=self.user,
            teacher_id="T123",
            specialization="Math"
        )
        # Forzamos la autenticación en cada request de test
        self.client.force_authenticate(user=self.user)

        # 2) Crear grado, curso y asociar el docente al curso
        self.grado = Grado.objects.create(numero=13)
        self.course = Course.objects.create(
            name="13A",
            code="13A-01",
            academic_year="2025",
            grado=self.grado
        )
        self.course.teachers.add(self.teacher)

        # 3) Crear usuario y perfil de estudiante, y asignarlo al curso
        self.student_user = User.objects.create_user(
            email='student1@example.com',
            password='pass1234',
            user_type='student',
            first_name='Estudiante',
            last_name='Prueba'
        )
        self.student = Student.objects.create(
            user=self.student_user,
            student_id="S001",
            grado=self.grado,
            course=self.course
        )

        # 4) Crear materia y CourseSubject (evitando duplicados)
        self.subject = Subject.objects.create(
            name="Matemáticas",
            code="MAT101",
            grado=self.grado
        )
        self.course_subject, _ = CourseSubject.objects.get_or_create(
            course=self.course,
            subject=self.subject,
            defaults={'teacher': self.teacher}
        )

        # 5) Crear un periodo académico activo
        self.period = AcademicPeriod.objects.create(
            name="P1",
            number=1,
            start_date=date.today() - timedelta(days=30),
            end_date=date.today() + timedelta(days=30),
            edit_deadline=date.today() + timedelta(days=15),
            academic_year="2025"
        )

        # 6) Crear Assignment y GradeEntry con fechas timezone-aware
        self.assignment = Assignment.objects.create(
            course_subject=self.course_subject,
            name="Tarea 1",
            description="Tarea de prueba",
            assignment_type="TAREA",
            date_assigned=timezone.now().date(),
            due_date=(timezone.now() + timedelta(days=7)).date(),
            weight=1.0,
            max_score=100.00,
            period=1,
            year="2025"
        )
        self.grade_entry = GradeEntry.objects.create(
            assignment=self.assignment,
            student=self.student,
            score=80.00,
            submitted_date=timezone.now(),
            late_submission=False
        )

    def test_get_teacher_courses(self):
        """Prueba obtener cursos del docente"""
        url = reverse('teacher-courses')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificar que retorna una lista
        self.assertIsInstance(response.data, list)
        # Verificar que incluye el curso creado
        course_names = [course['name'] for course in response.data]
        self.assertIn(self.course.name, course_names)
        print("✅ Test: Obtener cursos del docente - PASÓ")

    def test_get_course_students(self):
        """Prueba obtener estudiantes de un curso"""
        url = reverse('teacher-course-students', args=[self.course.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificar que retorna una lista
        self.assertIsInstance(response.data, list)
        # Verificar que incluye el estudiante creado
        if response.data:
            student_ids = [student['student_id'] for student in response.data]
            self.assertIn(self.student.student_id, student_ids)
        print("✅ Test: Obtener estudiantes del curso - PASÓ")

    def test_search_students(self):
        """Prueba buscar estudiantes"""
        url = reverse('teacher-search-students')
        # Buscar por student_id
        response = self.client.get(url, {'q': self.student.student_id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificar que retorna una lista
        self.assertIsInstance(response.data, list)
        # Si hay resultados, verificar que incluye nuestro estudiante
        if response.data:
            student_ids = [student['student_id'] for student in response.data]
            self.assertIn(self.student.student_id, student_ids)
        print("✅ Test: Buscar estudiantes - PASÓ")

    def test_get_course_subject_grades(self):
        """Prueba obtener calificaciones de curso-materia"""
        # Asegurar que el CourseSubject tenga el teacher correcto
        self.course_subject.teacher = self.teacher
        self.course_subject.save()
        
        url = reverse('teacher-course-subject-grades', args=[self.course.id, self.subject.id])
        response = self.client.get(url, {'period': 1})
        
        # Debug: imprimir información útil si falla
        if response.status_code != status.HTTP_200_OK:
            print(f"❌ Error: Status {response.status_code}")
            print(f"Response data: {response.data}")
            print(f"Teacher: {self.teacher}")
            print(f"User: {self.user}")
            print(f"CourseSubject teacher: {self.course_subject.teacher}")
            
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificar que retorna una lista
        self.assertIsInstance(response.data, list)
        print("✅ Test: Obtener calificaciones del curso-materia - PASÓ")

    def test_get_student_analysis(self):
        """Prueba obtener análisis del estudiante"""
        # Verificar que el CourseSubject tenga el teacher correcto
        self.course_subject.teacher = self.teacher
        self.course_subject.save()
        
        url = reverse('teacher-student-subject-analysis', args=[self.student.id])
        response = self.client.get(url, {'subject_id': self.subject.id})
        
        # Debug: imprimir información útil si falla
        if response.status_code != status.HTTP_200_OK:
            print(f"❌ Error: Status {response.status_code}")
            print(f"Response data: {response.data}")
            print(f"Student course: {self.student.course}")
            print(f"CourseSubject exists: {CourseSubject.objects.filter(course=self.student.course, subject=self.subject, teacher=self.teacher).exists()}")
            
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificar que la respuesta contiene los datos esperados
        self.assertIn('subject', response.data)
        print("✅ Test: Obtener análisis del estudiante - PASÓ")

    def test_no_edicion_fuera_de_plazo(self):
        """Prueba que no se puede editar calificaciones fuera del plazo establecido"""
        # Crear periodo antiguo con plazo de edición vencido
        old_period = AcademicPeriod.objects.create(
            name="P0",
            number=0,
            start_date=date.today() - timedelta(days=90),
            end_date=date.today() - timedelta(days=60),
            edit_deadline=date.today() - timedelta(days=59),
            academic_year="2025"
        )
        
        # Crear una asignación con el periodo vencido
        old_assignment = Assignment.objects.create(
            course_subject=self.course_subject,
            name="Tarea Antigua",
            description="Tarea con plazo vencido",
            assignment_type="TAREA",
            date_assigned=date.today() - timedelta(days=80),
            due_date=date.today() - timedelta(days=70),
            weight=1.0,
            max_score=100.00,
            period=0,  # Periodo vencido
            year="2025"
        )
        
        # Crear una calificación con el periodo vencido
        old_grade = GradeEntry.objects.create(
            assignment=old_assignment,
            student=self.student,
            score=75.00,
            submitted_date=timezone.now() - timedelta(days=70),
            late_submission=False
        )
        
        # Intentar actualizar la calificación (esto debería fallar con 403)
        url = f'/api/academic/grade-entries/{old_grade.id}/'
          # Ajusta el nombre de la URL según tu urls.py
        update_data = {
            'score': 85.00,
            'comments': 'Actualización fuera de plazo'
        }
        
        response = self.client.patch(url, update_data, format='json')
        
        # Verificar que se devuelve error 403 (Forbidden)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Verificar que el mensaje de error indica el problema del plazo
        self.assertIn('plazo', response.data.get('error', '').lower())
        
        # Verificar que la calificación no se modificó
        old_grade.refresh_from_db()
        self.assertEqual(old_grade.score, 75.00)
        
        print("✅ Test: No edición fuera de plazo - PASÓ")

    def tearDown(self):
        """Limpiar datos después de cada test"""
        # Limpiar todos los objetos creados
        GradeEntry.objects.all().delete()
        Assignment.objects.all().delete()
        CourseSubject.objects.all().delete()
        AcademicPeriod.objects.all().delete()
        Subject.objects.all().delete()
        Student.objects.all().delete()
        Course.objects.all().delete()
        Teacher.objects.all().delete()
        Grado.objects.all().delete()
        User.objects.all().delete()