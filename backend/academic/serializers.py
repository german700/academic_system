from rest_framework import serializers
from .models import Student, Teacher, Course, Grade, Administrator, Subject, CourseSubject, Grado

# Serializadores básicos (sin dependencias circulares)
class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'

class AdministratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administrator
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class GradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grado
        fields = '__all__'

# Serializador para la relación Curso-Materia-Docente
class CourseSubjectSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(read_only=True)  # Muestra información completa de la materia
    teacher = TeacherSerializer(read_only=True)  # Muestra información completa del docente
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), source='teacher', write_only=True
    )  # Permite enviar teacher_id en POST/PUT

    class Meta:
        model = CourseSubject
        fields = ['id', 'subject', 'teacher', 'teacher_id']

# Serializador breve para Cursos (usado dentro de StudentSerializer)
class CourseBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'code']

# Serializador para Cursos completos
class CourseSerializer(serializers.ModelSerializer):
    students = serializers.SerializerMethodField()
    course_subjects = CourseSubjectSerializer(many=True, read_only=True)
    teachers = TeacherSerializer(many=True, read_only=True)
    teachers_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    grado = GradoSerializer(read_only=True)
    grado_id = serializers.PrimaryKeyRelatedField(
        queryset=Grado.objects.all(), source='grado', write_only=True, required=True
    )

    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'description', 'academic_year', 'students',
            'course_subjects', 'teachers', 'teachers_ids', 'grado', 'grado_id'
        ]

    def get_students(self, obj):
        from .serializers import StudentSerializer  # Importación diferida para evitar circularidad
        students = obj.students.all()
        return StudentSerializer(students, many=True).data

    def create(self, validated_data):
        teachers_ids = validated_data.pop('teachers_ids', [])
        course = Course.objects.create(**validated_data)
        if teachers_ids:
            teachers = Teacher.objects.filter(id__in=teachers_ids)
            course.teachers.set(teachers)
        return course

    def update(self, instance, validated_data):
        teachers_ids = validated_data.pop('teachers_ids', None)
        instance = super().update(instance, validated_data)
        if teachers_ids is not None:
            teachers = Teacher.objects.filter(id__in=teachers_ids)
            instance.teachers.set(teachers)
        return instance

# Serializador para el perfil de estudiante
class StudentProfileSerializer(serializers.ModelSerializer):
    curso = serializers.SerializerMethodField()
    materias = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name", "student_id", "curso", "materias"]

    def get_curso(self, obj):
        if obj.course:
            return {
                "id": obj.course.id,
                "nombre": obj.course.name,
                "grado": obj.course.grado.numero if obj.course.grado else None,
            }
        return None

    def get_materias(self, obj):
        if obj.course:
            asignaciones = obj.course.course_subjects.select_related("subject")
            return [
                {"id": asig.subject.id, "nombre": asig.subject.name, "codigo": asig.subject.code}
                for asig in asignaciones
            ]
        return []

# Serializador completo para estudiantes (CRUD)
class StudentSerializer(serializers.ModelSerializer):
    grado = GradoSerializer(read_only=True)
    grado_id = serializers.PrimaryKeyRelatedField(
        queryset=Grado.objects.all(), source='grado', write_only=True, required=True
    )
    course = CourseBriefSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source='course', write_only=True, required=True
    )

    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'middle_name', 'last_name', 'second_last_name',
            'date_of_birth', 'email', 'student_id', 'photo', 'grado', 'grado_id', 'course', 'course_id'
        ]

# Serializador para Calificaciones
class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = '__all__'