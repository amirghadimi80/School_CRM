#!/usr/bin/env python
"""Verify the Iranian curriculum was created correctly."""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.classes.models import Course
from apps.schools.models import School, AcademicYear
from apps.users.models import User

# Write output to file with UTF-8 encoding
with open('curriculum_report.txt', 'w', encoding='utf-8') as f:
    school = School.objects.first()
    f.write(f'School ID: {school.id}\n')
    f.write(f'School: {school.name}\n')
    f.write(f'Total courses: {Course.objects.filter(school=school).count()}\n')
    f.write('\n')
    
    # Check users
    f.write('Users:\n')
    users = User.objects.all()
    f.write(f'Total users: {users.count()}\n')
    for user in users:
        f.write(f'  - {user.email} (Role: {user.role}, Active: {user.is_active}, Superuser: {user.is_superuser})\n')
    f.write('\n')
    
    # Check academic years
    f.write('Academic Years:\n')
    academic_years = AcademicYear.objects.filter(school=school)
    f.write(f'Total academic years: {academic_years.count()}\n')
    for ay in academic_years:
        f.write(f'  - {ay.name} ({ay.start_date} to {ay.end_date}) - Active: {ay.is_active}, Current: {ay.is_current}, Visible: {ay.is_visible}\n')
    f.write('\n')

    # Show courses by grade (manual count for SQLite compatibility)
    for grade in range(1, 13):
        count = sum(1 for c in Course.objects.filter(school=school) if str(grade) in c.applicable_grades)
        if count > 0:
            f.write(f'Grade {grade}: {count} courses\n')

    f.write('\n')
    f.write('Sample courses:\n')
    for c in Course.objects.filter(school=school)[:10]:
        f.write(f'  - {c.code}: {c.name} (Grade {c.applicable_grades}, {c.category})\n')

    f.write('\n')
    f.write('Courses by category:\n')
    from django.db.models import Count
    categories = Course.objects.filter(school=school).values('category').annotate(count=Count('id'))
    for cat in categories:
        f.write(f'  - {cat["category"]}: {cat["count"]} courses\n')

print("Report saved to curriculum_report.txt")
