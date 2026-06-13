"""
Student models.
"""
from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel


class Parent(BaseModel):
    """
    Parent model connecting a user with the 'parent' role to one or more students.
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='parent_profile',
        verbose_name=_('User Account'),
        limit_choices_to={'role': 'parent'}
    )
    children = models.ManyToManyField(
        'Student',
        related_name='parents',
        verbose_name=_('Children')
    )

    class Meta:
        verbose_name = _('Parent')
        verbose_name_plural = _('Parents')
        ordering = ['-created_at']

    def __str__(self):
        return f"Parent: {self.user.get_full_name()}"


class Student(BaseModel):
    """
    Student model extending the base user profile.
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='student_profile',
        verbose_name=_('User Account')
    )
    
    # Student specific info
    student_code = models.CharField(
        max_length=50,
        verbose_name=_('Student Code'),
        db_index=True,
        help_text=_('Unique code for this student within the school')
    )
    
    # Academic info
    enrollment_date = models.DateField(
        null=True,
        blank=True,
        verbose_name=_('Enrollment Date')
    )
    grade_level = models.CharField(
        max_length=20,
        blank=True,
        default='',
        verbose_name=_('Grade Level'),
        help_text=_('e.g., 10, 11, 12 for high school')
    )
    current_class = models.ForeignKey(
        'classes.Class',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        verbose_name=_('Current Class')
    )
    
    # Status
    STATUS_ACTIVE = 'active'
    STATUS_GRADUATED = 'graduated'
    STATUS_SUSPENDED = 'suspended'
    STATUS_TRANSFERRED = 'transferred'
    STATUS_DROPPED = 'dropped'
    
    STATUS_CHOICES = [
        (STATUS_ACTIVE, _('Active')),
        (STATUS_GRADUATED, _('Graduated')),
        (STATUS_SUSPENDED, _('Suspended')),
        (STATUS_TRANSFERRED, _('Transferred')),
        (STATUS_DROPPED, _('Dropped')),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        verbose_name=_('Status')
    )
    
    # Guardian/Parent info
    guardian_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Guardian Name')
    )
    guardian_phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_('Guardian Phone')
    )
    guardian_relationship = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_('Guardian Relationship'),
        help_text=_('e.g., Father, Mother, Uncle')
    )
    father_phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_('Father Phone')
    )
    mother_phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_('Mother Phone')
    )
    profile_completed = models.BooleanField(
        default=False,
        verbose_name=_('Profile Completed')
    )
    
    # Additional info
    previous_school = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Previous School')
    )
    allergies = models.TextField(
        blank=True,
        verbose_name=_('Allergies / Medical Conditions')
    )
    notes = models.TextField(
        blank=True,
        verbose_name=_('Additional Notes')
    )
    
    class Meta:
        verbose_name = _('Student')
        verbose_name_plural = _('Students')
        ordering = ['-created_at']
        unique_together = ['school', 'student_code']
        indexes = [
            models.Index(fields=['school', 'student_code']),
            models.Index(fields=['school', 'status']),
            models.Index(fields=['school', 'grade_level']),
            models.Index(fields=['current_class']),
        ]
    
    def __str__(self):
        return f"{self.student_code} - {self.user.get_full_name()}"
    
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
    def attendance_rate(self):
        """Calculate attendance rate for this student."""
        from apps.attendance.models import Attendance
        total = Attendance.objects.filter(student=self).count()
        if total == 0:
            return 100.0
        present = Attendance.objects.filter(student=self, status=Attendance.STATUS_PRESENT).count()
        return round((present / total) * 100, 2)
    
    @property
    def gpa(self):
        """Calculate GPA from grades."""
        from apps.grades.models import Grade
        grades = Grade.objects.filter(student=self)
        if not grades.exists():
            return None
        return round(grades.aggregate(models.Avg('score'))['score__avg'], 2)


class StudentDocument(BaseModel):
    """
    Documents attached to a student (transcripts, certificates, etc.).
    """
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name=_('Student')
    )
    
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    document_type = models.CharField(
        max_length=50,
        choices=[
            ('transcript', _('Transcript')),
            ('certificate', _('Certificate')),
            ('medical', _('Medical Record')),
            ('photo', _('Photo')),
            ('id_card', _('ID Card')),
            ('registration', _('Registration')),
            ('other', _('Other')),
        ],
        verbose_name=_('Document Type')
    )
    file = models.FileField(
        upload_to='students/documents/%Y/%m/',
        verbose_name=_('File')
    )
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    class Meta:
        verbose_name = _('Student Document')
        verbose_name_plural = _('Student Documents')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.student.student_code}"


class StudentEnrollment(BaseModel):
    """
    Links students to academic years and their classes.
    A student can have different enrollments for different years.
    """
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name=_('Student')
    )

    academic_year = models.ForeignKey(
        'schools.AcademicYear',
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name=_('Academic Year')
    )

    # Class assignment for this year
    class_assigned = models.ForeignKey(
        'classes.Class',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enrollments',
        verbose_name=_('Assigned Class')
    )

    # Status for this year
    STATUS_ACTIVE = 'active'
    STATUS_GRADUATED = 'graduated'
    STATUS_TRANSFERRED = 'transferred'
    STATUS_DROPPED = 'dropped'

    STATUS_CHOICES = [
        (STATUS_ACTIVE, _('Active')),
        (STATUS_GRADUATED, _('Graduated')),
        (STATUS_TRANSFERRED, _('Transferred')),
        (STATUS_DROPPED, _('Dropped')),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        verbose_name=_('Status')
    )

    # Additional info
    enrollment_date = models.DateField(
        auto_now_add=True,
        verbose_name=_('Enrollment Date')
    )

    # Track if this is a rollover from previous year
    is_rollover = models.BooleanField(
        default=False,
        verbose_name=_('Rollover from Previous Year'),
        help_text=_('Automatically enrolled from previous year')
    )

    class Meta:
        verbose_name = _('Student Enrollment')
        verbose_name_plural = _('Student Enrollments')
        unique_together = ['student', 'academic_year']
        ordering = ['-academic_year__start_date']
        indexes = [
            models.Index(fields=['student', 'academic_year']),
            models.Index(fields=['class_assigned', 'status']),
        ]

    def __str__(self):
        return f"{self.student.student_code} - {self.academic_year.name}"
