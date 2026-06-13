# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0005_migrate_academic_year'),
    ]

    operations = [
        migrations.AddField(
            model_name='class',
            name='branch',
            field=models.CharField(
                blank=True,
                choices=[
                    ('math', 'Mathematics'),
                    ('science', 'Science'),
                    ('humanities', 'Humanities'),
                ],
                help_text='Only for high school (grades 10-12)',
                max_length=20,
                null=True,
                verbose_name='Branch',
            ),
        ),
    ]
