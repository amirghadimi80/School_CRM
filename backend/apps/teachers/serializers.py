"""
Teacher serializers.
"""
from django.db import transaction
from rest_framework import serializers
from apps.users.models import User, UserProfile
from .models import Teacher, TeacherAssignment


class TeacherListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)

    class Meta:
        model = Teacher
        fields = [
            'id', 'employee_id', 'full_name', 'email',
            'specialization', 'status',
        ]


class TeacherCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(min_length=6, write_only=True)
    employee_id = serializers.CharField(max_length=50)
    specialization = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('این ایمیل قبلاً ثبت شده است.')
        return value

    def validate_employee_id(self, value):
        school = self.context.get('school')
        if school and Teacher.objects.filter(school=school, employee_id=value).exists():
            raise serializers.ValidationError('این کد پرسنلی در مدرسه تکراری است.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        school = self.context['school']
        if not school:
            raise serializers.ValidationError('مدرسه فعال یافت نشد.')

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('phone', ''),
            role=User.ROLE_TEACHER,
            school=school,
        )
        UserProfile.objects.create(user=user)

        return Teacher.objects.create(
            user=user,
            school=school,
            employee_id=validated_data['employee_id'],
            specialization=validated_data.get('specialization', ''),
            status=Teacher.STATUS_ACTIVE,
        )


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    class_name = serializers.CharField(source='class_assigned.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = TeacherAssignment
        fields = [
            'id', 'teacher', 'teacher_name', 'class_assigned', 'class_name',
            'course', 'course_name', 'academic_year', 'is_primary_teacher',
        ]
        read_only_fields = ['id']


class ClassAssignmentItemSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    course_name = serializers.CharField(read_only=True)
    course_code = serializers.CharField(read_only=True, required=False)
    weekly_hours = serializers.IntegerField(read_only=True)
    teacher_id = serializers.IntegerField(allow_null=True, required=False)
    teacher_name = serializers.CharField(read_only=True, allow_null=True, required=False)
    is_assigned = serializers.BooleanField(read_only=True)


class BulkTeacherAssignmentSerializer(serializers.Serializer):
    class_id = serializers.IntegerField()
    academic_year = serializers.CharField(max_length=20)
    assignments = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False,
    )

    def validate_assignments(self, value):
        for item in value:
            if 'course_id' not in item or 'teacher_id' not in item:
                raise serializers.ValidationError(
                    'هر آیتم باید course_id و teacher_id داشته باشد.'
                )
        return value
