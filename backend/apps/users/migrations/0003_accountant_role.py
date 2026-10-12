from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_student_profile_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('super_admin', 'Super Admin'),
                    ('school_admin', 'School Admin'),
                    ('accountant', 'Accountant'),
                    ('teacher', 'Teacher'),
                    ('student', 'Student'),
                    ('parent', 'Parent'),
                ],
                default='student',
                max_length=20,
                verbose_name='Role',
            ),
        ),
    ]
