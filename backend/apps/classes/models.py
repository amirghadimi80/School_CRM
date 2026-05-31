"""
Class and Course models.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel


class CourseManager(models.Manager):
    """Custom manager for Course model."""
    
    def for_school(self, school):
        """Get all courses available to a school (global + school-specific)."""
        from django.db.models import Q
        return self.filter(
            Q(school__isnull=True) | Q(school=school),
            is_active=True
        )


class Course(BaseModel):
    """
    Course/Subject model.
    Global courses (school=null) are available to all schools.
    School-specific courses are only available to that school.
    """
    
    objects = CourseManager()
    
    # Override school field to allow null (for global courses)
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='courses',
        verbose_name=_('School'),
        null=True,
        blank=True,
        db_index=True,
    )
    
    code = models.CharField(
        max_length=20,
        verbose_name=_('Course Code')
    )
    name = models.CharField(
        max_length=255,
        verbose_name=_('Course Name')
    )
    description = models.TextField(
        blank=True,
        verbose_name=_('Description')
    )
    credits = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name=_('Credits')
    )
    
    # Category
    CATEGORY_GENERAL = 'general'
    CATEGORY_SCIENCE = 'science'
    CATEGORY_MATH = 'math'
    CATEGORY_LANGUAGE = 'language'
    CATEGORY_ARTS = 'arts'
    CATEGORY_SPORTS = 'sports'
    CATEGORY_TECH = 'technology'
    CATEGORY_RELIGION = 'religion'
    
    CATEGORY_CHOICES = [
        (CATEGORY_GENERAL, _('General')),
        (CATEGORY_SCIENCE, _('Science')),
        (CATEGORY_MATH, _('Mathematics')),
        (CATEGORY_LANGUAGE, _('Language')),
        (CATEGORY_ARTS, _('Arts')),
        (CATEGORY_SPORTS, _('Sports')),
        (CATEGORY_TECH, _('Technology')),
        (CATEGORY_RELIGION, _('Religion')),
    ]
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default=CATEGORY_GENERAL,
        verbose_name=_('Category')
    )
    
    # Grade levels this course applies to
    applicable_grades = models.JSONField(
        default=list,
        verbose_name=_('Applicable Grades'),
        help_text=_('List of grade levels (e.g., ["10", "11", "12"])')
    )
    
    # Global flag - if True, available to all schools
    is_global = models.BooleanField(
        default=False,
        verbose_name=_('Is Global'),
        help_text=_('If checked, this course is available to all schools')
    )
    
    # Settings
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Is Active')
    )
    passing_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10.0,
        verbose_name=_('Passing Score')
    )
    max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=20.0,
        verbose_name=_('Maximum Score')
    )
    
    class Meta:
        verbose_name = _('Course')
        verbose_name_plural = _('Courses')
        ordering = ['category', 'name']
        # Allow same code for global and school-specific courses
        # But prevent duplicate codes within same school or multiple globals
        constraints = [
            models.UniqueConstraint(
                fields=['code'],
                condition=models.Q(school__isnull=True),
                name='unique_global_course_code'
            ),
            models.UniqueConstraint(
                fields=['school', 'code'],
                name='unique_school_course_code'
            ),
        ]
        indexes = [
            models.Index(fields=['school', 'code']),
            models.Index(fields=['school', 'category']),
            models.Index(fields=['school', 'is_active']),
            models.Index(fields=['is_global', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Class(BaseModel):
    """
    Class/Classroom model (e.g., "10-A", "11-B").
    """
    name = models.CharField(
        max_length=100,
        verbose_name=_('Class Name'),
        help_text=_('e.g., 10-A, 11-B')
    )
    
    grade_level = models.CharField(
        max_length=20,
        verbose_name=_('Grade Level'),
        help_text=_('e.g., 10, 11, 12')
    )
    
    # Room
    room_number = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_('Room Number')
    )
    capacity = models.PositiveSmallIntegerField(
        default=30,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        verbose_name=_('Capacity')
    )
    
    # Homeroom teacher
    homeroom_teacher = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='homeroom_classes',
        verbose_name=_('Homeroom Teacher')
    )
    
    # Academic info
    academic_year = models.CharField(
        max_length=20,
        verbose_name=_('Academic Year'),
        help_text=_('e.g., 1403-1404')
    )
    
    # Schedule (JSON for flexibility)
    schedule = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Schedule'),
        help_text=_('Weekly schedule configuration')
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Is Active')
    )
    
    # Notes
    notes = models.TextField(
        blank=True,
        verbose_name=_('Notes')
    )
    
    class Meta:
        verbose_name = _('Class')
        verbose_name_plural = _('Classes')
        ordering = ['grade_level', 'name']
        unique_together = ['school', 'name', 'academic_year']
        indexes = [
            models.Index(fields=['school', 'grade_level']),
            models.Index(fields=['school', 'is_active']),
            models.Index(fields=['homeroom_teacher']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.academic_year})"
    
    @property
    def student_count(self):
        """Count active students in this class."""
        from apps.students.models import Student
        return Student.objects.filter(
            current_class=self,
            status=Student.STATUS_ACTIVE
        ).count()
    
    @property
    def available_seats(self):
        """Calculate available seats."""
        return self.capacity - self.student_count
    
    @property
    def is_full(self):
        """Check if class is full."""
        return self.student_count >= self.capacity
    
    @property
    def courses_list(self):
        """Get courses taught in this class (global + school-specific)."""
        from django.db.models import Q
        return Course.objects.filter(
            Q(school__isnull=True) | Q(school=self.school),
            is_active=True,
        ).filter(
            # Filter for applicable grades (manual check for SQLite compatibility)
        )
    
    def get_courses_for_grade(self):
        """Get all available courses for this class's grade level."""
        from django.db.models import Q
        all_courses = Course.objects.filter(
            Q(school__isnull=True) | Q(school=self.school),
            is_active=True
        )
        # Filter manually for applicable grades
        return [c for c in all_courses if self.grade_level in c.applicable_grades]


class ClassSchedule(BaseModel):
    """
    Detailed class schedule - periods and subjects.
    """
    class_assigned = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='periods',
        verbose_name=_('Class')
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='schedule_periods',
        verbose_name=_('Course')
    )
    teacher = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.CASCADE,
        related_name='schedule_periods',
        verbose_name=_('Teacher')
    )
    
    # Day of week (0=Saturday, 6=Friday in Iran)
    DAY_CHOICES = [
        (0, _('Saturday')),
        (1, _('Sunday')),
        (2, _('Monday')),
        (3, _('Tuesday')),
        (4, _('Wednesday')),
        (5, _('Thursday')),
        (6, _('Friday')),
    ]
    day_of_week = models.PositiveSmallIntegerField(
        choices=DAY_CHOICES,
        verbose_name=_('Day of Week')
    )
    
    # Time
    start_time = models.TimeField(verbose_name=_('Start Time'))
    end_time = models.TimeField(verbose_name=_('End Time'))
    
    # Room (can be different from class room)
    room = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_('Room')
    )
    
    class Meta:
        verbose_name = _('Class Schedule')
        verbose_name_plural = _('Class Schedules')
        ordering = ['day_of_week', 'start_time']
        indexes = [
            models.Index(fields=['class_assigned', 'day_of_week']),
            models.Index(fields=['teacher', 'day_of_week']),
        ]
    
    def __str__(self):
        return f"{self.class_assigned} - {self.course} ({self.get_day_of_week_display()} {self.start_time})"
    
    @property
    def school(self):
        return self.class_assigned.school
