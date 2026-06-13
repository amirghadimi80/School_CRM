"""
Class and Course serializers.
"""
from rest_framework import serializers
from .models import Class, Course


class CourseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'code', 'name', 'category']


class ClassSerializer(serializers.ModelSerializer):
    student_count = serializers.IntegerField(read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    homeroom_teacher_name = serializers.CharField(
        source='homeroom_teacher.full_name', read_only=True, default=None
    )
    branch_display = serializers.CharField(source='get_branch_display', read_only=True)

    class Meta:
        model = Class
        fields = [
            'id', 'name', 'grade_level', 'branch', 'branch_display',
            'room_number', 'capacity', 'homeroom_teacher', 'homeroom_teacher_name',
            'academic_year', 'academic_year_name', 'student_count',
            'is_active', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        grade_level = attrs.get('grade_level') or getattr(self.instance, 'grade_level', None)
        branch = attrs.get('branch', getattr(self.instance, 'branch', None))

        if grade_level and int(grade_level) >= 10 and not branch:
            raise serializers.ValidationError({
                'branch': 'رشته برای پایه‌های ۱۰ تا ۱۲ الزامی است.'
            })
        if grade_level and int(grade_level) < 10:
            attrs['branch'] = None

        return attrs

    def create(self, validated_data):
        from apps.common.middleware.tenant import get_current_tenant
        school = get_current_tenant()
        if school and not validated_data.get('school'):
            validated_data['school'] = school
        return super().create(validated_data)


class ClassListSerializer(serializers.ModelSerializer):
    student_count = serializers.IntegerField(read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    branch_display = serializers.CharField(source='get_branch_display', read_only=True)

    class Meta:
        model = Class
        fields = [
            'id', 'name', 'grade_level', 'branch', 'branch_display',
            'room_number', 'capacity', 'academic_year', 'academic_year_name',
            'student_count', 'is_active',
        ]
