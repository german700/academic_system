# C:\Users\germa\Desktop\academic_system\backend\academic\views\teacher_views.py

from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction

from io import BytesIO
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet

from academic.models import (
    Teacher,
    Course,
    Student,
    CourseSubject,
    Assignment,
    GradeEntry,
    Subject,
    AcademicPeriod
)
from academic.serializers import (
    TeacherSerializer,
    CourseSerializer,
    StudentSerializer,
    AssignmentSerializer,
    GradeEntrySerializer,
    AcademicPeriodSerializer  # Nuevo import necesario
)
from academic.permissions import IsTeacher, IsTeacherOrAdmin


# ✅ Funciones de utilidad para verificaciones comunes
def get_course_if_teacher(request, course_id):
    """
    Devuelve el curso si el docente autenticado está asignado a él.
    Lanza Response 403 si no está autorizado.
    """
    teacher = request.user.teacher_profile
    try:
        return Course.objects.get(id=course_id, course_subjects__teacher=teacher)
    except Course.DoesNotExist:
        return Response({"error": "No tiene permiso para este curso"}, status=status.HTTP_403_FORBIDDEN)


def is_teacher_assigned_to_subject(course_id, subject_id, teacher):
    """
    Verifica si un docente está asignado a una materia específica en un curso.
    """
    return CourseSubject.objects.filter(
        course_id=course_id, 
        subject_id=subject_id, 
        teacher=teacher
    ).exists()


def get_course_subject_if_teacher(request, course_id, subject_id):
    """
    Devuelve el CourseSubject si el docente está asignado.
    Lanza Response 403 si no está autorizado.
    """
    teacher = request.user.teacher_profile
    if not is_teacher_assigned_to_subject(course_id, subject_id, teacher):
        return Response({"error": "No autorizado para esta materia en este curso."}, status=status.HTTP_403_FORBIDDEN)
    
    return get_object_or_404(CourseSubject, course_id=course_id, subject_id=subject_id)


class TeacherViewSet(viewsets.ModelViewSet):
    """
    /api/academic/teachers/
    CRUD de docentes + GET /api/academic/teachers/{pk}/assignments/
    """
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrAdmin]

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def assignments(self, request, pk=None):
        """
        GET /api/academic/teachers/{pk}/assignments/
        Obtiene todas las tareas creadas por un profesor
        """
        teacher = self.get_object()
        course_subjects = CourseSubject.objects.filter(teacher=teacher)
        assignments = Assignment.objects.filter(course_subject__in=course_subjects)
        return Response(AssignmentSerializer(assignments, many=True).data)

    def create(self, request, *args, **kwargs):
        """
        Al crear un docente, también se genera un usuario y se envía correo de activación.
        """
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            teacher = serializer.save()

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


class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        teacher = request.user.teacher_profile

        # Periodo actual
        today = timezone.now().date()
        current_period = AcademicPeriod.objects.filter(
            start_date__lte=today,
            end_date__gte=today
        ).first()

        # Cursos del docente
        courses = Course.objects.filter(course_subjects__teacher=teacher).distinct()

        # Serializar cursos
        from academic.serializers import CourseSerializerMinimal
        serialized_courses = CourseSerializerMinimal(courses, many=True).data

        return Response({
            "current_period": {
                "name": current_period.name,
                "number": current_period.number,
                "academic_year": current_period.academic_year
            } if current_period else None,
            "courses": serialized_courses
        })


class TeacherCoursesView(APIView):
    """
    GET /api/academic/teacher/courses/
    Listado de cursos donde el docente autenticado está asignado
    """
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        teacher = request.user.teacher_profile
        # ✅ Corregido: usar course_subjects en lugar de teachers
        courses = Course.objects.filter(course_subjects__teacher=teacher).distinct().prefetch_related('grado')
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TeacherCourseStudentsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, course_id):
        course = get_course_if_teacher(request, course_id)
        if isinstance(course, Response):
            return course

        # estudiantes
        students = course.students.all()
        students_data = StudentSerializer(students, many=True).data

        # materias que enseña este docente en este curso
        teacher = request.user.teacher_profile
        cs_qs = CourseSubject.objects.filter(course=course, teacher=teacher)
        subjects = [
          {"id": cs.subject.id, "name": cs.subject.name}
          for cs in cs_qs
        ]

        return Response({
          "id": course.id,
          "name": course.name,
          "grado": {"numero": course.grado.numero},
          "students": students_data,
          "subjects": subjects
        })


class TeacherCoursePDFView(APIView):
    """
    GET /api/academic/teacher/course/{course_id}/planilla-pdf/
    Genera un PDF con la planilla vacía de los estudiantes de un curso
    """
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, course_id):
        # ✅ Usar función helper unificada
        course = get_course_if_teacher(request, course_id)
        if isinstance(course, Response):
            return course

        students = course.students.all().order_by('last_name', 'first_name')

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        title = Paragraph(f"Planilla Vacía – Curso: {course.name}", styles['Heading2'])
        elements.append(title)
        elements.append(Spacer(1, 12))

        data = [
            ['ID Estudiante', 'Nombre Completo', 'Asistencias', 'Faltas', 'Nota Periodo', 'Observaciones']
        ]
        for est in students:
            full_name = f"{est.first_name} {est.last_name}"
            data.append([est.student_id, full_name, '', '', '', ''])

        table = Table(data, colWidths=[80, 150, 80, 80, 80, 100])
        ts = TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ])
        table.setStyle(ts)
        elements.append(table)

        doc.build(elements)
        buffer.seek(0)
        return Response(buffer.getvalue(), content_type='application/pdf')


class TeacherCourseSubjectGradesView(APIView):
    """
    GET /api/academic/teacher/course/{course_id}/subject/{subject_id}/grades/?period={period}
    Obtiene las notas de un curso en una materia y periodo determinado
    (solo si el docente está asignado a esa materia)
    """
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, course_id, subject_id):
        # ✅ Usar función helper unificada
        course_subject = get_course_subject_if_teacher(request, course_id, subject_id)
        if isinstance(course_subject, Response):
            return course_subject

        period = request.query_params.get('period')
        if not period:
            return Response({"error": "Debes indicar período (?period=)."}, status=status.HTTP_400_BAD_REQUEST)

        assignments = Assignment.objects.filter(course_subject=course_subject, period=period)
        grade_entries = GradeEntry.objects.filter(
            assignment__in=assignments,
            student__course__id=course_id
        ).select_related('student', 'assignment')

        result = []
        for est in course_subject.course.students.all():
            entries_est = grade_entries.filter(student=est)
            notas = []
            detalles = []
        for ge in entries_est:
            notas.append(float(ge.score))
            detalles.append({
                'entryId': ge.id,
                'assignmentId': ge.assignment.id,
                'weight': ge.assignment.weight,
                'score': float(ge.score)
        })
        avg = round(sum(notas)/len(notas), 2) if notas else None
        result.append({
            'student': {
                'id': est.id,
                'name': f"{est.first_name} {est.last_name}",
                'student_id': est.student_id,
        },
        'notas': notas,
        'entries': detalles,           # aquí le metes los detalles
        'promedio': avg
    })
        return Response(result, status=status.HTTP_200_OK)


class TeacherStudentSubjectAnalysisView(APIView):
    """
    GET /api/academic/teacher/student/{student_id}/analysis/?subject_id={subject_id}
    Análisis IA del estudiante en una materia para el periodo actual (solo si el docente enseña esa materia)
    """
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_current_period(self):
        today = timezone.now().date()
        try:
            return AcademicPeriod.objects.get(start_date__lte=today, end_date__gte=today)
        except AcademicPeriod.DoesNotExist:
            return None

    def get(self, request, student_id):
        teacher = request.user.teacher_profile
        subject_id = request.query_params.get('subject_id')
        if not subject_id:
            return Response({"error": "Debes indicar ?subject_id="}, status=status.HTTP_400_BAD_REQUEST)

        student = get_object_or_404(Student, pk=student_id)
        
        # ✅ Usar función helper para verificar autorización
        if not is_teacher_assigned_to_subject(student.course.id, subject_id, teacher):
            return Response({"error": "No autorizado para esta materia en este curso."}, status=status.HTTP_403_FORBIDDEN)

        period_obj = self.get_current_period()
        if not period_obj:
            return Response({"error": "No hay periodo académico activo."}, status=status.HTTP_400_BAD_REQUEST)

        current_period = period_obj.number
        from analytics.services import analizar_rendimiento_estudiante_completo

        full_analysis = analizar_rendimiento_estudiante_completo(student)
        materia_obj = get_object_or_404(Subject, pk=subject_id)
        materia_nombre = materia_obj.name

        promedios_materias = [
            m for m in full_analysis.get("promedios_por_materia", [])
            if m["materia"] == materia_nombre
        ]
        resumen_periodo = [
            p for p in full_analysis.get("resumen_por_periodo", [])
            if p["periodo"] == current_period
        ]

        data = {
            "student": {
                "id": student.id,
                "name": f"{student.first_name} {student.last_name}",
                "student_id": student.student_id
            },
            "subject": {
                "id": materia_obj.id,
                "name": materia_nombre
            },
            "period": current_period,
            "analysis_subject": {
                "promedio_materia": promedios_materias[0] if promedios_materias else None,
                "detalle_periodo": resumen_periodo[0] if resumen_periodo else None,
                "informe_narrativo": full_analysis.get("informe_narrativo", "")
            }
        }
        return Response(data, status=status.HTTP_200_OK)