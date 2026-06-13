"""
Student serializers.
"""
from rest_framework import serializers
from apps.users.serializers import UserSerializer, UserProfileSerializer
from apps.users.models import UserProfile
from .models import Student, StudentDocument, StudentEnrollment
from .services.registration import (
    validate_national_id,
    create_student_account,
    is_profile_complete,
)


class StudentDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = StudentDocument
        fields = [
            'id', 'student', 'title', 'document_type', 'file', 'file_url',
            'description', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class StudentListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    national_id = serializers.SerializerMethodField()
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    class_name = serializers.CharField(source='current_class.name', read_only=True, allow_null=True)
    attendance_rate = serializers.ReadOnlyField()

    def get_national_id(self, obj):
        profile = getattr(obj.user, 'profile', None)
        return profile.national_id if profile else None

    class Meta:
        model = Student
        fields = [
            'id', 'student_code', 'full_name', 'email', 'phone', 'national_id',
            'avatar', 'grade_level', 'class_name', 'status', 'enrollment_date',
            'profile_completed', 'attendance_rate',
        ]


class StudentDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile = UserProfileSerializer(source='user.profile', read_only=True)
    documents = StudentDocumentSerializer(many=True, read_only=True)
    class_name = serializers.CharField(source='current_class.name', read_only=True, allow_null=True)
    attendance_rate = serializers.ReadOnlyField()
    gpa = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'profile', 'student_code',
            'enrollment_date', 'grade_level', 'current_class', 'class_name',
            'status', 'guardian_name', 'guardian_phone', 'guardian_relationship',
            'father_phone', 'mother_phone', 'profile_completed',
            'previous_school', 'allergies', 'notes',
            'documents', 'attendance_rate', 'gpa',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StudentCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    national_id = serializers.CharField(max_length=20)
    birth_date = serializers.DateField(required=False, allow_null=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    father_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    mother_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    grade_level = serializers.CharField(max_length=20, required=False, allow_blank=True)
    current_class = serializers.IntegerField(required=False, allow_null=True)
    enrollment_date = serializers.DateField(required=False, allow_null=True)
    guardian_name = serializers.CharField(required=False, allow_blank=True)
    guardian_phone = serializers.CharField(required=False, allow_blank=True)
    guardian_relationship = serializers.CharField(required=False, allow_blank=True)
    previous_school = serializers.CharField(required=False, allow_blank=True)
    allergies = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_national_id(self, value):
        value = validate_national_id(value)
        if UserProfile.objects.filter(national_id=value).exists():
            raise serializers.ValidationError('این کد ملی قبلاً ثبت شده است.')
        school = self.context.get('school')
        if school and Student.objects.filter(school=school, student_code=value).exists():
            raise serializers.ValidationError('این کد در مدرسه تکراری است.')
        return value

    def create(self, validated_data):
        school = self.context.get('school')
        if not school:
            raise serializers.ValidationError('مدرسه فعال یافت نشد.')

        class_id = validated_data.pop('current_class', None)
        if class_id is not None:
            validated_data['current_class_id'] = class_id

        return create_student_account(school=school, validated_data=validated_data)


class StudentUpdateSerializer(serializers.ModelSerializer):
    birth_date = serializers.DateField(required=False, allow_null=True)
    phone = serializers.CharField(source='user.phone', required=False, allow_blank=True)

    class Meta:
        model = Student
        fields = [
            'grade_level', 'current_class', 'status',
            'guardian_name', 'guardian_phone', 'guardian_relationship',
            'father_phone', 'mother_phone',
            'previous_school', 'allergies', 'notes',
            'birth_date', 'phone',
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        birth_date = validated_data.pop('birth_date', None)

        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        if birth_date is not None and hasattr(instance.user, 'profile'):
            profile = instance.user.profile
            profile.birth_date = birth_date
            profile.save(update_fields=['birth_date'])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        profile = getattr(instance.user, 'profile', None)
        instance.profile_completed = is_profile_complete(
            phone=instance.user.phone,
            birth_date=profile.birth_date if profile else None,
            father_phone=instance.father_phone,
            mother_phone=instance.mother_phone,
            grade_level=instance.grade_level,
        )
        instance.save()
        return instance


class StudentBulkUploadSerializer(serializers.Serializer):
    file = serializers.FileField(help_text="CSV or Excel file with student data")
    grade_level = serializers.CharField(required=False)
    send_welcome_email = serializers.BooleanField(default=False)


class StudentEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_code = serializers.CharField(source='student.student_code', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    class_name = serializers.CharField(source='class_assigned.name', read_only=True)

    class Meta:
        model = StudentEnrollment
        fields = [
            'id', 'student', 'student_name', 'student_code',
            'academic_year', 'academic_year_name',
            'class_assigned', 'class_name',
            'status', 'enrollment_date', 'is_rollover',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'enrollment_date', 'created_at', 'updated_at']
