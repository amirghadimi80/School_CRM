# Generated manually to make school field nullable for global courses
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0003_alter_course_unique_together_course_is_global_and_more'),
        ('schools', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='school',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='courses',
                to='schools.school',
                verbose_name='School'
            ),
        ),
    ]
