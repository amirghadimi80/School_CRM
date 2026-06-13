"""
Student registration helpers.
"""
import random
import re

from django.db import transaction
from rest_framework import serializers

from apps.users.models import User, UserProfile


def validate_national_id(value: str) -> str:
    """Validate Iranian national ID or generated 10-digit code (starts with 9)."""
    value = value.strip()
    if not re.match(r'^\d{10}$', value):
        raise serializers.ValidationError('کد ملی باید ۱۰ رقم باشد.')

    if value.startswith('9'):
        return value

    check_digit = int(value[9])
    total = sum(int(value[i]) * (10 - i) for i in range(9))
    remainder = total % 11
    expected = remainder if remainder < 2 else 11 - remainder
    if check_digit != expected:
        raise serializers.ValidationError('کد ملی نامعتبر است.')
    return value


def student_internal_email(national_id: str) -> str:
    return f'{national_id}@student.sepaad.local'


def is_profile_complete(*, phone='', birth_date=None, father_phone='', mother_phone='', grade_level='') -> bool:
    return bool(phone and birth_date and father_phone and mother_phone and grade_level)


def generate_unique_national_id(school=None) -> str:
    """Generate a unique 10-digit code starting with 9."""
    from apps.students.models import Student

    for _ in range(100):
        candidate = '9' + ''.join(str(random.randint(0, 9)) for _ in range(9))
        if UserProfile.objects.filter(national_id=candidate).exists():
            continue
        if school and Student.objects.filter(school=school, student_code=candidate).exists():
            continue
        return candidate
    raise serializers.ValidationError('تولید کد یکتا ناموفق بود. دوباره تلاش کنید.')


@transaction.atomic
def create_student_account(*, school, validated_data):
    """Create User, UserProfile, and Student from validated registration data."""
    from apps.students.models import Student

    national_id = validated_data.pop('national_id')
    first_name = validated_data.pop('first_name')
    last_name = validated_data.pop('last_name')
    birth_date = validated_data.pop('birth_date', None)
    phone = validated_data.pop('phone', '')

    email = student_internal_email(national_id)
    if User.objects.filter(email=email).exists():
        raise serializers.ValidationError({'national_id': 'این کد ملی قبلاً ثبت شده است.'})

    user = User.objects.create_user(
        email=email,
        password=national_id,
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        role=User.ROLE_STUDENT,
        school=school,
    )
    UserProfile.objects.create(
        user=user,
        national_id=national_id,
        birth_date=birth_date,
    )

    student = Student.objects.create(
        user=user,
        school=school,
        student_code=national_id,
        profile_completed=is_profile_complete(
            phone=phone,
            birth_date=birth_date,
            father_phone=validated_data.get('father_phone', ''),
            mother_phone=validated_data.get('mother_phone', ''),
            grade_level=validated_data.get('grade_level', ''),
        ),
        **validated_data,
    )
    return student
