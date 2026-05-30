"""
Grades and academic performance models.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel


class Grade(BaseModel):
    """
    Individual grade/score for a student in a course.
    """
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='grades',
        verbose_name=_('Student')
    )
    course = models.ForeignKey(
        'classes.Course',
        on_delete=models.CASCADE,
        related_name='grades',
        verbose_name=_('Course')
    )
    class_record = models.ForeignKey(
        'classes.Class',
        on_delete=models.CASCADE,
        related_name='grades',
        verbose_name=_('Class'),
        null=True,
        blank=True
    )
    
    # Grade details
    EXAM_TYPE_QUIZ = 'quiz'
    EXAM_TYPE_MIDTERM = 'midterm'
    EXAM_TYPE_FINAL = 'final'
    EXAM_TYPE_PROJECT = 'project'
    EXAM_TYPE_HOMEWORK = 'homework'
    EXAM_TYPE_PARTICIPATION = 'participation'
    EXAM_TYPE_OTHER = 'other'
    
    EXAM_TYPE_CHOICES = [
        (EXAM_TYPE_QUIZ, _('Quiz')),
        (EXAM_TYPE_MIDTERM, _('Midterm')),
        (EXAM_TYPE_FINAL, _('Final Exam')),
        (EXAM_TYPE_PROJECT, _('Project')),
        (EXAM_TYPE_HOMEWORK, _('Homework')),
        (EXAM_TYPE_PARTICIPATION, _('Participation')),
        (EXAM_TYPE_OTHER, _('Other')),
    ]
    
    exam_type = models.CharField(
        max_length=20,
        choices=EXAM_TYPE_CHOICES,
        default=EXAM_TYPE_QUIZ,
        verbose_name=_('Exam Type')
    )
    
    title = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Title'),
        help_text=_('e.g., Chapter 3 Quiz, First Midterm')
    )
    
    # Scores
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_('Score')
    )
    max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=20.0,
        validators=[MinValueValidator(1)],
        verbose_name=_('Maximum Score')
    )
    
    # Percentage (calculated)
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Percentage')
    )
    
    # Date
    exam_date = models.DateField(verbose_name=_('Exam Date'))
    
    # Term info
    academic_year = models.CharField(
        max_length=20,
        verbose_name=_('Academic Year')
    )
    term = models.CharField(
        max_length=50,
        verbose_name=_('Term/Semester')
    )
    
    # Who entered the grade
    recorded_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_grades',
        verbose_name=_('Recorded By')
    )
    
    # Notes
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    class Meta:
        verbose_name = _('Grade')
        verbose_name_plural = _('Grades')
        ordering = ['-exam_date']
        indexes = [
            models.Index(fields=['student', 'course']),
            models.Index(fields=['class_record', 'exam_date']),
            models.Index(fields=['student', 'academic_year', 'term']),
        ]
    
    def __str__(self):
        return f"{self.student.student_code} - {self.course} - {self.score}/{self.max_score}"
    
    @property
    def school(self):
        return self.student.school
    
    def save(self, *args, **kwargs):
        # Calculate percentage
        if self.score is not None and self.max_score:
            self.percentage = round((self.score / self.max_score) * 100, 2)
        super().save(*args, **kwargs)
    
    @property
    def is_passing(self):
        """Check if grade is passing (default passing: 50%)."""
        if self.percentage is not None:
            return self.percentage >= 50
        return False


class ReportCard(BaseModel):
    """
    Report card / transcript for a term.
    """
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='report_cards',
        verbose_name=_('Student')
    )
    
    academic_year = models.CharField(
        max_length=20,
        verbose_name=_('Academic Year')
    )
    term = models.CharField(
        max_length=50,
        verbose_name=_('Term/Semester')
    )
    
    # Summary stats
    total_courses = models.PositiveSmallIntegerField(default=0)
    total_credits = models.PositiveSmallIntegerField(default=0)
    
    average_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Average Score')
    )
    
    gpa = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('GPA')
    )
    
    rank_in_class = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        verbose_name=_('Rank in Class')
    )
    
    # Status
    STATUS_DRAFT = 'draft'
    STATUS_PUBLISHED = 'published'
    STATUS_ARCHIVED = 'archived'
    
    STATUS_CHOICES = [
        (STATUS_DRAFT, _('Draft')),
        (STATUS_PUBLISHED, _('Published')),
        (STATUS_ARCHIVED, _('Archived')),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
        verbose_name=_('Status')
    )
    
    published_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Published At')
    )
    
    # Comments
    teacher_comments = models.TextField(
        blank=True,
        verbose_name=_('Teacher Comments')
    )
    principal_comments = models.TextField(
        blank=True,
        verbose_name=_('Principal Comments')
    )
    
    class Meta:
        verbose_name = _('Report Card')
        verbose_name_plural = _('Report Cards')
        unique_together = ['student', 'academic_year', 'term']
        ordering = ['-academic_year', 'term']
    
    def __str__(self):
        return f"{self.student.student_code} - {self.academic_year} {self.term}"


class CourseGradeSummary(models.Model):
    """
    Pre-calculated grade summary per course.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='course_grade_summaries',
        verbose_name=_('School')
    )
    class_record = models.ForeignKey(
        'classes.Class',
        on_delete=models.CASCADE,
        related_name='grade_summaries',
        verbose_name=_('Class')
    )
    course = models.ForeignKey(
        'classes.Course',
        on_delete=models.CASCADE,
        related_name='grade_summaries',
        verbose_name=_('Course')
    )
    
    academic_year = models.CharField(max_length=20, verbose_name=_('Academic Year'))
    term = models.CharField(max_length=50, verbose_name=_('Term'))
    
    # Stats
    total_students = models.PositiveIntegerField(default=0)
    average_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    highest_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    lowest_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    passing_count = models.PositiveIntegerField(default=0)
    failing_count = models.PositiveIntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Course Grade Summary')
        verbose_name_plural = _('Course Grade Summaries')
        unique_together = ['class_record', 'course', 'academic_year', 'term']
        ordering = ['-academic_year', 'term']
