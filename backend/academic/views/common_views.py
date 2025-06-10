# C:\Users\germa\Desktop\academic_system\backend\academic\views\common_views.py

from django.db.models import Q
from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
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

# ————————————————
# TeacherSearchStudentsView
# ————————————————

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


# ————————————————
# SubjectViewSet
# ————————————————

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


# ————————————————
# GradoViewSet
# ————————————————

class GradoViewSet(viewsets.ModelViewSet):
    """
    /api/academic/grados/
    CRUD de grados
    """
    queryset = Grado.objects.all().order_by('numero')
    serializer_class = GradoSerializer
    permission_classes = [IsAuthenticated]


# ————————————————
# CourseViewSet
# ————————————————

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


# ————————————————
# GradeViewSet
# ————————————————

class GradeViewSet(viewsets.ModelViewSet):
    """
    /api/academic/grades/
    CRUD de calificaciones
    """
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]


# ————————————————
# GradeEntryViewSet
# ————————————————

class GradeEntryViewSet(viewsets.ModelViewSet):
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


# ————————————————
# GradoMateriaViewSet
# ————————————————

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


# ————————————————
# CourseSubjectViewSet
# ————————————————

class CourseSubjectViewSet(viewsets.ModelViewSet):
    """
    /api/academic/course-subjects/
    CRUD de asignaciones curso↔materia↔docente
    """
    queryset = CourseSubject.objects.all()
    serializer_class = CourseSubjectSerializer
    permission_classes = [IsAuthenticated]


# ————————————————
# AdministratorViewSet
# ————————————————

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
            return Course.objects.all()
        elif user.user_type == "teacher":
            return Course.objects.filter(teachers__user=user)
        elif user.user_type == "student":
            return Course.objects.filter(students__user=user)
        return Course.objects.none()


# ————————————————
# AttendanceViewSet
# ————————————————

class AttendanceViewSet(viewsets.ModelViewSet):
    """
    /api/academic/attendances/
    CRUD de asistencias + GET /?student_id= y /?start_date=&end_date=
    """
    queryset = Attendance.objects.all().select_related('student', 'subject').order_by('-date')
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_student(self, request):
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({"error": "Se requiere el parámetro student_id"}, status=status.HTTP_400_BAD_REQUEST)

        attendances = Attendance.objects.filter(student_id=student_id).order_by('-date')
        return Response(AttendanceSerializer(attendances, many=True).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_date_range(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if not start_date or not end_date:
            return Response({"error": "Se requieren start_date y end_date"}, status=status.HTTP_400_BAD_REQUEST)

        attendances = Attendance.objects.filter(date__range=[start_date, end_date]).order_by('-date')
        return Response(AttendanceSerializer(attendances, many=True).data)


# ————————————————
# AssignmentViewSet
# ————————————————

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
