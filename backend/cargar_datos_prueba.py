# crear_estudiantes_prueba.py
import os
import django
from django.conf import settings

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_project.settings')
django.setup()

# Importar modelos necesarios
from authentication.models import User
from academic.models import Student, Course, Grado
from django.utils import timezone
import random
from datetime import date

def crear_estudiantes_demo():
    print("👥 Creando 32 estudiantes demo para los cursos 1-A, 1-B, 1-C, 1-D...")
    
    # Obtener o crear el grado 1
    grado_1, created = Grado.objects.get_or_create(numero=1)
    if created:
        print(f"✅ Grado 1 creado: {grado_1}")
    
    # Obtener o crear los cursos
    cursos_data = ['1-A', '1-B', '1-C', '1-D']
    cursos = {}
    
    for curso_nombre in cursos_data:
        curso, created = Course.objects.get_or_create(
            name=curso_nombre,
            defaults={
                'description': f'Curso {curso_nombre} - Primer grado',
                'academic_year': f'{timezone.now().year}-{timezone.now().year + 1}',
                'grado': grado_1
            }
        )
        cursos[curso_nombre] = curso
        if created:
            print(f"✅ Curso {curso_nombre} creado")
    
    # Lista completa de estudiantes (8 por curso = 32 total)
    estudiantes_data = [
        # CURSO 1-A (8 estudiantes)
        {
            'first_name': 'María Alejandra',
            'middle_name': 'Isabel',
            'last_name': 'García',
            'second_last_name': 'López',
            'email': 'maria.garcia@estudiantescol.edu.co',
            'course': '1-A',
            'date_of_birth': date(2018, 3, 15),
            'gender': 'F',
            'neighborhood': 'Centro',
            'socioeconomic_status': 'MEDIO'
        },
        {
            'first_name': 'Carlos Andrés',
            'middle_name': 'José',
            'last_name': 'Martínez',
            'second_last_name': 'Ruiz',
            'email': 'carlos.martinez@estudiantescol.edu.co',
            'course': '1-A',
            'date_of_birth': date(2018, 7, 22),
            'gender': 'M',
            'neighborhood': 'La Granja',
            'socioeconomic_status': 'MEDIO_BAJO'
        },
        {
            'first_name': 'Ana Sofía',
            'middle_name': 'Mercedes',
            'last_name': 'Rodríguez',
            'second_last_name': 'Hernández',
            'email': 'ana.rodriguez@estudiantescol.edu.co',
            'course': '1-A',
            'date_of_birth': date(2018, 11, 8),
            'gender': 'F',
            'neighborhood': 'Pastrana',
            'socioeconomic_status': 'ALTO'
        },
        {
            'first_name': 'Diego Fernando',
            'middle_name': 'Luis',
            'last_name': 'Morales',
            'second_last_name': 'Castro',
            'email': 'diego.morales@estudiantescol.edu.co',
            'course': '1-A',
            'date_of_birth': date(2018, 5, 30),
            'gender': 'M',
            'neighborhood': 'El Prado',
            'socioeconomic_status': 'MEDIO'
        },
        {
            'first_name': 'Valentina',
            'middle_name': 'Esperanza',
            'last_name': 'Jiménez',
            'second_last_name': 'Peña',
            'email': 'valentina.jimenez@estudiantescol.edu.co',
            'course': '1-A',
            'date_of_birth': date(2018, 9, 17),
            'gender': 'F',
            'neighborhood': 'Boston',
            'socioeconomic_status': 'MEDIO_ALTO'
        },
        {
            'first_name': 'Santiago',
            'middle_name': 'Alejandro',
            'last_name': 'Vargas',
            'second_last_name': 'Mendoza',
            'email': 'santiago.vargas@estudiantescol.edu.co',
            'course': '1-A',
            'date_of_birth': date(2018, 1, 25),
            'gender': 'M',
            'neighborhood': 'Mogambo',
            'socioeconomic_status': 'BAJO'
        },
        {
            'first_name': 'Isabella',
            'middle_name': 'Victoria',
            'last_name': 'Torres',
            'second_last_name': 'Ramos',
            'email': 'isabella.torres@estudiantescol.edu.co',
            'course': '1-A',
            'date_of_birth': date(2018, 12, 3),
            'gender': 'F',
            'neighborhood': 'Villa Jiménez',
            'socioeconomic_status': 'MEDIO'
        },
        {
            'first_name': 'Mateo Alejandro',
            'middle_name': 'Daniel',
            'last_name': 'Córdoba',
            'second_last_name': 'Suárez',
            'email': 'mateo.cordoba@estudiantescol.edu.co',
            'course': '1-A',
            'date_of_birth': date(2018, 6, 12),
            'gender': 'M',
            'neighborhood': 'Villa Cielo',
            'socioeconomic_status': 'MEDIO_BAJO'
        },
        
        # CURSO 1-B (8 estudiantes)
        {
            'first_name': 'Camila Andrea',
            'middle_name': 'Beatriz',
            'last_name': 'Sánchez',
            'second_last_name': 'Moreno',
            'email': 'camila.sanchez@estudiantescol.edu.co',
            'course': '1-B',
            'date_of_birth': date(2018, 4, 18),
            'gender': 'F',
            'neighborhood': 'La Castellana',
            'socioeconomic_status': 'ALTO'
        },
        {
            'first_name': 'Sebastián',
            'middle_name': 'Eduardo',
            'last_name': 'Ramírez',
            'second_last_name': 'Villareal',
            'email': 'sebastian.ramirez@estudiantescol.edu.co',
            'course': '1-B',
            'date_of_birth': date(2018, 8, 9),
            'gender': 'M',
            'neighborhood': 'El Recreo',
            'socioeconomic_status': 'MEDIO'
        },
        {
            'first_name': 'Lucía Fernanda',
            'middle_name': 'Gabriela',
            'last_name': 'Ospina',
            'second_last_name': 'Guerrero',
            'email': 'lucia.ospina@estudiantescol.edu.co',
            'course': '1-B',
            'date_of_birth': date(2018, 2, 14),
            'gender': 'F',
            'neighborhood': 'Furatena',
            'socioeconomic_status': 'MEDIO_ALTO'
        },
        {
            'first_name': 'Alejandro',
            'middle_name': 'Nicolás',
            'last_name': 'Herrera',
            'second_last_name': 'Castaño',
            'email': 'alejandro.herrera@estudiantescol.edu.co',
            'course': '1-B',
            'date_of_birth': date(2018, 10, 27),
            'gender': 'M',
            'neighborhood': 'Robinson Pitalúa',
            'socioeconomic_status': 'BAJO'
        },
        {
            'first_name': 'Sofía Valentina',
            'middle_name': 'Cristina',
            'last_name': 'Castillo',
            'second_last_name': 'Romero',
            'email': 'sofia.castillo@estudiantescol.edu.co',
            'course': '1-B',
            'date_of_birth': date(2018, 6, 5),
            'gender': 'F',
            'neighborhood': 'Villa Margarita',
            'socioeconomic_status': 'MEDIO'
        },
        {
            'first_name': 'Daniel Esteban',
            'middle_name': 'Mauricio',
            'last_name': 'Aguilar',
            'second_last_name': 'Quintero',
            'email': 'daniel.aguilar@estudiantescol.edu.co',
            'course': '1-B',
            'date_of_birth': date(2018, 12, 19),
            'gender': 'M',
            'neighborhood': 'El Dorado',
            'socioeconomic_status': 'MEDIO_BAJO'
        },
        {
            'first_name': 'Mariana',
            'middle_name': 'Alejandra',
            'last_name': 'Vásquez',
            'second_last_name': 'Salazar',
            'email': 'mariana.vasquez@estudiantescol.edu.co',
            'course': '1-B',
            'date_of_birth': date(2018, 3, 28),
            'gender': 'F',
            'neighborhood': 'Santa Fe',
            'socioeconomic_status': 'ALTO'
        },
        {
            'first_name': 'Andrés Felipe',
            'middle_name': 'Camilo',
            'last_name': 'Navarro',
            'second_last_name': 'Parra',
            'email': 'andres.navarro@estudiantescol.edu.co',
            'course': '1-B',
            'date_of_birth': date(2018, 9, 11),
            'gender': 'M',
            'neighborhood': 'Villa Nazaret',
            'socioeconomic_status': 'MEDIO'
        },
        
        # CURSO 1-C (8 estudiantes)
        {
            'first_name': 'Gabriela',
            'middle_name': 'Antonia',
            'last_name': 'Delgado',
            'second_last_name': 'Mejía',
            'email': 'gabriela.delgado@estudiantescol.edu.co',
            'course': '1-C',
            'date_of_birth': date(2018, 5, 7),
            'gender': 'F',
            'neighborhood': 'Cantaclaro',
            'socioeconomic_status': 'MEDIO_ALTO'
        },
        {
            'first_name': 'Juan Pablo',
            'middle_name': 'Esteban',
            'last_name': 'Medina',
            'second_last_name': 'Cardona',
            'email': 'juan.medina@estudiantescol.edu.co',
            'course': '1-C',
            'date_of_birth': date(2018, 11, 23),
            'gender': 'M',
            'neighborhood': '7 de Mayo',
            'socioeconomic_status': 'BAJO'
        },
        {
            'first_name': 'Paula Andrea',
            'middle_name': 'Stefanía',
            'last_name': 'Ruiz',
            'second_last_name': 'Montoya',
            'email': 'paula.ruiz@estudiantescol.edu.co',
            'course': '1-C',
            'date_of_birth': date(2018, 1, 16),
            'gender': 'F',
            'neighborhood': 'La Pradera',
            'socioeconomic_status': 'MEDIO'
        },
        {
            'first_name': 'Nicolás',
            'middle_name': 'Alexander',
            'last_name': 'Silva',
            'second_last_name': 'Ríos',
            'email': 'nicolas.silva@estudiantescol.edu.co',
            'course': '1-C',
            'date_of_birth': date(2018, 7, 4),
            'gender': 'M',
            'neighborhood': 'Villa Santos',
            'socioeconomic_status': 'ALTO'
        },
        {
            'first_name': 'Valeria',
            'middle_name': 'Natalia',
            'last_name': 'Peña',
            'second_last_name': 'Galvis',
            'email': 'valeria.pena@estudiantescol.edu.co',
            'course': '1-C',
            'date_of_birth': date(2018, 4, 21),
            'gender': 'F',
            'neighborhood': 'Los Nogales',
            'socioeconomic_status': 'MEDIO_BAJO'
        },
        {
            'first_name': 'Miguel Ángel',
            'middle_name': 'Sebastián',
            'last_name': 'Gómez',
            'second_last_name': 'Restrepo',
            'email': 'miguel.gomez@estudiantescol.edu.co',
            'course': '1-C',
            'date_of_birth': date(2018, 10, 13),
            'gender': 'M',
            'neighborhood': 'El Paraíso',
            'socioeconomic_status': 'MEDIO'
        },
        {
            'first_name': 'Emma Lucía',
            'middle_name': 'Esperanza',
            'last_name': 'Ortega',
            'second_last_name': 'Muñoz',
            'email': 'emma.ortega@estudiantescol.edu.co',
            'course': '1-C',
            'date_of_birth': date(2018, 8, 26),
            'gender': 'F',
            'neighborhood': 'Nueva Esperanza',
            'socioeconomic_status': 'MEDIO_ALTO'
        },
        {
            'first_name': 'Samuel',
            'middle_name': 'David',
            'last_name': 'Vega',
            'second_last_name': 'Cortés',
            'email': 'samuel.vega@estudiantescol.edu.co',
            'course': '1-C',
            'date_of_birth': date(2018, 12, 1),
            'gender': 'M',
            'neighborhood': 'Villa Real',
            'socioeconomic_status': 'BAJO'
        },
        
        # CURSO 1-D (8 estudiantes)
        {
            'first_name': 'Antonella',
            'middle_name': 'Fernanda',
            'last_name': 'Flores',
            'second_last_name': 'Barrera',
            'email': 'antonella.flores@estudiantescol.edu.co',
            'course': '1-D',
            'date_of_birth': date(2018, 2, 9),
            'gender': 'F',
            'neighborhood': 'Urbanización El Edén',
            'socioeconomic_status': 'ALTO'
        },
        {
            'first_name': 'Leonardo',
            'middle_name': 'Andrés',
            'last_name': 'Carvajal',
            'second_last_name': 'Escobar',
            'email': 'leonardo.carvajal@estudiantescol.edu.co',
            'course': '1-D',
            'date_of_birth': date(2018, 6, 15),
            'gender': 'M',
            'neighborhood': 'Villa Campestre',
            'socioeconomic_status': 'MEDIO'
        },
        {
            'first_name': 'Renata',
            'middle_name': 'Isabel',
            'last_name': 'Acosta',
            'second_last_name': 'Varela',
            'email': 'renata.acosta@estudiantescol.edu.co',
            'course': '1-D',
            'date_of_birth': date(2018, 9, 3),
            'gender': 'F',
            'neighborhood': 'El Laguito',
            'socioeconomic_status': 'MEDIO_BAJO'
        },
        {
            'first_name': 'Emilio',
            'middle_name': 'José',
            'last_name': 'Palacios',
            'second_last_name': 'Franco',
            'email': 'emilio.palacios@estudiantescol.edu.co',
            'course': '1-D',
            'date_of_birth': date(2018, 3, 20),
            'gender': 'M',
            'neighborhood': 'San Martín',
            'socioeconomic_status': 'ALTO'
        },
        {
            'first_name': 'Zoe',
            'middle_name': 'Alejandra',
            'last_name': 'Montaño',
            'second_last_name': 'Rivera',
            'email': 'zoe.montano@estudiantescol.edu.co',
            'course': '1-D',
            'date_of_birth': date(2018, 11, 12),
            'gender': 'F',
            'neighborhood': 'Los Laureles',
            'socioeconomic_status': 'MEDIO'
        },
        {
            'first_name': 'Joaquín',
            'middle_name': 'Rafael',
            'last_name': 'Bermúdez',
            'second_last_name': 'Calderón',
            'email': 'joaquin.bermudez@estudiantescol.edu.co',
            'course': '1-D',
            'date_of_birth': date(2018, 5, 29),
            'gender': 'M',
            'neighborhood': 'Villa Fátima',
            'socioeconomic_status': 'BAJO'
        },
        {
            'first_name': 'Abril',
            'middle_name': 'Daniela',
            'last_name': 'Paredes',
            'second_last_name': 'Hernández',
            'email': 'abril.paredes@estudiantescol.edu.co',
            'course': '1-D',
            'date_of_birth': date(2018, 8, 8),
            'gender': 'F',
            'neighborhood': 'Ciudad Verde',
            'socioeconomic_status': 'MEDIO_ALTO'
        },
        {
            'first_name': 'Maximiliano',
            'middle_name': 'Santiago',
            'last_name': 'Lozano',
            'second_last_name': 'Mendez',
            'email': 'maximiliano.lozano@estudiantescol.edu.co',
            'course': '1-D',
            'date_of_birth': date(2018, 12, 24),
            'gender': 'M',
            'neighborhood': 'El Progreso',
            'socioeconomic_status': 'MEDIO'
        }
    ]
    
    print(f"📊 Creando {len(estudiantes_data)} estudiantes...")
    
    estudiantes_creados = 0
    estudiantes_existentes = 0
    
    for data in estudiantes_data:
        try:
            # Verificar si el usuario ya existe
            if User.objects.filter(email=data['email']).exists():
                print(f"⚠️  Usuario {data['email']} ya existe. Saltando...")
                estudiantes_existentes += 1
                continue
            
            if User.objects.filter(email=data['email']).exists():
                print(f"⚠️  Email {data['email']} ya existe. Saltando...")
                estudiantes_existentes += 1
                continue
            
            # Crear el usuario
            user = User.objects.create_user(
                email=data['email'],
                password='Tesis123',  # Contraseña fija como solicitaste
                first_name=data['first_name'],
                last_name=data['last_name'],
                user_type='student',
                is_active=True  # Email confirmado automáticamente
            )
            
            # Crear el estudiante
            student = Student.objects.create(
                user=user,
                first_name=data['first_name'],
                middle_name=data.get('middle_name', ''),
                last_name=data['last_name'],
                second_last_name=data.get('second_last_name', ''),
                date_of_birth=data['date_of_birth'],
                email=data['email'],
                gender=data['gender'],
                neighborhood=data['neighborhood'],
                socioeconomic_status=data['socioeconomic_status'],
                course=cursos[data['course']],
                grado=grado_1
            )
            
            estudiantes_creados += 1
            print(f"✅ Creado: {student.first_name} {student.last_name} ({data['course']}) - {data['neighborhood']}")
            
        except Exception as e:
            print(f"❌ Error creando estudiante {data['first_name']} {data['last_name']}: {str(e)}")
    
    print(f"\n🎉 Proceso completado!")
    print(f"✅ Estudiantes creados: {estudiantes_creados}")
    print(f"⚠️  Estudiantes ya existentes: {estudiantes_existentes}")
    
    # Mostrar resumen por curso
    print(f"\n📊 Resumen por curso:")
    for curso_nombre in cursos_data:
        count = Student.objects.filter(course__name=curso_nombre).count()
        print(f"   {curso_nombre}: {count} estudiantes")
    
    # Mostrar resumen por género
    print(f"\n👫 Resumen por género:")
    masculino = Student.objects.filter(gender='M', grado=grado_1).count()
    femenino = Student.objects.filter(gender='F', grado=grado_1).count()
    print(f"   Masculino: {masculino}")
    print(f"   Femenino: {femenino}")
    
    # Mostrar resumen por nivel socioeconómico
    print(f"\n💰 Resumen por nivel socioeconómico:")
    for choice in Student.SOCIOECONOMIC_CHOICES:
        count = Student.objects.filter(socioeconomic_status=choice[0], grado=grado_1).count()
        print(f"   {choice[1]}: {count}")
    
    print(f"\n🔑 Credenciales de acceso:")
    print(f"   Username: [como se muestran arriba]")
    print(f"   Password: Tesis123 (para todos)")
    print(f"   Email confirmado: Sí (is_active=True)")

# Ejecutar la función
if __name__ == "__main__":
    crear_estudiantes_demo()