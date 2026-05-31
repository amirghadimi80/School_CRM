#!/usr/bin/env python
"""Verify the Iranian curriculum was created correctly."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.classes.models import Course
from apps.schools.models import School

school = School.objects.first()
print(f'School: {school.name}')
print(f'Total courses: {Course.objects.filter(school=school).count()}')
print()

# Show courses by grade (manual count for SQLite compatibility)
for grade in range(1, 13):
    count = sum(1 for c in Course.objects.filter(school=school) if str(grade) in c.applicable_grades)
    if count > 0:
        print(f'Grade {grade}: {count} courses')

print()
print('Sample courses:')
for c in Course.objects.filter(school=school)[:10]:
    print(f'  - {c.code}: {c.name} (Grade {c.applicable_grades}, {c.category})')

print()
print('Courses by category:')
from django.db.models import Count
categories = Course.objects.filter(school=school).values('category').annotate(count=Count('id'))
for cat in categories:
    print(f'  - {cat["category"]}: {cat["count"]} courses')
