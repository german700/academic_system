#C:\Users\germa\Desktop\academic_system\backend\academic\views.py
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.views import APIView
from django.db import transaction
from .models import (
    Student, Teacher, Course, Grade, Administrator, Subject, Grado, 
    CourseSubject, Attendance, Assignment, GradeEntry
)
from .serializers import (
    StudentSerializer, StudentProfileSerializer, TeacherSerializer, CourseSerializer, 
    GradeSerializer, AdministratorSerializer, SubjectSerializer, GradoSerializer, 
    CourseSubjectSerializer, AttendanceSerializer, AssignmentSerializer, GradeEntrySerializer
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

    # ----- tu nueva acción -----
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
        
        # Calcular estadísticas básicas
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
        """ Obtener el perfil completo del estudiante """
        estudiante = self.get_object()
        materias = CourseSubject.objects.filter(course=estudiante.course).select_related("subject")

        # Serializar los datos
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

# vistas separadas para calificaciones
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_grades_view(request):
    # 1) intenta por related_name…
    student = getattr(request.user, 'student_profile', None)
    # 2) …y si falla, busca directamente en la tabla Student
    if student is None:
        from academic.models import Student
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response(
                {"error": "No es un estudiante."},
                status=status.HTTP_403_FORBIDDEN
            )

    # A partir de aquí, ya tienes student garantizado
    grades = Grade.objects.filter(student=student).order_by('period')
    serializer = GradeSerializer(grades, many=True)
    return Response(serializer.data)

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def assignments(self, request, pk=None):
        """
        GET /api/academic/teachers/{pk}/assignments/
        Obtiene todas las tareas creadas por un profesor
        """
        teacher = self.get_object()
        # Obtener materias que enseña el profesor
        course_subjects = CourseSubject.objects.filter(teacher=teacher)
        assignments = Assignment.objects.filter(course_subject__in=course_subjects)
        
        return Response(AssignmentSerializer(assignments, many=True).data)

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            teacher = serializer.save()

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
                email=teacher.email,
                password=provisional_password,
                first_name=teacher.first_name,
                last_name=teacher.last_name,
                user_type="teacher",
                email_confirmed=False
            )

            teacher.user = user
            teacher.save()

            # Generar token y enviar correo con link al frontend
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_link = f"http://localhost:5173/cambiar-contraseña/{uid}/{token}/"

            send_mail(
                subject="Activa tu cuenta de docente",
                message=(
                    f"¡Hola {teacher.first_name}!\n\n"
                    f"Para activar tu cuenta y elegir tu contraseña, haz clic aquí:\n\n"
                    f"{frontend_link}\n\n"
                    "Este enlace expira en 24 horas. Si tienes problemas, copia y pega la URL en tu navegador."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[teacher.email],
                fail_silently=False,
            )

            return Response(self.get_serializer(teacher).data, status=status.HTTP_201_CREATED)

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def assignments(self, request, pk=None):
        """
        GET /api/academic/subjects/{pk}/assignments/
        Obtiene todas las tareas de una materia específica
        """
        subject = self.get_object()
        course_subjects = CourseSubject.objects.filter(subject=subject)
        assignments = Assignment.objects.filter(course_subject__in=course_subjects)
        return Response(AssignmentSerializer(assignments, many=True).data)

class GradoViewSet(viewsets.ModelViewSet):
    queryset = Grado.objects.all().order_by('numero')
    serializer_class = GradoSerializer
    permission_classes = [IsAuthenticated]

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.prefetch_related('students', 'teachers', 'course_subjects__subject').all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        # Obtener el curso actual
        curso = self.get_object()
        # Recuperar los estudiantes asociados usando el related name definido
        estudiantes = curso.students.all()
        # Retornar los datos usando el serializador de estudiantes
        return Response(StudentSerializer(estudiantes, many=True).data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def attendance_summary(self, request, pk=None):
        """
        GET /api/academic/courses/{pk}/attendance_summary/
        Obtiene resumen de asistencia de todos los estudiantes de un curso
        """
        course = self.get_object()
        students = course.students.all()
        
        summary_data = []
        for student in students:
            attendances = Attendance.objects.filter(student=student)
            total_days = attendances.count()
            present_days = attendances.filter(present=True).count()
            attendance_rate = (present_days / total_days * 100) if total_days > 0 else 0
            
            summary_data.append({
                'student': StudentSerializer(student).data,
                'attendance_rate': round(attendance_rate, 2),
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': total_days - present_days
            })
        
        return Response(summary_data)

    def create(self, request, *args, **kwargs):
        print("Datos recibidos del frontend en create():", request.data)

        with transaction.atomic():
            docentes_ids = request.data.get("teachers_ids", [])
            docentes_ids = docentes_ids if isinstance(docentes_ids, list) else []

            print("IDs de docentes recibidos:", docentes_ids)

            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                curso = serializer.save()
                print("Curso guardado con ID:", curso.id)

                # Asignar materias automáticamente según el grado
                if curso.grado:
                    materias_asignadas = Subject.objects.filter(grado=curso.grado)
                    for materia in materias_asignadas:
                        CourseSubject.objects.get_or_create(course=curso, subject=materia)  # Evita duplicados
                    print("Materias asignadas automáticamente al curso:", [m.name for m in materias_asignadas])

                if docentes_ids:
                    curso.teachers.set(docentes_ids)
                    curso.save()
                    print("Docentes asignados al curso:", [d.user.first_name for d in curso.teachers.all()])

                return Response(CourseSerializer(curso).data, status=status.HTTP_201_CREATED)
            else:
                print("ERROR: Datos inválidos", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

class GradeEntryViewSet(viewsets.ModelViewSet):
    queryset = GradeEntry.objects.all()
    serializer_class = GradeEntrySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_assignment(self, request):
        """
        GET /api/academic/grade-entries/by_assignment/?assignment_id=X
        Obtiene todas las calificaciones de una tarea específica
        """
        assignment_id = request.query_params.get('assignment_id')
        if not assignment_id:
            return Response(
                {"error": "Se requiere el parámetro assignment_id"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        grade_entries = GradeEntry.objects.filter(assignment_id=assignment_id)
        return Response(GradeEntrySerializer(grade_entries, many=True).data)

class IsSuperUser(BasePermission):
    """Permiso personalizado para permitir acceso solo a superusuarios."""
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser

class GradoMateriaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request, grado_id=None):
        """ Obtener todas las materias de un grado específico """
        grado = get_object_or_404(Grado, id=grado_id)
        materias = Subject.objects.filter(grado=grado)
        return Response(SubjectSerializer(materias, many=True).data)

    def create(self, request, grado_id=None):
        """ Agregar una materia a un grado y actualizar los cursos de ese grado """
        grado = get_object_or_404(Grado, id=grado_id)
        materia_data = request.data
        materia_data['grado'] = grado.id  # Asigna el grado desde la URL
        materia_serializer = SubjectSerializer(data=materia_data)
        
        if materia_serializer.is_valid():
            materia = materia_serializer.save(grado=grado)
            
            # Asignar la materia a todos los cursos del grado
            cursos = Course.objects.filter(grado=grado)
            for curso in cursos:
                CourseSubject.objects.get_or_create(course=curso, subject=materia)  # Evita duplicados
            
            return Response(SubjectSerializer(materia).data, status=status.HTTP_201_CREATED)
        return Response(materia_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, grado_id=None, materia_id=None):
        """ Eliminar una materia de un grado y de todos sus cursos """
        try:
            print("Intentando eliminar materia", materia_id, "del grado", grado_id)
            materia = Subject.objects.get(id=materia_id, grado__id=grado_id)

            # Eliminar la materia de todos los cursos de ese grado
            eliminados = CourseSubject.objects.filter(subject=materia).delete()
            print("Materias eliminadas en cursos:", eliminados)

            # Eliminar la materia
            materia.delete()
            print("Materia eliminada correctamente")

            return Response({"message": "Materia eliminada correctamente"}, status=status.HTTP_204_NO_CONTENT)
        except Subject.DoesNotExist:
            print("ERROR: Materia no encontrada en este grado")
            return Response({"error": "Materia no encontrada en este grado"}, status=status.HTTP_404_NOT_FOUND)

class CourseSubjectViewSet(viewsets.ModelViewSet):
    queryset = CourseSubject.objects.all()
    serializer_class = CourseSubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        print("Consultando CourseSubject con ID", self.kwargs.get('pk'))
        return super().get_queryset()

class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.objects.all()
    serializer_class = AdministratorSerializer
    permission_classes = [IsSuperUser]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == "director":
            return Course.objects.all()
        elif user.user_type == "teacher":
            return Course.objects.filter(teacher__user=user)
        elif user.user_type == "student":
            return Course.objects.filter(students__user=user) 
        return Course.objects.none()

# Nuevos ViewSets para los modelos agregados
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().select_related('student', 'subject').order_by('-date')
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_student(self, request):
        """
        GET /api/academic/attendances/by_student/?student_id=X
        Obtiene todas las asistencias de un estudiante específico
        """
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {"error": "Se requiere el parámetro student_id"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendances = Attendance.objects.filter(student_id=student_id).order_by('-date')
        return Response(AttendanceSerializer(attendances, many=True).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_date_range(self, request):
        """
        GET /api/academic/attendances/by_date_range/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
        Obtiene asistencias en un rango de fechas
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {"error": "Se requieren los parámetros start_date y end_date"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendances = Attendance.objects.filter(
            date__range=[start_date, end_date]
        ).order_by('-date')
        
        return Response(AttendanceSerializer(attendances, many=True).data)

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related('course_subject__subject', 'course_subject__course').order_by('-date_assigned')
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def grade_entries(self, request, pk=None):
        """
        GET /api/academic/assignments/{pk}/grade_entries/
        Obtiene todas las calificaciones de una tarea específica
        """
        assignment = self.get_object()
        grade_entries = GradeEntry.objects.filter(assignment=assignment)
        return Response(GradeEntrySerializer(grade_entries, many=True).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_subject(self, request):
        """
        GET /api/academic/assignments/by_subject/?subject_id=X
        Obtiene todas las tareas de una materia específica
        """
        subject_id = request.query_params.get('subject_id')
        if not subject_id:
            return Response(
                {"error": "Se requiere el parámetro subject_id"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignments = Assignment.objects.filter(course_subject__subject_id=subject_id).order_by('-date_assigned')
        return Response(AssignmentSerializer(assignments, many=True).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_type(self, request):
        """
        GET /api/academic/assignments/by_type/?assignment_type=EXAMEN
        Obtiene todas las tareas de un tipo específico
        """
        assignment_type = request.query_params.get('assignment_type')
        if not assignment_type:
            return Response(
                {"error": "Se requiere el parámetro assignment_type"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignments = Assignment.objects.filter(assignment_type=assignment_type).order_by('-date_assigned')
        return Response(AssignmentSerializer(assignments, many=True).data)