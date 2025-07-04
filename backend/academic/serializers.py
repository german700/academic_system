#C:\Users\germa\Desktop\academic_system\backend\academic\serializers.py
from rest_framework import serializers
from .models import Student, Teacher, Course, Grade, Administrator, Subject, CourseSubject, Grado, GradeEntry, Attendance, Assignment, AcademicPeriod
from django.db.models import Count, Avg, Case, When, Value, CharField

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
    assignment_name = serializers.CharField(source='assignment.name', read_only=True)

    class Meta:
        model = GradeEntry
        fields = ['id', 'assignment', 'assignment_name', 'score', 'submitted_date', 'late_submission', 'comments']

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
        # Corregido: Buscar el teacher a través de CourseSubject
        # Asumiendo que Grade tiene una relación con CourseSubject
        if hasattr(obj, 'course_subject') and obj.course_subject:
            teacher = obj.course_subject.teacher
            return TeacherBriefSerializer(teacher).data if teacher else None
        
        # Si Grade solo tiene course, buscar en course_subjects
        course_subjects = obj.course.course_subjects.all()
        if course_subjects.exists():
            teacher = course_subjects.first().teacher
            return TeacherBriefSerializer(teacher).data if teacher else None
        
        return None

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
            'date_of_birth', 'email', 'student_id', 'photo',
            'gender', 'neighborhood', 'socioeconomic_status',
            'grado', 'grado_id', 'course', 'course_id'
        ]


# Serializador para el perfil de estudiante (completo con información personal)
class StudentProfileSerializer(serializers.ModelSerializer):
    curso = serializers.SerializerMethodField()
    materias = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id",
            "first_name",
            "middle_name",
            "last_name",
            "second_last_name",
            "student_id",
            "email",
            "date_of_birth",
            "photo",
            "curso",
            "materias",
            "gender",                
            "neighborhood",          
            "socioeconomic_status",
        ]

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
            asignaciones = obj.course.course_subjects.select_related("subject", "teacher")
            materias = [
                {
                    "id": asig.subject.id,
                    "nombre": asig.subject.name,
                    "codigo": asig.subject.code,
                    "docente": f"{asig.teacher.first_name} {asig.teacher.last_name}" if asig.teacher else "Desconocido"
                }
                for asig in asignaciones
            ]
            print("Materias serializadas:", materias)  # Agregado para depuración
            return materias
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

class TeacherDashboardSerializer(serializers.ModelSerializer):
    subjects = serializers.SerializerMethodField()

    assignments_stats = serializers.SerializerMethodField()
    performance_summary = serializers.SerializerMethodField()
    attendance_overview = serializers.SerializerMethodField()
    risk_analysis = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()  
    class Meta:
        model = Teacher
        fields = (
            # info personal
            "id", "teacher_id", "first_name", "middle_name", "last_name",
            "second_last_name", "title", "date_of_birth", "email",
            "specialization", "profile_picture",
            # relaciones
            "subjects",
            # métricas
            "assignments_stats", "performance_summary",
            "attendance_overview", "risk_analysis",
        )

    # ---------- MÉTRICAS ----------
    def get_assignments_stats(self, obj):
        qs = Assignment.objects.filter(course_subject__teacher=obj)
        total = qs.count()
        by_type = (
            qs.values("assignment_type")
              .annotate(count=Count("id"))
              .order_by()
        )
        on_time = GradeEntry.objects.filter(
            assignment__course_subject__teacher=obj,
            late_submission=False
        ).count()
        late = GradeEntry.objects.filter(
            assignment__course_subject__teacher=obj,
            late_submission=True
        ).count()
        return {
            "total": total,
            "by_type": by_type,
            "on_time": on_time,
            "late": late,
        }

    def get_performance_summary(self, obj):
        # promedio de las notas que obtienen los estudiantes
        qs = GradeEntry.objects.filter(assignment__course_subject__teacher=obj)
        avg = qs.aggregate(avg=Avg("score"))["avg"] or 0
        dist = (
            qs.annotate(rango=Case(
                    When(score__gte=4, then=Value(">=4")),
                    When(score__gte=3, then=Value("3‑3.9")),
                    default=Value("<3"),
                    output_field=CharField()))
              .values("rango")
              .annotate(count=Count("id"))
        )
        return {"average": round(avg, 2), "distribution": dist}

    def get_attendance_overview(self, obj):
        # % promedio asistencia de sus clases
        # Usar la relación inversa correcta: coursesubject en lugar de coursesubject_set
        subjects = Subject.objects.filter(coursesubject__teacher=obj).distinct()
        att = Attendance.objects.filter(subject__in=subjects)

        if not att.exists():
            return {"avg_attendance": 0}
        total = att.count()
        present = att.filter(present=True).count()
        return {"avg_attendance": round(present / total * 100, 2)}

    def get_risk_analysis(self, obj):
        """
        Ejemplo mínimo: % de estudiantes en ‘riesgo’ (usa tu propia lógica).
        Supongamos que ya tienes StudentIAAnalysisView => risk_index por estudiante.
        """
        from analytics.services import predecir_riesgo_estudiante
        students = Student.objects.filter(course__teachers=obj)
        riesgos = [predecir_riesgo_estudiante(s)["risk_index"] for s in students]
        if not riesgos:
            return {"avg_risk": 0, "high_risk_pct": 0}
        high = sum(1 for r in riesgos if r >= 0.7)
        return {
            "avg_risk": round(sum(riesgos) / len(riesgos), 2),
            "high_risk_pct": round(high / len(riesgos) * 100, 1),
        }
    
    def get_subjects(self, obj):
        from .models import CourseSubject
        course_subjects = CourseSubject.objects.filter(teacher=obj).select_related('subject', 'course').order_by('subject__name', 'course__name')
        return [
            {
                "id": cs.subject.id,
                "name": cs.subject.name,
                "code": cs.subject.code,
                "course": cs.course.name,
                "course_id": cs.course.id,
                "grado": cs.course.grado.numero if cs.course.grado else None,
            }
            for cs in course_subjects
        ]
    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None


class SimpleStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name"]