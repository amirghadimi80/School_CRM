#!/usr/bin/env python
"""
Script to create test data - School, Class, Teacher User, Student User
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.users.models import User
from apps.students.models import Student
from apps.teachers.models import Teacher
from apps.schools.models import School
from apps.classes.models import Class, Course

def create_test_data():
    print("Creating test data...")
    
    # Create School if not exists
    school, created = School.objects.get_or_create(
        name='دبیرستان نمونه',
        defaults={
            'slug': 'sample-school',
            'address': 'تهران',
            'phone': '021-12345678',
            'email': 'school@test.com',
            'current_academic_year': '1403-1404',
            'education_level': 'high_school',
        }
    )
    if created:
        print(f"✅ School created: {school.name}")
    else:
        print(f"ℹ️ School already exists: {school.name}")
    
    # Create a Course
    course, created = Course.objects.get_or_create(
        school=school,
        name='ریاضی',
        defaults={
            'code': 'MATH101',
            'description': 'درس ریاضی',
        }
    )
    if created:
        print(f"✅ Course created: {course.name}")
    
    # Create a Class if not exists
    class_obj, created = Class.objects.get_or_create(
        school=school,
        name='کلاس ۱۰۱',
        defaults={
            'grade_level': '10',
            'capacity': 30,
            'academic_year': '1403-1404',
        }
    )
    if created:
        print(f"✅ Class created: {class_obj.name}")
    else:
        print(f"ℹ️ Class already exists: {class_obj.name}")
    
    # Create Teacher User if not exists
    try:
        teacher_user = User.objects.get(email='teacher@test.com')
        print(f"ℹ️ Teacher user already exists: {teacher_user.email}")
    except User.DoesNotExist:
        teacher_user = User.objects.create_user(
            email='teacher@test.com',
            password='test1234',
            first_name='علی',
            last_name='محمدی',
            role='teacher',
            school=school
        )
        teacher = Teacher.objects.create(
            user=teacher_user,
            school=school,
            employee_id='T001',
            specialization='ریاضی',
        )
        print(f"✅ Teacher created: {teacher_user.email} / test1234")
    
    # Create Student User if not exists
    try:
        student_user = User.objects.get(email='student@test.com')
        print(f"ℹ️ Student user already exists: {student_user.email}")
    except User.DoesNotExist:
        student_user = User.objects.create_user(
            email='student@test.com',
            password='test1234',
            first_name='رضا',
            last_name='احمدی',
            role='student',
            school=school
        )
        student = Student.objects.create(
            user=student_user,
            school=school,
            student_code='S001',
            grade_level='10',
            current_class=class_obj,
        )
        print(f"✅ Student created: {student_user.email} / test1234")
    
    print("\n" + "="*50)
    print("✅ Test data created successfully!")
    print("="*50)
    print("\nLogin credentials:")
    print("  Teacher: teacher@test.com / test1234")
    print("  Student: student@test.com / test1234")

if __name__ == '__main__':
    create_test_data()
