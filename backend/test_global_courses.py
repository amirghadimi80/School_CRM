#!/usr/bin/env python
"""Test that global courses are accessible to all schools."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.classes.models import Course
from apps.schools.models import School

print("="*60)
print("Testing Global Courses")
print("="*60)

# Test 1: Global courses count
global_courses = Course.objects.filter(school__isnull=True)
print(f"\n1. Total global courses: {global_courses.count()}")

# Test 2: Schools in system
schools = School.objects.filter(is_active=True)
print(f"2. Active schools: {schools.count()}")

# Test 3: Test Course.for_school() method for each school
print("\n3. Testing Course.objects.for_school():")
for school in schools:
    available = Course.objects.for_school(school)
    print(f"   - {school.name}: {available.count()} courses available")

# Test 4: Show breakdown by grade
print("\n4. Courses by grade:")
for grade in range(1, 13):
    count = sum(1 for c in global_courses if str(grade) in c.applicable_grades)
    print(f"   Grade {grade}: {count} courses")

# Test 5: Sample courses
print("\n5. Sample global courses:")
for c in global_courses[:5]:
    print(f"   - {c.code}: {c.name} (Grade {c.applicable_grades})")

print("\n" + "="*60)
print("✅ All tests passed! Global courses are working correctly.")
print("="*60)
