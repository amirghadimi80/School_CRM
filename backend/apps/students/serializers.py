"""
Student serializers.
"""
from rest_framework import serializers
from apps.users.serializers import UserSerializer, UserProfileSerializer
from .models import Student, StudentDocument, StudentEnrollment


class StudentDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for StudentDocument model.
    """
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentDocument
        fields = [
            'id', 'title', 'document_type', 'file', 'file_url',
            'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class StudentListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for student lists.
    """
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    avatar = serializers.CharField(source='user.avatar', read_only=True)
    class_name = serializers.CharField(source='current_class.name', read_only=True)
    attendance_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = Student
        fields = [
            'id', 'student_code', 'full_name', 'email', 'phone', 'avatar',
            'grade_level', 'class_name', 'status', 'enrollment_date',
            'attendance_rate'
        ]


class StudentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for student profile.
    """
    user = UserSerializer(read_only=True)
    profile = UserProfileSerializer(source='user.profile', read_only=True)
    documents = StudentDocumentSerializer(many=True, read_only=True)
    class_name = serializers.CharField(source='current_class.name', read_only=True)
    attendance_rate = serializers.ReadOnlyField()
    gpa = serializers.ReadOnlyField()
    
    class Meta:
        model = Student
        fields = [
            'id', 'user', 'profile', 'student_code',
            'enrollment_date', 'grade_level', 'current_class', 'class_name',
            'status', 'guardian_name', 'guardian_phone', 'guardian_relationship',
            'previous_school', 'allergies', 'notes',
            'documents', 'attendance_rate', 'gpa',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StudentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new students.
    """
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Student
        fields = [
            'student_code', 'first_name', 'last_name', 'email', 'phone',
            'enrollment_date', 'grade_level', 'current_class',
            'guardian_name', 'guardian_phone', 'guardian_relationship',
            'previous_school', 'allergies', 'notes'
        ]
    
    def create(self, validated_data):
        from apps.users.models import User
        from apps.common.middleware.tenant import get_current_tenant
        
        # Extract user data
        user_data = {
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'email': validated_data.pop('email'),
            'phone': validated_data.pop('phone', ''),
            'role': User.ROLE_STUDENT,
        }
        
        # Get school from context
        school = get_current_tenant()
        if school:
            user_data['school'] = school
        
        # Create user
        password = user_data['email'].split('@')[0] + "123"  # Temporary password
        user = User.objects.create_user(**user_data, password=password)
        
        # Create student profile
        student = Student.objects.create(user=user, school=school, **validated_data)
        
        return student


class StudentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating student information.
    """
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    phone = serializers.CharField(source='user.phone', required=False)
    
    class Meta:
        model = Student
        fields = [
            'student_code', 'first_name', 'last_name', 'email', 'phone',
            'grade_level', 'current_class', 'status',
            'guardian_name', 'guardian_phone', 'guardian_relationship',
            'previous_school', 'allergies', 'notes'
        ]
    
    def update(self, instance, validated_data):
        # Update user data if provided
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        # Update student data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance


class StudentBulkUploadSerializer(serializers.Serializer):
    """
    Serializer for bulk student upload.
    """
    file = serializers.FileField(
        help_text="CSV or Excel file with student data"
    )
    grade_level = serializers.CharField(required=False)
    send_welcome_email = serializers.BooleanField(default=False)


class StudentEnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for StudentEnrollment model.
    """
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
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'enrollment_date', 'created_at', 'updated_at']
