#!/usr/bin/env python
"""
Create Iranian school curriculum (6-3-3 system) as GLOBAL courses.

Global courses are available to ALL schools in the system.
This command deletes existing school-specific courses and creates
168 global courses for grades 1-12 (Iranian 6-3-3 system).

Usage:
    python manage.py create_iranian_curriculum
"""
from django.core.management.base import BaseCommand, CommandError
from apps.classes.models import Course


# Structure: (code, name, category, applicable_grades)
IRANIAN_CURRICULUM = [
    # Grade 1-2
    ('FA-01', 'فارسی', 'language', ['1']), ('NG-01', 'نگارش فارسی', 'language', ['1']),
    ('MA-01', 'ریاضی', 'math', ['1']), ('SC-01', 'علوم تجربی', 'science', ['1']),
    ('QR-01', 'قرآن', 'religion', ['1']), ('HD-01', 'هدیه‌های آسمانی', 'religion', ['1']),
    ('AR-01', 'آموزش هنر', 'arts', ['1']), ('PE-01', 'تربیت بدنی', 'sports', ['1']),
    ('FA-02', 'فارسی', 'language', ['2']), ('NG-02', 'نگارش فارسی', 'language', ['2']),
    ('MA-02', 'ریاضی', 'math', ['2']), ('SC-02', 'علوم تجربی', 'science', ['2']),
    ('QR-02', 'قرآن', 'religion', ['2']), ('HD-02', 'هدیه‌های آسمانی', 'religion', ['2']),
    ('AR-02', 'آموزش هنر', 'arts', ['2']), ('PE-02', 'تربیت بدنی', 'sports', ['2']),
    # Grade 3-4
    ('FA-03', 'فارسی', 'language', ['3']), ('NG-03', 'نگارش فارسی', 'language', ['3']),
    ('MA-03', 'ریاضی', 'math', ['3']), ('SC-03', 'علوم تجربی', 'science', ['3']),
    ('QR-03', 'قرآن', 'religion', ['3']), ('HD-03', 'هدیه‌های آسمانی', 'religion', ['3']),
    ('SO-03', 'مطالعات اجتماعی', 'general', ['3']), ('AR-03', 'آموزش هنر', 'arts', ['3']),
    ('PE-03', 'تربیت بدنی', 'sports', ['3']),
    ('FA-04', 'فارسی', 'language', ['4']), ('NG-04', 'نگارش', 'language', ['4']),
    ('MA-04', 'ریاضی', 'math', ['4']), ('SC-04', 'علوم تجربی', 'science', ['4']),
    ('QR-04', 'قرآن', 'religion', ['4']), ('HD-04', 'هدیه‌های آسمانی', 'religion', ['4']),
    ('SO-04', 'مطالعات اجتماعی', 'general', ['4']), ('AR-04', 'آموزش هنر', 'arts', ['4']),
    ('PE-04', 'تربیت بدنی', 'sports', ['4']),
    # Grade 5-6
    ('FA-05', 'فارسی', 'language', ['5']), ('NG-05', 'نگارش', 'language', ['5']),
    ('MA-05', 'ریاضی', 'math', ['5']), ('SC-05', 'علوم تجربی', 'science', ['5']),
    ('QR-05', 'قرآن', 'religion', ['5']), ('HD-05', 'هدیه‌های آسمانی', 'religion', ['5']),
    ('SO-05', 'مطالعات اجتماعی', 'general', ['5']), ('AR-05', 'آموزش هنر', 'arts', ['5']),
    ('PE-05', 'تربیت بدنی', 'sports', ['5']), ('TP-05', 'تفکر و پژوهش', 'general', ['5']),
    ('FA-06', 'فارسی', 'language', ['6']), ('NG-06', 'نگارش', 'language', ['6']),
    ('MA-06', 'ریاضی', 'math', ['6']), ('SC-06', 'علوم تجربی', 'science', ['6']),
    ('QR-06', 'قرآن', 'religion', ['6']), ('HD-06', 'هدیه‌های آسمانی', 'religion', ['6']),
    ('SO-06', 'مطالعات اجتماعی', 'general', ['6']), ('TP-06', 'تفکر و پژوهش', 'general', ['6']),
    ('WF-06', 'کار و فناوری', 'technology', ['6']), ('AR-06', 'آموزش هنر', 'arts', ['6']),
    ('PE-06', 'تربیت بدنی', 'sports', ['6']),
    # Grade 7-9 (Middle School)
    ('FA-07', 'فارسی', 'language', ['7']), ('NG-07', 'نگارش', 'language', ['7']),
    ('MA-07', 'ریاضی', 'math', ['7']), ('SC-07', 'علوم تجربی', 'science', ['7']),
    ('SO-07', 'مطالعات اجتماعی', 'general', ['7']), ('QR-07', 'قرآن', 'religion', ['7']),
    ('PA-07', 'پیام‌های آسمان', 'religion', ['7']), ('AR-07', 'عربی', 'language', ['7']),
    ('EN-07', 'زبان انگلیسی', 'language', ['7']), ('CU-07', 'فرهنگ و هنر', 'arts', ['7']),
    ('WF-07', 'کار و فناوری', 'technology', ['7']), ('TS-07', 'تفکر و سبک زندگی', 'general', ['7']),
    ('PE-07', 'تربیت بدنی', 'sports', ['7']),
    ('FA-08', 'فارسی', 'language', ['8']), ('NG-08', 'نگارش', 'language', ['8']),
    ('MA-08', 'ریاضی', 'math', ['8']), ('SC-08', 'علوم تجربی', 'science', ['8']),
    ('SO-08', 'مطالعات اجتماعی', 'general', ['8']), ('QR-08', 'قرآن', 'religion', ['8']),
    ('PA-08', 'پیام‌های آسمان', 'religion', ['8']), ('AR-08', 'عربی', 'language', ['8']),
    ('EN-08', 'زبان انگلیسی', 'language', ['8']), ('CU-08', 'فرهنگ و هنر', 'arts', ['8']),
    ('WF-08', 'کار و فناوری', 'technology', ['8']), ('TS-08', 'تفکر و سبک زندگی', 'general', ['8']),
    ('PE-08', 'تربیت بدنی', 'sports', ['8']),
    ('FA-09', 'فارسی', 'language', ['9']), ('NG-09', 'نگارش', 'language', ['9']),
    ('MA-09', 'ریاضی', 'math', ['9']), ('SC-09', 'علوم تجربی', 'science', ['9']),
    ('SO-09', 'مطالعات اجتماعی', 'general', ['9']), ('QR-09', 'قرآن', 'religion', ['9']),
    ('PA-09', 'پیام‌های آسمان', 'religion', ['9']), ('AR-09', 'عربی', 'language', ['9']),
    ('EN-09', 'زبان انگلیسی', 'language', ['9']), ('CU-09', 'فرهنگ و هنر', 'arts', ['9']),
    ('WF-09', 'کار و فناوری', 'technology', ['9']), ('AD-09', 'آمادگی دفاعی', 'sports', ['9']),
    ('PE-09', 'تربیت بدنی', 'sports', ['9']),
    # Grade 10 - Common
    ('FA-10', 'فارسی ۱', 'language', ['10']), ('NG-10', 'نگارش ۱', 'language', ['10']),
    ('AR-10', 'عربی، زبان قرآن ۱', 'language', ['10']), ('DN-10', 'دین و زندگی ۱', 'religion', ['10']),
    ('EN-10', 'زبان انگلیسی ۱', 'language', ['10']), ('TS-10', 'تفکر و سواد رسانه‌ای', 'general', ['10']),
    ('AD-10', 'آمادگی دفاعی', 'sports', ['10']), ('HN-10', 'هنر', 'arts', ['10']),
    ('KA-10', 'کارگاه کارآفرینی و تولید', 'technology', ['10']), ('PE-10', 'تربیت بدنی', 'sports', ['10']),
    # Grade 10 - Science Branch
    ('MA-S10', 'ریاضی ۱', 'math', ['10']), ('PH-S10', 'فیزیک ۱', 'science', ['10']),
    ('CH-S10', 'شیمی ۱', 'science', ['10']), ('BI-S10', 'زیست‌شناسی ۱', 'science', ['10']),
    ('LB-S10', 'آزمایشگاه علوم تجربی ۱', 'science', ['10']), ('GE-S10', 'جغرافیا ۱', 'general', ['10']),
    # Grade 10 - Math Branch
    ('GE-M10', 'هندسه ۱', 'math', ['10']), ('MA-M10', 'ریاضی ۱', 'math', ['10']),
    ('PH-M10', 'فیزیک ۱', 'science', ['10']), ('CH-M10', 'شیمی ۱', 'science', ['10']),
    ('JG-M10', 'جغرافیا ۱', 'general', ['10']),
    # Grade 10 - Humanities Branch
    ('RM-H10', 'ریاضی و آمار ۱', 'math', ['10']), ('EC-H10', 'اقتصاد', 'general', ['10']),
    ('SO-H10', 'جامعه‌شناسی ۱', 'general', ['10']), ('LG-H10', 'منطق', 'general', ['10']),
    ('HI-H10', 'تاریخ ۱', 'general', ['10']), ('JG-H10', 'جغرافیا ۱', 'general', ['10']),
    # Grade 11 - Common
    ('FA-11', 'فارسی ۲', 'language', ['11']), ('NG-11', 'نگارش ۲', 'language', ['11']),
    ('AR-11', 'عربی، زبان قرآن ۲', 'language', ['11']), ('DN-11', 'دین و زندگی ۲', 'religion', ['11']),
    ('EN-11', 'زبان انگلیسی ۲', 'language', ['11']), ('EH-11', 'انسان و محیط زیست', 'general', ['11']),
    ('PE-11', 'تربیت بدنی', 'sports', ['11']),
    # Grade 11 - Science Branch
    ('MA-S11', 'ریاضی ۲', 'math', ['11']), ('PH-S11', 'فیزیک ۲', 'science', ['11']),
    ('CH-S11', 'شیمی ۲', 'science', ['11']), ('BI-S11', 'زیست‌شناسی ۲', 'science', ['11']),
    ('LB-S11', 'آزمایشگاه علوم تجربی ۲', 'science', ['11']),
    # Grade 11 - Math Branch
    ('HS-M11', 'حسابان ۱', 'math', ['11']), ('GE-M11', 'هندسه ۲', 'math', ['11']),
    ('PH-M11', 'فیزیک ۲', 'science', ['11']), ('CH-M11', 'شیمی ۲', 'science', ['11']),
    ('ST-M11', 'آمار و احتمال', 'math', ['11']),
    # Grade 11 - Humanities Branch
    ('RM-H11', 'ریاضی و آمار ۲', 'math', ['11']), ('AD-H11', 'علوم و فنون ادبی ۲', 'language', ['11']),
    ('SO-H11', 'جامعه‌شناسی ۲', 'general', ['11']), ('HI-H11', 'تاریخ ۲', 'general', ['11']),
    ('JG-H11', 'جغرافیا ۲', 'general', ['11']), ('FL-H11', 'فلسفه ۱', 'general', ['11']),
    # Grade 12 - Common
    ('FA-12', 'فارسی ۳', 'language', ['12']), ('NG-12', 'نگارش ۳', 'language', ['12']),
    ('AR-12', 'عربی، زبان قرآن ۳', 'language', ['12']), ('DN-12', 'دین و زندگی ۳', 'religion', ['12']),
    ('EN-12', 'زبان انگلیسی ۳', 'language', ['12']), ('HE-12', 'سلامت و بهداشت', 'general', ['12']),
    ('ID-12', 'هویت اجتماعی', 'general', ['12']), ('PE-12', 'تربیت بدنی', 'sports', ['12']),
    # Grade 12 - Science Branch
    ('MA-S12', 'ریاضی ۳', 'math', ['12']), ('PH-S12', 'فیزیک ۳', 'science', ['12']),
    ('CH-S12', 'شیمی ۳', 'science', ['12']), ('BI-S12', 'زیست‌شناسی ۳', 'science', ['12']),
    # Grade 12 - Math Branch
    ('HS-M12', 'حسابان ۲', 'math', ['12']), ('GE-M12', 'هندسه ۳', 'math', ['12']),
    ('DM-M12', 'ریاضیات گسسته', 'math', ['12']), ('PH-M12', 'فیزیک ۳', 'science', ['12']),
    ('CH-M12', 'شیمی ۳', 'science', ['12']),
    # Grade 12 - Humanities Branch
    ('RM-H12', 'ریاضی و آمار ۳', 'math', ['12']), ('AD-H12', 'علوم و فنون ادبی ۳', 'language', ['12']),
    ('SO-H12', 'جامعه‌شناسی ۳', 'general', ['12']), ('HI-H12', 'تاریخ ۳', 'general', ['12']),
    ('JG-H12', 'جغرافیا ۳', 'general', ['12']), ('FL-H12', 'فلسفه ۲', 'general', ['12']),
]


class Command(BaseCommand):
    help = 'Create Iranian school curriculum (6-3-3) as GLOBAL courses for all schools'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete-existing',
            action='store_true',
            help='Delete all existing school-specific courses first'
        )

    def handle(self, *args, **options):
        delete_existing = options.get('delete_existing', False)
        
        # Count existing courses
        existing_global = Course.objects.filter(school__isnull=True).count()
        existing_school = Course.objects.filter(school__isnull=False).count()
        
        self.stdout.write(f"Existing global courses: {existing_global}")
        self.stdout.write(f"Existing school-specific courses: {existing_school}")
        
        # Optionally delete school-specific courses
        if delete_existing and existing_school > 0:
            self.stdout.write(self.style.WARNING(f"\nDeleting {existing_school} school-specific courses..."))
            Course.objects.filter(school__isnull=False).delete()
            self.stdout.write(self.style.SUCCESS("School-specific courses deleted."))
        
        # Create global courses (school=None)
        created = 0
        for code, name, category, grades in IRANIAN_CURRICULUM:
            course, was_created = Course.objects.get_or_create(
                school=None,  # Global course - no school assigned
                code=code,
                defaults={
                    'name': name,
                    'category': category,
                    'applicable_grades': grades,
                    'description': f'درس {name}',
                    'is_global': True,  # Mark as global
                }
            )
            if was_created:
                created += 1
        
        total_global = Course.objects.filter(school__isnull=True).count()
        
        self.stdout.write(self.style.SUCCESS(f"\n✅ {created} new global courses created"))
        self.stdout.write(f"Total global courses: {total_global}")
        self.stdout.write("\nThese courses are now available to ALL schools in the system.")
