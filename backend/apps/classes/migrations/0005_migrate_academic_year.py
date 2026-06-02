# Custom migration to convert academic_year from CharField to ForeignKey
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models, transaction
from django.utils import timezone


def migrate_academic_year_data(apps, schema_editor):
    """
    Convert academic_year CharField values to ForeignKey references.
    """
    Class = apps.get_model('classes', 'Class')
    AcademicYear = apps.get_model('schools', 'AcademicYear')
    School = apps.get_model('schools', 'School')
    
    # Get all unique (school_id, academic_year_string) combinations
    unique_years = Class.objects.values('school', 'academic_year_old').distinct()
    
    year_mapping = {}  # Map (school_id, year_string) -> academic_year_id
    
    for item in unique_years:
        school_id = item['school']
        year_string = item['academic_year_old']
        
        if not year_string or not school_id:
            continue
            
        school = School.objects.get(id=school_id)
        
        # Try to parse year from string (e.g., "1403-1404")
        try:
            years = year_string.split('-')
            if len(years) == 2:
                start_year = int(years[0])
                end_year = int(years[1])
                # Convert to Gregorian for dates (approximate)
                start_date = timezone.datetime(start_year + 621, 3, 21).date()  # Nowruz
                end_date = timezone.datetime(end_year + 621, 3, 20).date()
            else:
                year = int(years[0])
                start_date = timezone.datetime(year + 621, 3, 21).date()
                end_date = timezone.datetime(year + 622, 3, 20).date()
        except (ValueError, IndexError):
            today = timezone.now().date()
            start_date = today
            end_date = today.replace(year=today.year + 1)
        
        academic_year, created = AcademicYear.objects.get_or_create(
            school=school,
            name=year_string,
            defaults={
                'start_date': start_date,
                'end_date': end_date,
                'is_current': True,
                'is_active': True,
            }
        )
        
        year_mapping[(school_id, year_string)] = academic_year.id
    
    # Now update all Class records
    for (school_id, year_string), ay_id in year_mapping.items():
        Class.objects.filter(
            school_id=school_id,
            academic_year_old=year_string
        ).update(academic_year_id=ay_id)


def reverse_migrate(apps, schema_editor):
    """Reverse migration - restore CharField values"""
    Class = apps.get_model('classes', 'Class')
    AcademicYear = apps.get_model('schools', 'AcademicYear')
    
    for cls in Class.objects.all():
        if cls.academic_year:
            cls.academic_year_old = cls.academic_year.name
            cls.save(update_fields=['academic_year_old'])


class Migration(migrations.Migration):
    
    dependencies = [
        ("classes", "0004_alter_course_school"),
        ("schools", "0002_add_scheduling_models"),
        ("teachers", "0002_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    
    operations = [
        # Step 0: Remove unique_together and indexes first
        migrations.AlterUniqueTogether(
            name='class',
            unique_together=set(),
        ),
        migrations.RemoveIndex(
            model_name='class',
            name='classes_cla_school__9cd6a8_idx',
        ),
        migrations.RemoveIndex(
            model_name='class',
            name='classes_cla_school__c99f2c_idx',
        ),
        
        # Step 1: Rename old field to keep data temporarily
        migrations.RenameField(
            model_name='class',
            old_name='academic_year',
            new_name='academic_year_old',
        ),
        
        # Step 2: Add new ForeignKey field (nullable initially)
        migrations.AddField(
            model_name='class',
            name='academic_year',
            field=models.ForeignKey(
                to='schools.academicyear',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='classes',
                verbose_name='Academic Year',
                null=True,
                blank=True,
            ),
        ),
        
        # Step 3: Run data migration
        migrations.RunPython(migrate_academic_year_data, reverse_migrate),
        
        # Step 4: Remove old field
        migrations.RemoveField(
            model_name='class',
            name='academic_year_old',
        ),
        
        # Step 5: Make new field non-nullable
        migrations.AlterField(
            model_name='class',
            name='academic_year',
            field=models.ForeignKey(
                to='schools.academicyear',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='classes',
                verbose_name='Academic Year',
            ),
        ),
        
        # Step 6: Update unique_together and add new indexes
        migrations.AlterUniqueTogether(
            name='class',
            unique_together={('academic_year', 'name')},
        ),
        
        migrations.AddIndex(
            model_name='class',
            index=models.Index(
                fields=['academic_year', 'grade_level'],
                name='classes_cla_academi_70bd4d_idx',
            ),
        ),
        migrations.AddIndex(
            model_name='class',
            index=models.Index(
                fields=['academic_year', 'is_active'],
                name='classes_cla_academi_9af5d9_idx',
            ),
        ),
    ]
