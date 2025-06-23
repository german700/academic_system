#C:\Users\germa\Desktop\academic_system\backend\academic\views\teacher_views.py
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from academic.models import (
    Teacher, Course, Student, CourseSubject, Assignment,
    GradeEntry, Subject, AcademicPeriod
)
from academic.serializers import (
    TeacherSerializer, CourseSerializer, StudentSerializer,
    AssignmentSerializer, GradeEntrySerializer, AcademicPeriodSerializer,
    CourseSerializerMinimal
)
from academic.permissions import IsTeacher, IsTeacherOrAdmin
from analytics.services import predecir_riesgo_estudiante

from django.utils.dateparse import parse_date

# Helpers para verificar acceso docente

def get_course_if_teacher(request, course_id):
    teacher = request.user.teacher_profile
    try:
        return Course.objects.get(id=course_id, course_subjects__teacher=teacher)
    except Course.DoesNotExist:
        return Response({"error": "No tiene permiso para este curso"}, status=status.HTTP_403_FORBIDDEN)

def is_teacher_assigned_to_subject(course_id, subject_id, teacher):
    return CourseSubject.objects.filter(course_id=course_id, subject_id=subject_id, teacher=teacher).exists()

def get_course_subject_if_teacher(request, course_id, subject_id):
    teacher = request.user.teacher_profile
    if not is_teacher_assigned_to_subject(course_id, subject_id, teacher):
        return Response({"error": "No autorizado para esta materia en este curso."}, status=status.HTTP_403_FORBIDDEN)
    return get_object_or_404(CourseSubject, course_id=course_id, subject_id=subject_id)

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrAdmin]
    
    @action(detail=False, url_path='me/courses', methods=['get'])
    def me_courses(self, request):
        teacher = getattr(request.user, 'teacher_profile', None)
        if not teacher:
            return Response({"error": "No eres un docente"}, status=404)

        # Solo cursos únicos donde enseña al menos una materia
        course_ids = CourseSubject.objects.filter(teacher=teacher).values_list('course_id', flat=True).distinct()
        courses = Course.objects.filter(id__in=course_ids).select_related('grado')

        data = [{
            "id": course.id,
            "name": course.name,
            "student_count": course.students.count(),
            "grado": course.grado.numero if course.grado else None
        } for course in courses]

        return Response(data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def assignments(self, request, pk=None):
        teacher = self.get_object()
        course_subjects = CourseSubject.objects.filter(teacher=teacher)
        assignments = Assignment.objects.filter(course_subject__in=course_subjects)
        return Response(AssignmentSerializer(assignments, many=True).data)

    def create(self, request, *args, **kwargs):
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
                    "Este enlace expira en 24 horas."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[teacher.email],
                fail_silently=False,
            )

            return Response(self.get_serializer(teacher).data, status=status.HTTP_201_CREATED)

    @action(detail=False, url_path='me/dashboard', methods=['get'])
    def me_dashboard(self, request):
        teacher = getattr(request.user, 'teacher_profile', None)
        if not teacher:
            return Response({"error": "No eres un docente"}, status=404)

        today = timezone.now().date()
        period = AcademicPeriod.objects.filter(start_date__lte=today, end_date__gte=today).first()
        current_period = {"name": period.name, "number": period.number} if period else None

        from collections import defaultdict
        course_subjects = CourseSubject.objects.filter(teacher=teacher).select_related('course', 'subject')
        courses_map = defaultdict(lambda: {"subjects": [], "student_count": 0, "grado": None})

        for cs in course_subjects:
            c = cs.course
            entry = courses_map[c.id]
            entry.update({
                "id": c.id,
                "name": c.name,
                "grado": c.grado.numero if c.grado else None,
                "student_count": c.students.count()
            })
            entry["subjects"].append({
                "id": cs.subject.id,
                "name": cs.subject.name,
                "course_subject_id": cs.id
            })

        courses = list(courses_map.values())
        return Response({
            "current_period": current_period,
            "total_courses": len(courses),
            "total_students": sum(c["student_count"] for c in courses),
            "total_grades": len({c['grado'] for c in courses if c['grado'] is not None}),
            "courses": courses
        })

    @action(detail=False, url_path='me/course/(?P<course_id>[^/.]+)/students', methods=['get'])
    def me_course_students(self, request, course_id=None):
        teacher = request.user.teacher_profile

        # Verifica que el docente esté asignado al curso
        if not CourseSubject.objects.filter(course__id=course_id, teacher=teacher).exists():
            return Response({"error": "No estás asignado a ese curso."}, status=status.HTTP_403_FORBIDDEN)

        # Obtiene estudiantes y materias asignadas
        course = get_object_or_404(Course, id=course_id)
        students = Student.objects.filter(course=course).order_by('last_name', 'first_name')
        course_subjects = CourseSubject.objects.filter(course=course, teacher=teacher).select_related('subject')

        subjects = [{
            "id": cs.subject.id,
            "name": cs.subject.name,
            "course_subject_id": cs.id,
            "subject_code": cs.subject.code if hasattr(cs.subject, 'code') else None
        } for cs in course_subjects]

        return Response({
            "course_id": course.id,
            "course_name": course.name,  # ✅ añadido
            "students": StudentSerializer(students, many=True).data,
            "subjects": subjects,
            "total_students": students.count(),
            "total_subjects": len(subjects)
        })

    @action(
    detail=False,
    url_path=r'me/course/(?P<course_id>\d+)/subject/(?P<subject_id>\d+)/grades',
    methods=['get', 'patch']  # 👈 añade PATCH aquí
    )
    def me_course_subject_grades(self, request, course_id=None, subject_id=None):
        teacher = request.user.teacher_profile

        if request.method == 'GET':
            period_number = request.query_params.get('period')
            if not period_number:
                return Response(
                    {"error": "Debe proporcionar el número del periodo (?period=)."},
                    status=400
                )

            if not is_teacher_assigned_to_subject(course_id, subject_id, teacher):
                return Response({"error": "No autorizado para esta materia en este curso."}, status=403)

            cs = get_object_or_404(
                CourseSubject,
                course_id=course_id,
                subject_id=subject_id,
                teacher=teacher
            )

            grade_entries = GradeEntry.objects.filter(
                assignment__course_subject=cs,
                assignment__period=period_number
            ).select_related('student', 'assignment')

            from collections import defaultdict
            data = defaultdict(lambda: {
                "student_id": None,
                "student_name": "",
                "grades": []
            })

            for entry in grade_entries:
                sid = entry.student.id
                data[sid]["student_id"] = sid
                data[sid]["student_name"] = f"{entry.student.first_name} {entry.student.last_name}"
                data[sid]["grades"].append({
                    "entry_id": entry.id,
                    "assignment_id": entry.assignment.id,
                    "assignment_name": entry.assignment.name,
                    "score": float(entry.score),
                    "late_submission": entry.late_submission 
                })

            return Response({
                "course_id": int(course_id),
                "subject_id": int(subject_id),
                "period": int(period_number),
                "students": list(data.values())
            })

        elif request.method == 'PATCH':
            grades = request.data if isinstance(request.data, list) else request.data.get("grades")
            period_number = request.query_params.get("period")

            if not isinstance(grades, list) or not period_number:
                return Response({"error": "Faltan datos requeridos"}, status=400)

            if not is_teacher_assigned_to_subject(course_id, subject_id, teacher):
                return Response({"error": "No autorizado para esta materia en este curso."}, status=403)

            cs = get_object_or_404(
                CourseSubject,
                course_id=course_id,
                subject_id=subject_id,
                teacher=teacher
            )

            created, updated = 0, 0

            for entry_data in grades:
                student_id = entry_data.get("student_id")
                assignment_id = entry_data.get("assignment_id")
                score = entry_data.get("score")

                if not all([student_id, assignment_id, score is not None]):
                    continue

                try:
                    entry = GradeEntry.objects.get(
                        student_id=student_id,
                        assignment_id=assignment_id
                    )
                    entry.score = score
                    entry.late_submission = entry_data.get("late_submission", False)
                    entry.save()
                    updated += 1
                except GradeEntry.DoesNotExist:
                    GradeEntry.objects.create(
                        student_id=student_id,
                        assignment_id=assignment_id,
                        score=score,
                        late_submission=entry_data.get("late_submission", False)
                    )
                    created += 1

            # ✅ Reconstruir data como en GET para devolver lista actualizada de estudiantes
            grade_entries = GradeEntry.objects.filter(
                assignment__course_subject=cs,
                assignment__period=period_number
            ).select_related('student', 'assignment')

            from collections import defaultdict
            data = defaultdict(lambda: {
                "student_id": None,
                "student_name": "",
                "grades": []
            })

            for entry in grade_entries:
                sid = entry.student.id
                data[sid]["student_id"] = sid
                data[sid]["student_name"] = f"{entry.student.first_name} {entry.student.last_name}"
                data[sid]["grades"].append({
                    "entry_id": entry.id,
                    "assignment_id": entry.assignment.id,
                    "assignment_name": entry.assignment.name,
                    "score": float(entry.score),
                    "late_submission": entry.late_submission 
                })

            return Response({
                "message": f"{updated} notas actualizadas, {created} creadas.",
                "course_id": cs.course.id,
                "subject_id": cs.subject.id,
                "period": int(period_number),
                "students": list(data.values()),
                "course_name": cs.course.name,
                "subject_name": cs.subject.name,
                "teacher_name": f"{teacher.first_name} {teacher.last_name}"
            })

    @action(
    detail=False,
    methods=['get', 'post', 'patch'],   # Ahora GET, POST y PATCH
    url_path=r'me/course/(?P<course_id>\d+)/subject/(?P<subject_id>\d+)/assignments'
    )
    def me_course_subject_assignments(self, request, course_id=None, subject_id=None):
        """
        GET /api/academic/teachers/me/course/{course_id}/subject/{subject_id}/assignments/?period=X
        Devuelve TODAS las actividades (Assignment) para ese curso+materia en un periodo dado.
        
        POST /api/academic/teachers/me/course/{course_id}/subject/{subject_id}/assignments/?period=X
        Crea una nueva actividad (Assignment) para ese curso+materia en un periodo dado.
        
        PATCH /api/academic/teachers/me/course/{course_id}/subject/{subject_id}/assignments/?period=X
        Actualiza los pesos de múltiples actividades en lote.
        """
        teacher = request.user.teacher_profile
        
        # 1) Verificar permiso
        if not is_teacher_assigned_to_subject(course_id, subject_id, teacher):
            return Response({"error": "No autorizado para esta materia en este curso."}, status=403)
        
        # 2) Obtener el CourseSubject
        cs = get_object_or_404(
            CourseSubject,
            course_id=course_id,
            subject_id=subject_id,
            teacher=teacher
        )
        
        # 3) Obtener período de los query params
        period_number = request.query_params.get('period')
        
        # ————————————————————————
        # POST → creación
        # ————————————————————————
        if request.method == 'POST':
            data = request.data.copy()
            data['course_subject_id'] = cs.id  # clave que espera el serializer

            serializer = AssignmentSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            assignment = serializer.save()

            return Response(serializer.data, status=201)
        
        # ————————————————————————
        # PATCH → actualizar pesos
        # ————————————————————————
        elif request.method == 'PATCH':
            weights = request.data.get('weights')
            period = request.data.get('period')
            
            if not isinstance(weights, list) or period is None:
                return Response({"error": "weights y period son requeridos"}, status=400)
            
            # Actualizar cada peso
            for w in weights:
                assignment_id = w.get('assignment_id')
                weight = w.get('weight')
                
                if assignment_id and weight is not None:
                    Assignment.objects.filter(
                        id=assignment_id,
                        course_subject=cs,
                        period=period
                    ).update(weight=weight)
            
            # Devolver la lista actualizada
            qs = Assignment.objects.filter(course_subject=cs, period=period)
            serializer = AssignmentSerializer(qs.order_by('date_assigned'), many=True)
            return Response({
                'assignments': serializer.data,
                'message': 'Pesos actualizados correctamente'
            })
        
        # ————————————————————————
        # GET → listar actividades
        # ————————————————————————
        assignments_qs = Assignment.objects.filter(course_subject=cs)
        
        if period_number:
            assignments_qs = assignments_qs.filter(period=period_number)
        
        # 6) Serializar y devolver
        serializer = AssignmentSerializer(assignments_qs.order_by('date_assigned'), many=True)
        return Response({
            "assignments": serializer.data
        })
    
    @action(detail=False, methods=['post'], url_path='me/assignments/create')
    def create_assignment(self, request):
        teacher = request.user.teacher_profile
        data = request.data
        course_id = data.get("course_id")
        subject_id = data.get("subject_id")
        period = data.get("period")
        name = data.get("name")
        weight = data.get("weight", 1.0)

        if not all([course_id, subject_id, period, name]):
            return Response({"error": "Faltan campos requeridos"}, status=400)

        if not is_teacher_assigned_to_subject(course_id, subject_id, teacher):
            return Response({"error": "No autorizado"}, status=403)

        course_subject = get_object_or_404(
            CourseSubject, course_id=course_id, subject_id=subject_id, teacher=teacher
        )

        assignment = Assignment.objects.create(
            course_subject=course_subject,
            name=name,
            assignment_type="TAREA",  # Podrías hacerlo dinámico si quieres
            period=period,
            year=timezone.now().year,
            weight=weight,
            max_score=5.0,
            date_assigned=timezone.now().date(),
            due_date=timezone.now().date()
        )

        return Response({
            "id": assignment.id,
            "name": assignment.name
        }, status=201)

    @action(detail=False, methods=['delete'], url_path='me/assignments/(?P<assignment_id>\d+)')
    def delete_assignment(self, request, assignment_id=None):
        teacher = request.user.teacher_profile

        assignment = get_object_or_404(Assignment, id=assignment_id)

        if assignment.course_subject.teacher != teacher:
            return Response({"error": "No autorizado para esta tarea."}, status=403)

        assignment.delete()
        return Response(status=204)
    
   
    @action(
    detail=False,
    methods=['get'],
    url_path=r'me/course/(?P<course_id>\d+)/subject/(?P<subject_id>\d+)/basic-info'
    )
    def course_subject_basic_info(self, request, course_id=None, subject_id=None):
        teacher = request.user.teacher_profile

        if not is_teacher_assigned_to_subject(course_id, subject_id, teacher):
            return Response({"error": "No autorizado"}, status=403)

        cs = get_object_or_404(
            CourseSubject,
            course_id=course_id,
            subject_id=subject_id,
            teacher=teacher
        )

        return Response({
            "course_id": cs.course.id,
            "subject_id": cs.subject.id,
            "course_name": cs.course.name,
            "subject_name": cs.subject.name,
            "teacher_name": f"{cs.teacher.first_name} {cs.teacher.last_name}"
        })