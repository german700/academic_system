#C:\Users\germa\Desktop\academic_system\backend\academic\serializers.py
from rest_framework import serializers
from .models import Student, Teacher, Course, Grade, Administrator, Subject, CourseSubject, Grado, GradeEntry, Attendance, Assignment, AcademicPeriod

class AcademicPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicPeriod
        fields = ['id', 'number', 'name', 'start_date', 'end_date', 'edit_deadline', 'academic_year']

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

# Serializador para las subnotas (entries)
class GradeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeEntry
        fields = ['id','assignment','score','submitted_date','late_submission','comments']

# Serializador simplificado para Teacher (para uso en GradeSerializer)
class TeacherBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['id', 'first_name', 'last_name', 'email']

# Serializador para Calificaciones con subnotas
class GradeSerializer(serializers.ModelSerializer):
    entries = GradeEntrySerializer(many=True, read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    teacher = serializers.SerializerMethodField()

    class Meta:
        model = Grade
        fields = ['id', 'course_name', 'teacher', 'value', 'period', 'year', 'comments', 'entries']

    def get_teacher(self, obj):
        course = obj.course
        teacher = course.teacher if hasattr(course, 'teacher') else None
        return TeacherBriefSerializer(teacher).data if teacher else None

# Serializador para la relación Curso-Materia-Docente
class CourseSubjectSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(read_only=True)
    teacher = TeacherSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), source='teacher', write_only=True
    )

    class Meta:
        model = CourseSubject
        fields = ['id', 'subject', 'teacher', 'teacher_id']

# Serializador breve para Cursos (usado dentro de StudentSerializer)
class CourseBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'code']

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    course_subject = CourseSubjectSerializer(read_only=True)
    course_subject_id = serializers.PrimaryKeyRelatedField(
        queryset=CourseSubject.objects.all(), 
        source='course_subject', 
        write_only=True
    )

    class Meta:
        model = Assignment
        fields = [
            'id', 'name', 'description', 'due_date', 
            'course_subject', 'course_subject_id', 'weight', 'assignment_type'
        ]

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
        from .serializers import StudentSerializer
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

class StudentProfileSerializer(serializers.ModelSerializer):
    curso = serializers.SerializerMethodField()
    materias = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name", "student_id", "curso", "materias"]

    def get_curso(self, obj):
        if obj.course:                      # aquí ya usa obj.course
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
                {
                    "id": asig.subject.id,
                    "nombre": asig.subject.name,
                    "codigo": asig.subject.code
                }
                for asig in asignaciones
            ]
        return []

class CourseSerializerMinimal(serializers.ModelSerializer):
    grado = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'name', 'grado', 'students_count']

    def get_grado(self, obj):
        return {"numero": obj.grado.numero} if obj.grado else None

    def get_students_count(self, obj):
        return obj.students.count()
