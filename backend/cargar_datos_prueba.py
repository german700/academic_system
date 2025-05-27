#C:\Users\germa\Desktop\academic_system\backend\cargar_datos_prueba.py
# cargar_datos_prueba.py
import os
import django
from django.conf import settings

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_project.settings')
django.setup()

# Ahora puedes importar tus modelos
from academic.models import Student, CourseSubject, Assignment, Grade, GradeEntry, Attendance
from django.utils import timezone
import random
from datetime import timedelta, date

def cargar_datos_demo():
    print("🚀 Iniciando carga de datos demo con perfiles realistas (sistema colombiano 1-5)...")
    
    estudiantes = list(Student.objects.filter(user__is_active=True))
    anio = timezone.now().year
    periodos = [1, 2, 3, 4]
    tipos = ['TAREA', 'EXAMEN', 'PROYECTO', 'QUIZ', 'PARTICIPACION']
    
    if len(estudiantes) == 0:
        print("❌ No se encontraron estudiantes activos y confirmados.")
        return
    
    print(f"📊 Encontrados {len(estudiantes)} estudiantes para procesar")
    
    # Definir perfiles de estudiantes para hacer los datos más realistas
    perfiles_estudiantes = [
        {
            'tipo': 'Excelente',
            'rango_notas': (4.2, 5.0),    # Notas entre 4.2 y 5.0
            'prob_tarde': 0.05,           # 5% probabilidad entrega tardía
            'prob_asistencia': 0.96,      # 96% asistencia
            'variabilidad': 0.3,          # Poca variación en notas
            'prob_bajo_rendimiento': 0.02 # 2% probabilidad nota baja ocasional
        },
        {
            'tipo': 'Bueno',
            'rango_notas': (3.5, 4.5),    # Notas entre 3.5 y 4.5
            'prob_tarde': 0.10,
            'prob_asistencia': 0.92,
            'variabilidad': 0.4,
            'prob_bajo_rendimiento': 0.08
        },
        {
            'tipo': 'Promedio',
            'rango_notas': (3.0, 4.0),    # Notas entre 3.0 y 4.0
            'prob_tarde': 0.18,
            'prob_asistencia': 0.85,
            'variabilidad': 0.5,
            'prob_bajo_rendimiento': 0.15
        },
        {
            'tipo': 'Irregular',
            'rango_notas': (2.5, 3.8),    # Notas entre 2.5 y 3.8
            'prob_tarde': 0.25,
            'prob_asistencia': 0.78,
            'variabilidad': 0.8,          # Alta variación
            'prob_bajo_rendimiento': 0.25
        },
        {
            'tipo': 'Con Dificultades',
            'rango_notas': (1.8, 3.2),    # Notas entre 1.8 y 3.2
            'prob_tarde': 0.35,
            'prob_asistencia': 0.70,
            'variabilidad': 0.6,
            'prob_bajo_rendimiento': 0.35
        }
    ]
    
    # Nombres de actividades más realistas por tipo
    nombres_actividades = {
        'TAREA': [
            'Ejercicios del Capítulo', 'Investigación Bibliográfica', 'Resolución de Problemas',
            'Taller de Comprensión', 'Consulta Temática', 'Trabajo en Casa'
        ],
        'EXAMEN': [
            'Examen Parcial', 'Evaluación Escrita', 'Prueba de Período',
            'Examen Oral', 'Test de Conocimientos', 'Evaluación Integral'
        ],
        'PROYECTO': [
            'Proyecto de Aula', 'Investigación Grupal', 'Presentación Oral',
            'Trabajo de Campo', 'Propuesta de Solución', 'Proyecto Final'
        ],
        'QUIZ': [
            'Quiz Rápido', 'Evaluación Sorpresa', 'Repaso de Conceptos',
            'Pregunta del Día', 'Mini Evaluación', 'Control de Lectura'
        ],
        'PARTICIPACION': [
            'Participación en Clase', 'Intervenciones Orales', 'Debates',
            'Exposiciones', 'Discusiones Grupales', 'Aportes Significativos'
        ]
    }
    
    def obtener_nota_realista(perfil, tipo_actividad, periodo):
        """Genera una nota realista basada en el perfil del estudiante"""
        base_min, base_max = perfil['rango_notas']
        
        # Ajustar según el tipo de actividad
        if tipo_actividad == 'EXAMEN':
            # Los exámenes tienden a ser más difíciles
            base_min -= 0.3
            base_max -= 0.2
        elif tipo_actividad == 'PARTICIPACION':
            # La participación suele tener notas más altas
            base_min += 0.2
            base_max = min(5.0, base_max + 0.1)
        elif tipo_actividad == 'PROYECTO':
            # Los proyectos pueden tener más variación
            base_min -= 0.1
            base_max += 0.1
        
        # Simular progreso/declive durante el año
        if periodo == 1:
            factor = 1.0  # Primer período normal
        elif periodo == 2:
            factor = 1.05  # Segundo período ligeramente mejor
        elif periodo == 3:
            factor = 0.98  # Tercer período puede bajar un poco
        else:  # periodo == 4
            factor = 0.95  # Cuarto período más difícil
        
        base_min *= factor
        base_max *= factor
        
        # Asegurar límites del sistema colombiano
        base_min = max(1.0, base_min)
        base_max = min(5.0, base_max)
        
        # Generar nota con variabilidad
        nota_base = random.uniform(base_min, base_max)
        variacion = random.uniform(-perfil['variabilidad'], perfil['variabilidad'])
        nota_final = nota_base + variacion
        
        # Posibilidad de nota muy baja ocasional
        if random.random() < perfil['prob_bajo_rendimiento']:
            nota_final = random.uniform(1.0, 2.5)
        
        # Redondear y asegurar límites
        nota_final = round(max(1.0, min(5.0, nota_final)), 1)
        return nota_final
    
    # Asignar perfiles a estudiantes
    for idx, estudiante in enumerate(estudiantes):
        perfil = perfiles_estudiantes[idx % len(perfiles_estudiantes)]
        course = estudiante.course
        
        if not course:
            print(f"⚠️  {estudiante.first_name} {estudiante.last_name} no tiene curso asignado. Saltando...")
            continue
        
        print(f"📝 Procesando: {estudiante.first_name} {estudiante.last_name} (Perfil: {perfil['tipo']})")
        
        # Procesar cada materia del curso
        for cs in course.course_subjects.all():
            print(f"   📚 Materia: {cs.subject.name}")
            
            for periodo in periodos:
                # Crear actividades por período (3-5 actividades por período)
                num_actividades = random.randint(3, 5)
                
                for i in range(num_actividades):
                    tipo_actividad = random.choice(tipos)
                    nombre_base = random.choice(nombres_actividades[tipo_actividad])
                    
                    # Crear la actividad/assignment
                    assignment = Assignment.objects.create(
                        course_subject=cs,
                        name=f"{nombre_base} - P{periodo}",
                        assignment_type=tipo_actividad,
                        weight=1.0 if tipo_actividad != 'EXAMEN' else 2.0,  # Exámenes pesan más
                        period=periodo,
                        year=str(anio),
                        max_score=5.0,  # Sistema colombiano
                        date_assigned=timezone.now().date() - timedelta(days=random.randint(5, 45)),
                        due_date=timezone.now().date() - timedelta(days=random.randint(1, 30))
                    )
                    
                    # Generar nota realista
                    nota = obtener_nota_realista(perfil, tipo_actividad, periodo)
                    
                    # Determinar si fue entrega tardía
                    late = random.random() < perfil['prob_tarde']
                    if late:
                        nota = max(1.0, nota - 0.5)  # Penalizar entregas tardías
                    
                    # Crear la entrada de calificación
                    grade_entry = GradeEntry.objects.create(
                        assignment=assignment,
                        student=estudiante,
                        score=nota,
                        submitted_date=timezone.now() - timedelta(days=random.randint(1, 30)),
                        late_submission=late,
                        comments="Entrega tardía" if late else ""
                    )
                
                # Calcular nota final del período
                assignments_periodo = Assignment.objects.filter(
                    course_subject=cs, 
                    period=periodo, 
                    year=str(anio)
                )
                
                entries_estudiante = GradeEntry.objects.filter(
                    student=estudiante,
                    assignment__in=assignments_periodo
                )
                
                if entries_estudiante.exists():
                    # Calcular promedio ponderado
                    suma_ponderada = 0
                    suma_pesos = 0
                    
                    for entry in entries_estudiante:
                        peso = entry.assignment.weight
                        suma_ponderada += float(entry.score) * peso
                        suma_pesos += peso
                    
                    nota_final_periodo = suma_ponderada / suma_pesos if suma_pesos > 0 else 3.0
                    nota_final_periodo = round(nota_final_periodo, 1)
                    
                    # Crear la calificación del período
                    grade, created = Grade.objects.get_or_create(
                        student=estudiante,
                        course=course,
                        period=periodo,
                        year=str(anio),
                        defaults={
                            'value': nota_final_periodo,
                            'comments': f"Promedio del período {periodo}"
                        }
                    )
                    
                    if not created:
                        grade.value = nota_final_periodo
                        grade.save()
                    
                    # Asociar las entradas con la calificación del período
                    entries_estudiante.update(grade=grade)
                    
                    print(f"      📊 Período {periodo}: {nota_final_periodo}")
            
            # Generar asistencias realistas (30 registros por materia distribuidos en el año)
            fecha_inicio = date(anio, 2, 1)  # Inicio clases febrero
            fecha_fin = date(anio, 11, 30)   # Fin clases noviembre
            dias_totales = (fecha_fin - fecha_inicio).days
            
            # Generar 30 fechas aleatorias de clase
            fechas_clase = []
            for _ in range(30):
                dias_random = random.randint(0, dias_totales)
                fecha_clase = fecha_inicio + timedelta(days=dias_random)
                # Evitar fines de semana (aproximadamente)
                if fecha_clase.weekday() < 5:  # Lunes a Viernes
                    fechas_clase.append(fecha_clase)
            
            # Ordenar fechas
            fechas_clase.sort()
            
            # Crear registros de asistencia
            for fecha in fechas_clase:
                presente = random.random() < perfil['prob_asistencia']
                comentario = ""
                
                if not presente:
                    comentarios_ausencia = [
                        "Enfermedad", "Cita médica", "Calamidad familiar",
                        "Transporte", "Sin justificación", "Permiso especial"
                    ]
                    comentario = random.choice(comentarios_ausencia)
                
                Attendance.objects.get_or_create(
                    student=estudiante,
                    date=fecha,
                    subject=cs.subject,
                    defaults={
                        'present': presente,
                        'comments': comentario
                    }
                )
        
        # Mostrar resumen del estudiante
        asistencia_total = Attendance.objects.filter(student=estudiante).count()
        presente_total = Attendance.objects.filter(student=estudiante, present=True).count()
        porcentaje_asistencia = (presente_total / asistencia_total * 100) if asistencia_total > 0 else 0
        
        promedio_general = Grade.objects.filter(
            student=estudiante, 
            year=str(anio)
        ).aggregate(avg_grade=models.Avg('value'))['avg_grade'] or 0
        
        print(f"   ✅ {estudiante.first_name}: Promedio {promedio_general:.1f}, Asistencia {porcentaje_asistencia:.1f}%")
        print()
    
    print("🎉 ¡Datos de prueba cargados exitosamente!")
    print(f"📈 Resumen general:")
    
    # Estadísticas generales
    total_grades = Grade.objects.filter(year=str(anio)).count()
    total_entries = GradeEntry.objects.count()
    total_attendance = Attendance.objects.count()
    
    print(f"   • {total_grades} calificaciones de período generadas")
    print(f"   • {total_entries} entradas de calificación creadas")
    print(f"   • {total_attendance} registros de asistencia creados")
    
    # Promedio general del sistema
    avg_system = Grade.objects.filter(year=str(anio)).aggregate(
        avg_grade=models.Avg('value')
    )['avg_grade']
    
    if avg_system:
        print(f"   • Promedio general del sistema: {avg_system:.2f}")

# Ejecutar la función
if __name__ == "__main__":
    # Importar models para las consultas estadísticas
    from django.db import models
    cargar_datos_demo()