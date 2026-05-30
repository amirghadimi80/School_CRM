"""
Teacher models.
"""
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel


class Teacher(BaseModel):
    """
    Teacher model extending the base user profile.
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='teacher_profile',
        verbose_name=_('User Account')
    )
    
    # Teacher specific info
    employee_id = models.CharField(
        max_length=50,
        verbose_name=_('Employee ID'),
        db_index=True,
        help_text=_('Unique ID for this teacher within the school')
    )
    
    # Qualifications
    qualifications = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Qualifications'),
        help_text=_('List of degrees and certifications')
    )
    specialization = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Specialization'),
        help_text=_('e.g., Mathematics, Physics, English')
    )
    
    # Employment
    hire_date = models.DateField(
        null=True,
        blank=True,
        verbose_name=_('Hire Date')
    )
    salary_base = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_('Base Salary (Toman)')
    )
    
    # Status
    STATUS_ACTIVE = 'active'
    STATUS_ON_LEAVE = 'on_leave'
    STATUS_SUSPENDED = 'suspended'
    STATUS_TERMINATED = 'terminated'
    
    STATUS_CHOICES = [
        (STATUS_ACTIVE, _('Active')),
        (STATUS_ON_LEAVE, _('On Leave')),
        (STATUS_SUSPENDED, _('Suspended')),
        (STATUS_TERMINATED, _('Terminated')),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        verbose_name=_('Status')
    )
    
    # Work schedule
    max_classes_per_day = models.PositiveSmallIntegerField(
        default=6,
        verbose_name=_('Max Classes Per Day')
    )
    working_hours = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Working Hours'),
        help_text=_('Schedule preferences and constraints')
    )
    
    # Additional info
    bio = models.TextField(
        blank=True,
        verbose_name=_('Biography')
    )
    notes = models.TextField(
        blank=True,
        verbose_name=_('Additional Notes')
    )
    
    class Meta:
        verbose_name = _('Teacher')
        verbose_name_plural = _('Teachers')
        ordering = ['-created_at']
        unique_together = ['school', 'employee_id']
        indexes = [
            models.Index(fields=['school', 'employee_id']),
            models.Index(fields=['school', 'status']),
            models.Index(fields=['specialization']),
        ]
    
    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name()}"
    
    @property
    def full_name(self):
        return self.user.get_full_name()
    
    @property
    def email(self):
        return self.user.email
    
    @property
    def phone(self):
        return self.user.phone
    
    @property
    def current_classes(self):
        """Get classes currently assigned to this teacher."""
        return self.classes.filter(is_active=True)
    
    @property
    def student_count(self):
        """Count students in teacher's classes."""
        from apps.students.models import Student
        class_ids = self.current_classes.values_list('id', flat=True)
        return Student.objects.filter(current_class__in=class_ids, status=Student.STATUS_ACTIVE).count()


class TeacherAssignment(BaseModel):
    """
    Teacher assignments to courses within classes.
    """
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.CASCADE,
        related_name='assignments',
        verbose_name=_('Teacher')
    )
    class_assigned = models.ForeignKey(
        'classes.Class',
        on_delete=models.CASCADE,
        related_name='teacher_assignments',
        verbose_name=_('Class')
    )
    course = models.ForeignKey(
        'classes.Course',
        on_delete=models.CASCADE,
        related_name='teacher_assignments',
        verbose_name=_('Course')
    )
    academic_year = models.CharField(
        max_length=20,
        verbose_name=_('Academic Year')
    )
    is_primary_teacher = models.BooleanField(
        default=False,
        verbose_name=_('Is Primary Teacher'),
        help_text=_('Primary teacher is the homeroom/main teacher for this class')
    )
    
    class Meta:
        verbose_name = _('Teacher Assignment')
        verbose_name_plural = _('Teacher Assignments')
        unique_together = ['teacher', 'class_assigned', 'course', 'academic_year']
        indexes = [
            models.Index(fields=['teacher', 'academic_year']),
            models.Index(fields=['class_assigned', 'course']),
        ]
    
    def __str__(self):
        return f"{self.teacher} - {self.course} ({self.class_assigned})"
    
    @property
    def school(self):
        return self.teacher.school
