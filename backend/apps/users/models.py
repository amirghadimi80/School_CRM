"""
User models with role-based access control.
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model with multi-tenant support.
    """
    
    # Role choices
    ROLE_SUPER_ADMIN = 'super_admin'
    ROLE_SCHOOL_ADMIN = 'school_admin'
    ROLE_TEACHER = 'teacher'
    ROLE_STUDENT = 'student'
    ROLE_PARENT = 'parent'
    
    ROLE_CHOICES = [
        (ROLE_SUPER_ADMIN, _('Super Admin')),
        (ROLE_SCHOOL_ADMIN, _('School Admin')),
        (ROLE_TEACHER, _('Teacher')),
        (ROLE_STUDENT, _('Student')),
        (ROLE_PARENT, _('Parent')),
    ]
    
    # Basic info
    email = models.EmailField(
        unique=True,
        verbose_name=_('Email Address')
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_('Phone Number')
    )
    
    # Profile
    first_name = models.CharField(max_length=100, verbose_name=_('First Name'))
    last_name = models.CharField(max_length=100, verbose_name=_('Last Name'))
    avatar = models.ImageField(
        upload_to='avatars/%Y/%m/',
        null=True,
        blank=True,
        verbose_name=_('Avatar')
    )
    
    # Role & Tenant
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_STUDENT,
        verbose_name=_('Role')
    )
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='users',
        verbose_name=_('School')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    is_staff = models.BooleanField(default=False, verbose_name=_('Staff Status'))
    is_verified = models.BooleanField(default=False, verbose_name=_('Verified'))
    
    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now, verbose_name=_('Date Joined'))
    last_login = models.DateTimeField(null=True, blank=True, verbose_name=_('Last Login'))
    
    # Settings
    preferred_language = models.CharField(
        max_length=10,
        default='fa',
        verbose_name=_('Preferred Language')
    )
    timezone = models.CharField(
        max_length=50,
        default='Asia/Tehran',
        verbose_name=_('Timezone')
    )
    email_notifications = models.BooleanField(default=True, verbose_name=_('Email Notifications'))
    sms_notifications = models.BooleanField(default=True, verbose_name=_('SMS Notifications'))
    
    # OTP for 2FA
    otp_secret = models.CharField(max_length=32, blank=True, verbose_name=_('OTP Secret'))
    otp_enabled = models.BooleanField(default=False, verbose_name=_('OTP Enabled'))
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email', 'is_active']),
            models.Index(fields=['school', 'role', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        return self.first_name
    
    @property
    def is_super_admin(self):
        return self.role == self.ROLE_SUPER_ADMIN or self.is_superuser
    
    @property
    def is_school_admin(self):
        return self.role in [self.ROLE_SUPER_ADMIN, self.ROLE_SCHOOL_ADMIN]
    
    @property
    def is_teacher(self):
        return self.role == self.ROLE_TEACHER
    
    @property
    def is_student_user(self):
        return self.role == self.ROLE_STUDENT
    
    @property
    def is_parent_user(self):
        return self.role == self.ROLE_PARENT
    
    def has_school_permission(self, permission_codename):
        """Check if user has a specific permission within their school."""
        if self.is_super_admin:
            return True
        # TODO: Implement school-specific permission checking
        return False


class UserProfile(models.Model):
    """
    Extended user profile information.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name=_('User')
    )
    
    # Personal Info
    national_id = models.CharField(
        max_length=20,
        blank=True,
        unique=True,
        null=True,
        verbose_name=_('National ID')
    )
    birth_date = models.DateField(
        null=True,
        blank=True,
        verbose_name=_('Birth Date')
    )
    gender = models.CharField(
        max_length=10,
        choices=[
            ('male', _('Male')),
            ('female', _('Female')),
            ('other', _('Other')),
        ],
        blank=True,
        verbose_name=_('Gender')
    )
    
    # Address
    address = models.TextField(blank=True, verbose_name=_('Address'))
    city = models.CharField(max_length=100, blank=True, verbose_name=_('City'))
    province = models.CharField(max_length=100, blank=True, verbose_name=_('Province'))
    postal_code = models.CharField(max_length=20, blank=True, verbose_name=_('Postal Code'))
    
    # Emergency Contact
    emergency_contact_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Emergency Contact Name')
    )
    emergency_contact_phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_('Emergency Contact Phone')
    )
    
    # Bio
    bio = models.TextField(blank=True, verbose_name=_('Bio'))
    
    class Meta:
        verbose_name = _('User Profile')
        verbose_name_plural = _('User Profiles')
    
    def __str__(self):
        return f"Profile: {self.user.get_full_name()}"
