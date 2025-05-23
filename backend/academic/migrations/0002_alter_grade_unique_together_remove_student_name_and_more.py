# Generated by Django 5.1.6 on 2025-02-21 04:54

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='grade',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='student',
            name='name',
        ),
        migrations.RemoveField(
            model_name='teacher',
            name='name',
        ),
        migrations.AddField(
            model_name='grade',
            name='year',
            field=models.CharField(default='2023', max_length=4),
        ),
        migrations.AddField(
            model_name='student',
            name='email',
            field=models.EmailField(default='default@gmail.com', max_length=254, unique=True),
        ),
        migrations.AddField(
            model_name='student',
            name='first_name',
            field=models.CharField(default='Defecto', max_length=100),
        ),
        migrations.AddField(
            model_name='student',
            name='last_name',
            field=models.CharField(default='Defecto', max_length=100),
        ),
        migrations.AddField(
            model_name='student',
            name='middle_name',
            field=models.CharField(blank=True, default='Defecto', max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='student',
            name='second_last_name',
            field=models.CharField(blank=True, default='Defecto', max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='teacher',
            name='date_of_birth',
            field=models.DateField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='teacher',
            name='email',
            field=models.EmailField(default='default@gmail.com', max_length=254, unique=True),
        ),
        migrations.AddField(
            model_name='teacher',
            name='first_name',
            field=models.CharField(default='Defecto', max_length=100),
        ),
        migrations.AddField(
            model_name='teacher',
            name='last_name',
            field=models.CharField(default='Defecto', max_length=100),
        ),
        migrations.AddField(
            model_name='teacher',
            name='middle_name',
            field=models.CharField(blank=True, default='Defecto', max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='teacher',
            name='second_last_name',
            field=models.CharField(blank=True, default='Defecto', max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='teacher',
            name='title',
            field=models.CharField(default='Defecto', max_length=50),
        ),
        migrations.AlterField(
            model_name='course',
            name='code',
            field=models.CharField(blank=True, max_length=20, unique=True),
        ),
        migrations.AlterField(
            model_name='grade',
            name='period',
            field=models.PositiveSmallIntegerField(default=1),
        ),
        migrations.AlterField(
            model_name='student',
            name='student_id',
            field=models.CharField(blank=True, max_length=20, unique=True),
        ),
        migrations.AlterField(
            model_name='student',
            name='user',
            field=models.OneToOneField(blank=True, limit_choices_to={'user_type': 'student'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='student_profile', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='teacher',
            name='teacher_id',
            field=models.CharField(blank=True, max_length=20, unique=True),
        ),
        migrations.AlterField(
            model_name='teacher',
            name='user',
            field=models.OneToOneField(blank=True, limit_choices_to={'user_type': 'teacher'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='teacher_profile', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='grade',
            unique_together={('student', 'course', 'period', 'year')},
        ),
        migrations.CreateModel(
            name='Administrator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(default='Defecto', max_length=100)),
                ('middle_name', models.CharField(blank=True, default='Defecto', max_length=100, null=True)),
                ('last_name', models.CharField(default='Defecto', max_length=100)),
                ('second_last_name', models.CharField(blank=True, default='Defecto', max_length=100, null=True)),
                ('title', models.CharField(blank=True, default='', max_length=50)),
                ('date_of_birth', models.DateField(blank=True, default=django.utils.timezone.now, null=True)),
                ('email', models.EmailField(default='default@gmail.com', max_length=254, unique=True)),
                ('user', models.OneToOneField(blank=True, limit_choices_to={'user_type': 'director'}, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='admin_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Administrativo',
                'verbose_name_plural': 'Administrativos',
            },
        ),
    ]
