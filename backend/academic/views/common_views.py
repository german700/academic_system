# C:\Users\germa\Desktop\academic_system\backend\academic\views\common_views.py

from django.db.models import Q
from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.db import transaction

from academic.models import (
    Subject,
    Grado,
    Course,
    Grade,
    GradeEntry,
    Attendance,
    Assignment,
    CourseSubject,
    Student,
    Administrator,
    AcademicPeriod
)
from academic.serializers import (
    SubjectSerializer,
    GradoSerializer,
    CourseSerializer,
    GradeSerializer,
    GradeEntrySerializer,
    AttendanceSerializer,
    AssignmentSerializer,
    CourseSubjectSerializer,
    StudentSerializer,
    AdministratorSerializer,
)
from academic.permissions import IsTeacher, IsWithinPeriod


class TeacherSearchStudentsView(APIView):
    """
    GET /api/academic/teacher/search-students/?q={texto}
    Busca estudiantes por nombre, apellido, email o ID, 
    pero solo dentro de los cursos que el docente enseña.
    """
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        teacher = request.user.teacher_profile

        courses = Course.objects.filter(teachers=teacher)
        allowed_student_ids = Student.objects.filter(course__in=courses).values_list('pk', flat=True)

        students = Student.objects.filter(pk__in=allowed_student_ids).filter(
            Q(first_name__icontains=q) |
            Q(last_name__icontains=q) |
            Q(email__icontains=q) |
            Q(student_id__icontains=q)
        ).distinct()

        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SubjectViewSet(viewsets.ModelViewSet):
    """
    /api/academic/subjects/
    CRUD de materias + GET /api/academic/subjects/{pk}/assignments/
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def assignments(self, request, pk=None):
        subject = self.get_object()
        course_subjects = CourseSubject.objects.filter(subject=subject)
        assignments = Assignment.objects.filter(course_subject__in=course_subjects)
        return Response(AssignmentSerializer(assignments, many=True).data)


class GradoViewSet(viewsets.ModelViewSet):
    """
    /api/academic/grados/
    CRUD de grados
    """
    queryset = Grado.objects.all().order_by('numero')
    serializer_class = GradoSerializer
    permission_classes = [IsAuthenticated]


class CourseViewSet(viewsets.ModelViewSet):
    """
    /api/academic/courses/
    CRUD de cursos + acciones extra:
    - GET /api/academic/courses/{pk}/students/
    - GET /api/academic/courses/{pk}/attendance_summary/
    """
    queryset = Course.objects.prefetch_related('students', 'teachers', 'course_subjects__subject').all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        curso = self.get_object()
        estudiantes = curso.students.all()
        return Response(StudentSerializer(estudiantes, many=True).data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def attendance_summary(self, request, pk=None):
        """
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
        """
        Al crear un curso, se asignan materias automáticamente según el grado
        y se vincula a docentes si vienen en teachers_ids.
        """
        with transaction.atomic():
            docentes_ids = request.data.get("teachers_ids", []) or []
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                curso = serializer.save()

                if curso.grado:
                    materias_asignadas = Subject.objects.filter(grado=curso.grado)
                    for materia in materias_asignadas:
                        CourseSubject.objects.get_or_create(course=curso, subject=materia)

                if docentes_ids:
                    curso.teachers.set(docentes_ids)
                    curso.save()

                return Response(CourseSerializer(curso).data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GradeViewSet(viewsets.ModelViewSet):
    """
    /api/academic/grades/
    CRUD de calificaciones
    """
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]


class GradeEntryViewSet(viewsets.ModelViewSet):
    """
    /api/academic/grade-entries/
    CRUD de entradas de calificaciones
    """
    queryset = GradeEntry.objects.all()
    serializer_class = GradeEntrySerializer
    permission_classes = [IsAuthenticated, IsTeacher, IsWithinPeriod]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Obtener el periodo académico de la asignación
        assignment = instance.assignment
        period_number = assignment.period
        year = assignment.year

        try:
            periodo = AcademicPeriod.objects.get(
                number=period_number,
                academic_year=year
            )
        except AcademicPeriod.DoesNotExist:
            return Response(
                {"error": "Periodo académico no encontrado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if timezone.now().date() > periodo.edit_deadline:
            return Response(
                {"error": "No se pueden editar calificaciones fuera del plazo del periodo."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)
    
class AttendanceViewSet(viewsets.ModelViewSet):
    """
    /api/academic/attendances/
    CRUD de asistencias + GET /?student_id= y /?start_date=&end_date=
    """
    queryset = Attendance.objects.all().select_related('student', 'subject').order_by('-date')
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="by_course_subject_date")
    def attendance_by_date(self, request):
        course_id = request.query_params.get("course_id")
        subject_id = request.query_params.get("subject_id")
        date_str = request.query_params.get("date")
        
        if not course_id or not subject_id or not date_str:
            return Response({"error": "Faltan parámetros requeridos"}, status=status.HTTP_400_BAD_REQUEST)

        date = parse_date(date_str)
        if not date:
            return Response({"error": "Fecha inválida"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            course_subject = CourseSubject.objects.get(course_id=course_id, subject_id=subject_id)
        except CourseSubject.DoesNotExist:
            return Response({"error": "No se encontró la relación curso-materia"}, status=status.HTTP_404_NOT_FOUND)

        students = Student.objects.filter(course=course_subject.course).order_by("last_name")

        response = []
        for student in students:
            att = Attendance.objects.filter(student=student, subject_id=subject_id, date=date).first()
            response.append({
                "id": att.id if att else None,
                "studentId": student.id,
                "studentName": f"{student.first_name} {student.last_name}",
                "present": att.present if att else False,
                "subjectId": subject_id,  # útil para el POST de vuelta
                "date": date_str          # útil para el POST de vuelta
            })

        return Response(response)

    @action(detail=False, methods=["post"], url_path="bulk_save")
    def bulk_save_attendance(self, request):
        data = request.data
        if not isinstance(data, list):
            return Response({"error": "Se esperaba una lista de asistencias"}, status=status.HTTP_400_BAD_REQUEST)

        result = []
        today = timezone.now().date()
        rejected_count = 0
        
        for item in data:
            student_id = item.get("studentId")
            subject_id = item.get("subjectId")
            date_str = item.get("date")
            present = item.get("present")
            att_id = item.get("id")

            if not student_id or not subject_id or not date_str:
                continue

            att_date = parse_date(date_str)
            if not att_date:
                continue

            # ⛔️ Verifica si la fecha es del mes actual
            if att_date.year != today.year or att_date.month != today.month:
                rejected_count += 1
                continue  # Ignora si no es del mes actual

            if att_id:
                att = Attendance.objects.filter(id=att_id).first()
                if att:
                    att.present = present
                    att.save()
            else:
                att = Attendance.objects.create(
                    student_id=student_id,
                    subject_id=subject_id,
                    date=att_date,
                    present=present
                )
            result.append({"id": att.id})

        response_data = {
            "saved": len(result), 
            "records": result
        }
        
        # Agregar información sobre registros rechazados si los hay
        if rejected_count > 0:
            response_data["rejected"] = rejected_count
            response_data["message"] = f"Se guardaron {len(result)} registros. {rejected_count} registros fueron rechazados por no ser del mes actual."

        return Response(response_data, status=status.HTTP_200_OK)
    
class AssignmentViewSet(viewsets.ModelViewSet):
    """
    /api/academic/assignments/
    CRUD de actividades + GET /{pk}/grade_entries/ + /by_subject/ + /by_type/
    """
    queryset = Assignment.objects.select_related('course_subject__subject', 'course_subject__course').order_by('-date_assigned')
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def grade_entries(self, request, pk=None):
        assignment = self.get_object()
        grade_entries = GradeEntry.objects.filter(assignment=assignment)
        return Response(GradeEntrySerializer(grade_entries, many=True).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_subject(self, request):
        subject_id = request.query_params.get('subject_id')
        if not subject_id:
            return Response({"error": "Se requiere subject_id"}, status=status.HTTP_400_BAD_REQUEST)

        assignments = Assignment.objects.filter(course_subject__subject_id=subject_id).order_by('-date_assigned')
        return Response(AssignmentSerializer(assignments, many=True).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_type(self, request):
        assignment_type = request.query_params.get('assignment_type')
        if not assignment_type:
            return Response({"error": "Se requiere assignment_type"}, status=status.HTTP_400_BAD_REQUEST)

        assignments = Assignment.objects.filter(assignment_type=assignment_type).order_by('-date_assigned')
        return Response(AssignmentSerializer(assignments, many=True).data)


class GradoMateriaViewSet(viewsets.ViewSet):
    """
    /api/academic/grados/{grado_id}/materias/
    Listar, agregar y eliminar materias de un grado
    """
    permission_classes = [IsAuthenticated]

    def list(self, request, grado_id=None):
        grado = get_object_or_404(Grado, id=grado_id)
        materias = Subject.objects.filter(grado=grado)
        return Response(SubjectSerializer(materias, many=True).data)

    def create(self, request, grado_id=None):
        grado = get_object_or_404(Grado, id=grado_id)
        materia_data = request.data
        materia_data['grado'] = grado.id
        materia_serializer = SubjectSerializer(data=materia_data)

        if materia_serializer.is_valid():
            materia = materia_serializer.save(grado=grado)
            cursos = Course.objects.filter(grado=grado)
            for curso in cursos:
                CourseSubject.objects.get_or_create(course=curso, subject=materia)
            return Response(SubjectSerializer(materia).data, status=status.HTTP_201_CREATED)

        return Response(materia_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, grado_id=None, materia_id=None):
        try:
            materia = Subject.objects.get(id=materia_id, grado__id=grado_id)
            CourseSubject.objects.filter(subject=materia).delete()
            materia.delete()
            return Response({"message": "Materia eliminada correctamente"}, status=status.HTTP_204_NO_CONTENT)
        except Subject.DoesNotExist:
            return Response({"error": "Materia no encontrada en este grado"}, status=status.HTTP_404_NOT_FOUND)


class CourseSubjectViewSet(viewsets.ModelViewSet):
    """
    /api/academic/course-subjects/
    CRUD de asignaciones curso↔materia↔docente
    """
    queryset = CourseSubject.objects.all()
    serializer_class = CourseSubjectSerializer
    permission_classes = [IsAuthenticated]


class AdministratorViewSet(viewsets.ModelViewSet):
    """
    /api/academic/administrators/
    CRUD de administradores (solo superusuarios pueden listar todos)
    """
    queryset = Administrator.objects.all()
    serializer_class = AdministratorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == "director":
            return Administrator.objects.all()
        elif user.user_type == "teacher":
            return Administrator.objects.filter(user=user)
        elif user.user_type == "student":
            return Administrator.objects.none()
        return Administrator.objects.none()