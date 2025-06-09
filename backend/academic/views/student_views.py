# C:\Users\germa\Desktop\academic_system\backend\academic\views\student_views.py

from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db import transaction

from academic.models import Student, Attendance, Course, Grade, CourseSubject
from academic.serializers import (
    StudentSerializer,
    StudentProfileSerializer,
    GradeSerializer,
    AttendanceSerializer
)

class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("––– StudentProfileView GET –––")
        print("Usuario autenticado:", request.user)
        student = getattr(request.user, 'student_profile', None)

        if not student:
            return Response(
                {"error": "No es un estudiante."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = StudentProfileSerializer(student)
        return Response(serializer.data)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().select_related('grado', 'course')
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='my-profile')
    def my_profile(self, request):
        """
        GET /api/academic/students/my-profile/
        Devuelve el perfil del estudiante autenticado.
        """
        student = getattr(request.user, 'student_profile', None)
        if not student:
            return Response(
                {"error": "No es un estudiante."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = StudentProfileSerializer(student)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request, pk=None):
        """
        GET /api/academic/students/{pk}/profile/
        """
        student = self.get_object()
        serializer = StudentProfileSerializer(student)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def attendance_report(self, request, pk=None):
        """
        GET /api/academic/students/{pk}/attendance_report/
        Obtiene el reporte de asistencia de un estudiante
        """
        student = self.get_object()
        attendances = Attendance.objects.filter(student=student).order_by('-date')

        total_days = attendances.count()
        present_days = attendances.filter(present=True).count()
        absent_days = total_days - present_days
        attendance_rate = (present_days / total_days * 100) if total_days > 0 else 0

        data = {
            'student': StudentSerializer(student).data,
            'attendance_records': AttendanceSerializer(attendances, many=True).data,
            'statistics': {
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'attendance_rate': round(attendance_rate, 2)
            }
        }
        return Response(data)

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                student = serializer.save()

                # Si el estudiante tiene un curso asignado, añadirlo manualmente a la relación ManyToMany
                if student.course:
                    student.course.students.add(student)
                    student.course.save()

                # CENTRALIZADO: Crear usuario y enviar correo SOLO aquí
                from authentication.models import User
                from django.contrib.auth.tokens import default_token_generator
                from django.utils.http import urlsafe_base64_encode
                from django.utils.encoding import force_bytes
                from django.core.mail import send_mail
                from django.conf import settings
                import random, string

                provisional_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
                user = User.objects.create_user(
                    email=student.email,
                    password=provisional_password,
                    first_name=student.first_name,
                    last_name=student.last_name,
                    user_type="student",
                    email_confirmed=False
                )

                student.user = user
                student.save()

                # Generar token y enviar correo con link al frontend
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                frontend_link = f"http://localhost:5173/cambiar-contraseña/{uid}/{token}/"

                send_mail(
                    subject="Activa tu cuenta de estudiante",
                    message=(
                        f"¡Hola {student.first_name}!\n\n"
                        f"Para activar tu cuenta y elegir tu contraseña, haz clic aquí:\n\n"
                        f"{frontend_link}\n\n"
                        "Este enlace expira en 24 horas. Si tienes problemas, copia y pega la URL en tu navegador."
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[student.email],
                    fail_silently=False,
                )

                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        with transaction.atomic():
            student = self.get_object()
            serializer = self.get_serializer(student, data=request.data, partial=True)
            if serializer.is_valid():
                student = serializer.save()

                # Si cambia de curso, reasignamos materias
                if 'course_id' in request.data:
                    Grade.objects.filter(student=student).delete()
                    materias_asignadas = CourseSubject.objects.filter(course=student.course)
                    for materia in materias_asignadas:
                        Grade.objects.create(student=student, course=student.course, value=0)

                    print("Materias actualizadas para", student.first_name)

                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def profile_detailed(self, request, pk=None):
        """
        GET /api/academic/students/{pk}/profile_detailed/
        Obtener el perfil completo del estudiante con lista de materias
        """
        estudiante = self.get_object()
        materias = CourseSubject.objects.filter(course=estudiante.course).select_related("subject")

        data = {
            "id": estudiante.id,
            "nombre_completo": f"{estudiante.first_name} {estudiante.last_name}",
            "curso": {
                "id": estudiante.course.id,
                "nombre": estudiante.course.name,
                "grado": estudiante.course.grado.numero,
            } if estudiante.course else None,
            "materias": [
                {
                    "id": materia.subject.id,
                    "nombre": materia.subject.name,
                    "codigo": materia.subject.code
                }
                for materia in materias
            ]
        }
        return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_grades_view(request):
    """
    GET /api/academic/students/my-grades/
    Retorna todas las calificaciones del estudiante autenticado
    """
    student = getattr(request.user, 'student_profile', None)
    if student is None:
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response(
                {"error": "No es un estudiante."},
                status=status.HTTP_403_FORBIDDEN
            )

    grades = Grade.objects.filter(student=student).order_by('period')
    serializer = GradeSerializer(grades, many=True)
    return Response(serializer.data)
