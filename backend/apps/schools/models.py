"""
School (Tenant) models for multi-tenant architecture.
"""
from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
from apps.core.models import TimestampModel, BaseModel


class School(TimestampModel):
    """
    School/Tenant model - the core of multi-tenancy.
    Each school is a separate tenant with isolated data.
    """
    
    # Basic Info
    name = models.CharField(max_length=255, verbose_name=_('School Name'))
    slug = models.SlugField(
        max_length=100, 
        unique=True,
        verbose_name=_('Slug'),
        help_text=_('Used for subdomain and URL identification')
    )
    
    # Branding
    logo = models.ImageField(
        upload_to='schools/logos/%Y/%m/',
        null=True,
        blank=True,
        verbose_name=_('Logo')
    )
    primary_color = models.CharField(
        max_length=7,
        default='#3B82F6',
        validators=[RegexValidator(
            regex='^#[0-9A-Fa-f]{6}$',
            message=_('Enter a valid hex color code (e.g., #3B82F6)')
        )],
        verbose_name=_('Primary Color')
    )
    secondary_color = models.CharField(
        max_length=7,
        default='#10B981',
        validators=[RegexValidator(
            regex='^#[0-9A-Fa-f]{6}$',
            message=_('Enter a valid hex color code')
        )],
        verbose_name=_('Secondary Color')
    )
    
    # Contact
    phone = models.CharField(max_length=20, blank=True, verbose_name=_('Phone'))
    email = models.EmailField(blank=True, verbose_name=_('Email'))
    website = models.URLField(blank=True, verbose_name=_('Website'))
    address = models.TextField(blank=True, verbose_name=_('Address'))
    
    # Academic Settings
    current_academic_year = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_('Current Academic Year'),
        help_text=_('e.g., 1403-1404')
    )
    grading_system = models.CharField(
        max_length=20,
        choices=[
            ('percentage', _('Percentage (0-100)')),
            ('gpa_4', _('GPA 4.0')),
            ('gpa_5', _('GPA 5.0')),
            ('custom', _('Custom')),
        ],
        default='percentage',
        verbose_name=_('Grading System')
    )
    
    # Education Level
    EDUCATION_LEVEL_ELEMENTARY = 'elementary'
    EDUCATION_LEVEL_MIDDLE = 'middle'
    EDUCATION_LEVEL_HIGH_SCHOOL = 'high_school'
    
    EDUCATION_LEVEL_CHOICES = [
        (EDUCATION_LEVEL_ELEMENTARY, _('Elementary (Grades 1-6)')),
        (EDUCATION_LEVEL_MIDDLE, _('Middle School (Grades 7-9)')),
        (EDUCATION_LEVEL_HIGH_SCHOOL, _('High School (Grades 10-12)')),
    ]
    
    education_level = models.CharField(
        max_length=20,
        choices=EDUCATION_LEVEL_CHOICES,
        default=EDUCATION_LEVEL_ELEMENTARY,
        verbose_name=_('Education Level')
    )
    
    # Scheduling Settings
    periods_per_day = models.PositiveSmallIntegerField(
        default=4,
        verbose_name=_('Periods Per Day'),
        help_text=_('Number of class periods per day')
    )
    period_duration_minutes = models.PositiveSmallIntegerField(
        default=45,
        verbose_name=_('Period Duration (minutes)'),
        help_text=_('Duration of each period in minutes')
    )
    school_start_time = models.TimeField(
        default='08:00',
        verbose_name=_('School Start Time')
    )
    max_class_capacity = models.PositiveSmallIntegerField(
        default=30,
        verbose_name=_('Max Class Capacity')
    )
    
    # Settings (JSON for flexibility)
    settings = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Settings'),
        help_text=_('Custom school settings and configurations')
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    is_verified = models.BooleanField(default=False, verbose_name=_('Is Verified'))
    subscription_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Subscription Expires At')
    )
    
    # Plan
    PLAN_CHOICES = [
        ('free', _('Free')),
        ('basic', _('Basic')),
        ('standard', _('Standard')),
        ('premium', _('Premium')),
        ('enterprise', _('Enterprise')),
    ]
    plan = models.CharField(
        max_length=20,
        choices=PLAN_CHOICES,
        default='free',
        verbose_name=_('Subscription Plan')
    )
    
    class Meta:
        verbose_name = _('School')
        verbose_name_plural = _('Schools')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug', 'is_active']),
            models.Index(fields=['plan', 'is_active']),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def full_settings(self):
        """Return merged default and custom settings."""
        defaults = {
            'max_students': 100 if self.plan == 'free' else 1000 if self.plan == 'basic' else 5000 if self.plan == 'standard' else 10000 if self.plan == 'premium' else 50000,
            'max_teachers': 10 if self.plan == 'free' else 50 if self.plan == 'basic' else 200 if self.plan == 'standard' else 500 if self.plan == 'premium' else 2000,
            'sms_enabled': self.plan != 'free',
            'advanced_analytics': self.plan in ['standard', 'premium', 'enterprise'],
            'api_access': self.plan in ['premium', 'enterprise'],
            'white_label': self.plan in ['premium', 'enterprise'],
        }
        defaults.update(self.settings)
        return defaults


class AcademicYear(models.Model):
    """
    Academic year configuration for each school.
    """
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='academic_years',
        verbose_name=_('School')
    )
    name = models.CharField(max_length=50, verbose_name=_('Year Name'))  # e.g., 1403-1404
    start_date = models.DateField(verbose_name=_('Start Date'))
    end_date = models.DateField(verbose_name=_('End Date'))
    is_current = models.BooleanField(default=False, verbose_name=_('Is Current'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    class Meta:
        verbose_name = _('Academic Year')
        verbose_name_plural = _('Academic Years')
        ordering = ['-start_date']
        unique_together = ['school', 'name']
        indexes = [
            models.Index(fields=['school', 'is_current']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.school.name})"
    
    def save(self, *args, **kwargs):
        # Ensure only one current academic year per school
        if self.is_current:
            AcademicYear.objects.filter(school=self.school, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class Term(models.Model):
    """
    Academic term/semester within an academic year.
    """
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='terms',
        verbose_name=_('Academic Year')
    )
    name = models.CharField(max_length=50, verbose_name=_('Term Name'))  # e.g., First Semester
    start_date = models.DateField(verbose_name=_('Start Date'))
    end_date = models.DateField(verbose_name=_('End Date'))
    is_current = models.BooleanField(default=False, verbose_name=_('Is Current'))
    
    class Meta:
        verbose_name = _('Term')
        verbose_name_plural = _('Terms')
        ordering = ['academic_year', 'start_date']
    
    def __str__(self):
        return f"{self.name} - {self.academic_year.name}"
    
    @property
    def school(self):
        return self.academic_year.school


class Period(BaseModel):
    """
    School period definition (zang-e dars).
    """
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='periods',
        verbose_name=_('School')
    )
    period_number = models.PositiveSmallIntegerField(
        verbose_name=_('Period Number'),
        help_text=_('Period number (1, 2, 3, ...)')
    )
    start_time = models.TimeField(verbose_name=_('Start Time'))
    end_time = models.TimeField(verbose_name=_('End Time'))
    
    class Meta:
        verbose_name = _('Period')
        verbose_name_plural = _('Periods')
        ordering = ['school', 'period_number']
        unique_together = ['school', 'period_number']
    
    def __str__(self):
        return f"{self.school.name} - Period {self.period_number} ({self.start_time}-{self.end_time})"


class Curriculum(BaseModel):
    """
    Official curriculum/courses for each grade level.
    """
    GRADE_CHOICES = [(str(i), _(f'Grade {i}')) for i in range(1, 13)]
    
    BRANCH_MATH = 'math'
    BRANCH_SCIENCE = 'science'
    BRANCH_HUMANITIES = 'humanities'
    
    BRANCH_CHOICES = [
        (BRANCH_MATH, _('Mathematics')),
        (BRANCH_SCIENCE, _('Science')),
        (BRANCH_HUMANITIES, _('Humanities')),
    ]
    
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='curriculum',
        verbose_name=_('School')
    )
    grade_level = models.CharField(
        max_length=2,
        choices=GRADE_CHOICES,
        verbose_name=_('Grade Level')
    )
    branch = models.CharField(
        max_length=20,
        choices=BRANCH_CHOICES,
        blank=True,
        null=True,
        verbose_name=_('Branch'),
        help_text=_('Only for high school (grades 10-12)')
    )
    course = models.ForeignKey(
        'classes.Course',
        on_delete=models.CASCADE,
        related_name='curriculum_entries',
        verbose_name=_('Course')
    )
    weekly_hours = models.PositiveSmallIntegerField(
        default=2,
        verbose_name=_('Weekly Hours'),
        help_text=_('Number of hours per week for this course')
    )
    is_specialized = models.BooleanField(
        default=False,
        verbose_name=_('Is Specialized'),
        help_text=_('Is this a specialized course for the branch?')
    )
    
    class Meta:
        verbose_name = _('Curriculum Entry')
        verbose_name_plural = _('Curriculum Entries')
        ordering = ['grade_level', 'branch', 'course__name']
        unique_together = ['school', 'grade_level', 'branch', 'course']
    
    def __str__(self):
        branch_str = f" ({self.branch})" if self.branch else ""
        return f"Grade {self.grade_level}{branch_str} - {self.course.name}"


class TeacherAvailability(BaseModel):
    """
    Teacher availability schedule - which days/periods they can teach.
    """
    DAY_CHOICES = [
        (0, _('Saturday')),
        (1, _('Sunday')),
        (2, _('Monday')),
        (3, _('Tuesday')),
        (4, _('Wednesday')),
        (5, _('Thursday')),
        (6, _('Friday')),
    ]
    
    teacher = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.CASCADE,
        related_name='availabilities',
        verbose_name=_('Teacher')
    )
    day_of_week = models.PositiveSmallIntegerField(
        choices=DAY_CHOICES,
        verbose_name=_('Day of Week')
    )
    periods = models.JSONField(
        default=list,
        verbose_name=_('Available Periods'),
        help_text=_('List of period numbers teacher is available (e.g., [1, 2, 3])')
    )
    
    class Meta:
        verbose_name = _('Teacher Availability')
        verbose_name_plural = _('Teacher Availabilities')
        ordering = ['teacher', 'day_of_week']
        unique_together = ['teacher', 'day_of_week']
        indexes = [
            models.Index(fields=['teacher', 'day_of_week']),
        ]
    
    def __str__(self):
        return f"{self.teacher} - {self.get_day_of_week_display()}"
    
    @property
    def school(self):
        return self.teacher.school


class TeacherSpecialization(BaseModel):
    """
    What courses and grade levels a teacher can teach.
    """
    teacher = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.CASCADE,
        related_name='specializations',
        verbose_name=_('Teacher')
    )
    course = models.ForeignKey(
        'classes.Course',
        on_delete=models.CASCADE,
        related_name='teacher_specializations',
        verbose_name=_('Course')
    )
    grade_levels = models.JSONField(
        default=list,
        verbose_name=_('Grade Levels'),
        help_text=_('List of grade levels teacher can teach this course (e.g., ["10", "11", "12"])')
    )
    
    class Meta:
        verbose_name = _('Teacher Specialization')
        verbose_name_plural = _('Teacher Specializations')
        unique_together = ['teacher', 'course']
        indexes = [
            models.Index(fields=['teacher', 'course']),
        ]
    
    def __str__(self):
        return f"{self.teacher} - {self.course.name}"
    
    @property
    def school(self):
        return self.teacher.school


class GeneratedSchedule(BaseModel):
    """
    Auto-generated class schedule.
    """
    DAY_CHOICES = [
        (0, _('Saturday')),
        (1, _('Sunday')),
        (2, _('Monday')),
        (3, _('Tuesday')),
        (4, _('Wednesday')),
        (5, _('Thursday')),
        (6, _('Friday')),
    ]
    
    class_assigned = models.ForeignKey(
        'classes.Class',
        on_delete=models.CASCADE,
        related_name='generated_schedules',
        verbose_name=_('Class')
    )
    course = models.ForeignKey(
        'classes.Course',
        on_delete=models.CASCADE,
        related_name='generated_schedules',
        verbose_name=_('Course')
    )
    teacher = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.CASCADE,
        related_name='generated_schedules',
        verbose_name=_('Teacher')
    )
    day_of_week = models.PositiveSmallIntegerField(
        choices=DAY_CHOICES,
        verbose_name=_('Day of Week')
    )
    period = models.ForeignKey(
        Period,
        on_delete=models.CASCADE,
        related_name='generated_schedules',
        verbose_name=_('Period')
    )
    academic_year = models.CharField(
        max_length=20,
        verbose_name=_('Academic Year')
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Is Active')
    )
    
    class Meta:
        verbose_name = _('Generated Schedule')
        verbose_name_plural = _('Generated Schedules')
        ordering = ['class_assigned', 'day_of_week', 'period__period_number']
        unique_together = ['class_assigned', 'day_of_week', 'period', 'academic_year']
        indexes = [
            models.Index(fields=['class_assigned', 'academic_year']),
            models.Index(fields=['teacher', 'day_of_week', 'period']),
            models.Index(fields=['academic_year', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.class_assigned} - {self.get_day_of_week_display()} P{self.period.period_number} - {self.course.name}"
    
    @property
    def school(self):
        return self.class_assigned.school
