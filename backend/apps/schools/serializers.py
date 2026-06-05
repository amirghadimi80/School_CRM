"""
School serializers for API responses.
"""
from rest_framework import serializers
from .models import (
    School, AcademicYear, Term,
    Period, Curriculum, TeacherAvailability,
    TeacherSpecialization, GeneratedSchedule
)


class SchoolSerializer(serializers.ModelSerializer):
    """
    Serializer for School model.
    """
    settings = serializers.JSONField(required=False)
    full_settings = serializers.ReadOnlyField()
    
    class Meta:
        model = School
        fields = [
            'id', 'name', 'slug', 'logo', 'primary_color', 'secondary_color',
            'phone', 'email', 'website', 'address',
            'current_academic_year', 'grading_system', 'education_level',
            'periods_per_day', 'period_duration_minutes', 'school_start_time', 'max_class_capacity',
            'settings', 'full_settings',
            'is_active', 'is_verified', 'plan',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']


class SchoolListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for school lists.
    """
    class Meta:
        model = School
        fields = ['id', 'name', 'slug', 'logo', 'primary_color', 'is_active']


class SchoolCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new schools.
    """
    class Meta:
        model = School
        fields = ['name', 'slug', 'email', 'phone', 'address', 'plan']
        extra_kwargs = {
            'slug': {'required': True},
        }


class AcademicYearSerializer(serializers.ModelSerializer):
    """
    Serializer for AcademicYear model.
    """
    school_name = serializers.CharField(source='school.name', read_only=True)
    
    class Meta:
        model = AcademicYear
        fields = [
            'id', 'school', 'school_name', 'name',
            'start_date', 'end_date',
            'is_current', 'is_active', 'is_visible',
        ]
        # Academic years are defined by super admins via the Django admin.
        # School admins may only read them and pick the current one.
        read_only_fields = [
            'id', 'school', 'name', 'start_date', 'end_date',
            'is_active', 'is_visible',
        ]


class TermSerializer(serializers.ModelSerializer):
    """
    Serializer for Term model.
    """
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    
    class Meta:
        model = Term
        fields = [
            'id', 'academic_year', 'academic_year_name',
            'name', 'start_date', 'end_date', 'is_current',
        ]
        read_only_fields = ['id']


class SchoolSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for updating school settings only.
    """
    class Meta:
        model = School
        fields = ['primary_color', 'secondary_color', 'settings', 'education_level',
                  'periods_per_day', 'period_duration_minutes', 'school_start_time', 'max_class_capacity']


class PeriodSerializer(serializers.ModelSerializer):
    """
    Serializer for Period model.
    """
    school_name = serializers.CharField(source='school.name', read_only=True)
    
    class Meta:
        model = Period
        fields = ['id', 'school', 'school_name', 'period_number', 'start_time', 'end_time']
        read_only_fields = ['id']


class CurriculumSerializer(serializers.ModelSerializer):
    """
    Serializer for Curriculum model.
    """
    school_name = serializers.CharField(source='school.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    
    class Meta:
        model = Curriculum
        fields = ['id', 'school', 'school_name', 'grade_level', 'branch', 
                  'course', 'course_name', 'course_code', 
                  'weekly_hours', 'is_specialized']
        read_only_fields = ['id']


class TeacherAvailabilitySerializer(serializers.ModelSerializer):
    """
    Serializer for TeacherAvailability model.
    """
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = TeacherAvailability
        fields = ['id', 'teacher', 'teacher_name', 'day_of_week', 'day_name', 'periods']
        read_only_fields = ['id']


class TeacherSpecializationSerializer(serializers.ModelSerializer):
    """
    Serializer for TeacherSpecialization model.
    """
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = TeacherSpecialization
        fields = ['id', 'teacher', 'teacher_name', 'course', 'course_name', 'grade_levels']
        read_only_fields = ['id']


class GeneratedScheduleSerializer(serializers.ModelSerializer):
    """
    Serializer for GeneratedSchedule model.
    """
    class_name = serializers.CharField(source='class_assigned.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    period_number = serializers.IntegerField(source='period.period_number', read_only=True)
    
    class Meta:
        model = GeneratedSchedule
        fields = ['id', 'class_assigned', 'class_name', 'course', 'course_name',
                  'teacher', 'teacher_name', 'day_of_week', 'day_name',
                  'period', 'period_number', 'academic_year', 'is_active']
        read_only_fields = ['id']
