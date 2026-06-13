"""
User serializers.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model.
    """
    class Meta:
        model = UserProfile
        fields = [
            'national_id', 'birth_date', 'gender',
            'address', 'city', 'province', 'postal_code',
            'emergency_contact_name', 'emergency_contact_phone', 'bio'
        ]


class UserSelfUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for users updating their own profile.
    """
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone',
            'preferred_language', 'timezone',
            'email_notifications', 'sms_notifications',
            'profile',
        ]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if profile_data:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    """
    profile = UserProfileSerializer(required=False)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'first_name', 'last_name', 'full_name',
            'avatar', 'role', 'role_display', 'school', 'school_name',
            'is_active', 'is_verified', 'date_joined', 'last_login',
            'preferred_language', 'timezone',
            'email_notifications', 'sms_notifications',
            'profile',
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_verified']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    school_name = serializers.CharField(source='school.name', read_only=True)
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        
        # Update user
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update or create profile
        if profile_data:
            profile, created = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone',
            'role', 'school'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Create empty profile
        UserProfile.objects.create(user=user)
        return user


class UserListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for user lists.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'role_display', 'avatar', 'is_active']


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords don't match"})
        return attrs


class LoginSerializer(serializers.Serializer):
    """
    Serializer for login (email or 10-digit national ID for students).
    """
    email = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    school_id = serializers.UUIDField(required=False, allow_null=True)


class TokenResponseSerializer(serializers.Serializer):
    """
    Serializer for token response.
    """
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()
