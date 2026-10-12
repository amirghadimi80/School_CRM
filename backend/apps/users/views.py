"""
User API views.
"""
import logging
import re

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from apps.common.permissions import IsSchoolAdmin, IsOwnerOrAdmin
from apps.common.middleware.tenant import get_current_tenant
from .models import User, UserProfile
from apps.students.services.registration import student_internal_email
from .serializers import (
    UserSerializer, UserCreateSerializer, UserListSerializer,
    LoginSerializer, PasswordChangeSerializer,
    UserSelfUpdateSerializer,
)

logger = logging.getLogger(__name__)

# Roles a visitor may claim on the public register endpoint.
PUBLIC_REGISTRATION_ROLES = {
    User.ROLE_STUDENT,
    User.ROLE_TEACHER,
    User.ROLE_PARENT,
}


class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet for authentication operations.
    """
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """User login with email or national ID (students only)."""
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data['email'].strip()
        password = serializer.validated_data['password']

        if re.match(r'^\d{10}$', identifier):
            email = student_internal_email(identifier)
        else:
            email = identifier

        user = authenticate(request, email=email, password=password)

        if not user:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if re.match(r'^\d{10}$', identifier) and user.role != User.ROLE_STUDENT:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {'detail': 'Account is deactivated'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })
    
    @action(detail=False, methods=['post'])
    def refresh(self, request):
        """Rotate the refresh token and reject deactivated accounts."""
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            user = User.objects.with_inactive().get(id=token['user_id'])
        except (TokenError, User.DoesNotExist):
            return Response(
                {'detail': 'Invalid refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'detail': 'Account is deactivated'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            return Response(
                {'detail': 'Invalid refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        data = serializer.validated_data
        return Response({
            'access': data['access'],
            'refresh': data.get('refresh', refresh_token),
            'user': UserSerializer(user).data,
        })
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        """Logout user by blacklisting refresh token."""
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'detail': 'Successfully logged out'})
        except Exception:
            return Response({'detail': 'Successfully logged out'})
    
    @action(detail=False, methods=['get', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get or update current user info."""
        if request.method == 'GET':
            serializer = UserSerializer(request.user)
            return Response(serializer.data)

        serializer = UserSelfUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data)

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated],
        url_path='me/upload_avatar',
    )
    def upload_avatar(self, request):
        """Upload current user's avatar."""
        avatar = request.FILES.get('avatar')
        if not avatar:
            return Response(
                {'detail': 'avatar is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        user.avatar = avatar
        user.save(update_fields=['avatar'])
        return Response(UserSerializer(user).data)

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated],
        url_path='me/change_password',
    )
    def change_password(self, request):
        """Change current user's password."""
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'Incorrect password'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'detail': 'Password changed successfully'})
    
    def _create_role_profile(self, user, role, school):
        """Create the tenant-scoped profile. School is required by these models."""
        if role == User.ROLE_TEACHER:
            from apps.teachers.models import Teacher
            Teacher.objects.create(
                user=user,
                school=school,
                employee_id=f"TCH{user.id:05d}",
                specialization='عمومی',
                status=Teacher.STATUS_ACTIVE,
            )
        elif role == User.ROLE_STUDENT:
            from apps.students.models import Student
            Student.objects.create(
                user=user,
                school=school,
                student_code=f"STD{user.id:05d}",
                grade_level='۱',
                status=Student.STATUS_ACTIVE,
            )
        elif role == User.ROLE_PARENT:
            from apps.students.models import Parent
            Parent.objects.create(user=user, school=school)

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new user. Privileged roles cannot be self-assigned."""
        data = request.data

        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not str(data.get(field) or '').strip():
                return Response(
                    {'detail': f'{field} is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        email = str(data['email']).strip()
        if User.objects.with_inactive().filter(email__iexact=email).exists():
            return Response(
                {'detail': 'User with this email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_role = data.get('role') or User.ROLE_STUDENT
        if user_role not in PUBLIC_REGISTRATION_ROLES:
            return Response(
                {'detail': 'This role cannot be self-registered.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(data['password'])
        except DjangoValidationError as exc:
            return Response(
                {'detail': exc.messages[0]},
                status=status.HTTP_400_BAD_REQUEST
            )

        school = None
        school_id = data.get('school') or data.get('school_id')
        if school_id:
            from apps.schools.models import School
            school = School.objects.filter(id=school_id, is_active=True).first()
            if school is None:
                return Response(
                    {'detail': 'School not found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    email=email,
                    password=data['password'],
                    first_name=data.get('first_name', ''),
                    last_name=data.get('last_name', ''),
                    phone=data.get('phone', '') or '',
                    role=user_role,
                    is_active=True,
                    school=school,
                )
                UserProfile.objects.create(user=user)
                if school is not None:
                    self._create_role_profile(user, user_role, school)
                refresh = RefreshToken.for_user(user)
        except Exception:
            logger.exception('Registration failed for %s', email)
            return Response(
                {'detail': 'Registration failed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        user = self.request.user
        
        # Super admins see all users
        if user.is_super_admin:
            return User.objects.all()
        
        # School members see only their school users
        tenant = get_current_tenant()
        if tenant and user.school_id == tenant.id and user.is_school_admin:
            return User.objects.filter(school=tenant)
        
        # Regular users see only themselves
        return User.objects.filter(id=user.id)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsSchoolAdmin()]
        if self.action in ['update', 'partial_update']:
            return [IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Set school automatically. Only super admins may create a super admin."""
        role = serializer.validated_data.get('role', User.ROLE_STUDENT)
        if role == User.ROLE_SUPER_ADMIN and not self.request.user.is_super_admin:
            raise ValidationError({'role': 'You cannot assign this role.'})
        tenant = get_current_tenant()
        if role == User.ROLE_SUPER_ADMIN:
            serializer.save(school=None)
        else:
            serializer.save(school=tenant)
    
    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrAdmin])
    def change_password(self, request, id=None):
        """Change user password."""
        user = self.get_object()
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'Incorrect password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'detail': 'Password changed successfully'})
    
    @action(detail=False, methods=['get'])
    def by_role(self, request):
        """Get users filtered by role."""
        role = request.query_params.get('role')
        tenant = get_current_tenant()
        
        queryset = self.get_queryset()
        if role:
            queryset = queryset.filter(role=role)
        if tenant and not request.user.is_super_admin:
            queryset = queryset.filter(school=tenant)
        
        serializer = UserListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsSchoolAdmin])
    def activate(self, request, id=None):
        """Activate/deactivate user."""
        user = self.get_object()
        user.is_active = request.data.get('is_active', True)
        user.save(update_fields=['is_active'])
        return Response({
            'detail': f"User {'activated' if user.is_active else 'deactivated'} successfully",
            'is_active': user.is_active
        })
