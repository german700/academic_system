from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db import transaction
from .models import Student, Teacher, Course, Grade, Administrator, Subject, Grado, CourseSubject
from .serializers import (
    StudentSerializer, TeacherSerializer, CourseSerializer, 
    GradoSerializer, GradeSerializer, AdministratorSerializer, SubjectSerializer, CourseSubjectSerializer
)
from rest_framework.permissions import BasePermission
from rest_framework.decorators import action


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().select_related('grado', 'course')
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        student = self.get_object()
        from .serializers import StudentProfileSerializer  # Importación diferida para evitar circularidad
        serializer = StudentProfileSerializer(student)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                student = serializer.save()

                # Si el estudiante tiene un curso asignado, añadirlo manualmente a la relación ManyToMany
                if student.course:
                    student.course.students.add(student)
                    student.course.save()

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
    def profile(self, request, pk=None):
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

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated]

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]

class GradoViewSet(viewsets.ModelViewSet):
    queryset = Grado.objects.all().order_by('numero')
    serializer_class = GradoSerializer
    permission_classes = [permissions.IsAuthenticated]

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.prefetch_related('students', 'teachers', 'course_subjects__subject').all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        # Obtener el curso actual
        curso = self.get_object()
        # Recuperar los estudiantes asociados usando el related name definido
        estudiantes = curso.students.all()
        # Retornar los datos usando el serializador de estudiantes
        from .serializers import StudentSerializer  # Si no está importado aún
        return Response(StudentSerializer(estudiantes, many=True).data)

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
    permission_classes = [permissions.IsAuthenticated]

class IsSuperUser(BasePermission):
    """Permiso personalizado para permitir acceso solo a superusuarios."""
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser

class GradoMateriaViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticated]

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