"""
Exam and Question Bank models for online examination system.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel


class QuestionBank(BaseModel):
    """
    Central question bank for the school - shared across teachers.
    All questions are stored here with categorization by grade/branch/course.
    """
    
    # Question creator
    created_by_teacher = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.CASCADE,
        related_name='created_questions',
        verbose_name=_('Created By')
    )
    
    # Categorization - linked to Curriculum structure
    grade_level = models.CharField(
        max_length=2,
        choices=[(str(i), _(f'Grade {i}')) for i in range(1, 13)],
        verbose_name=_('Grade Level'),
        db_index=True
    )
    
    BRANCH_MATH = 'math'
    BRANCH_SCIENCE = 'science'
    BRANCH_HUMANITIES = 'humanities'
    
    BRANCH_CHOICES = [
        (BRANCH_MATH, _('Mathematics')),
        (BRANCH_SCIENCE, _('Science')),
        (BRANCH_HUMANITIES, _('Humanities')),
        ('', _('No Branch (Elementary/Middle)')),
    ]
    
    branch = models.CharField(
        max_length=20,
        choices=BRANCH_CHOICES,
        blank=True,
        null=True,
        verbose_name=_('Branch'),
        help_text=_('Only for high school (grades 10-12)'),
        db_index=True
    )
    
    course = models.ForeignKey(
        'classes.Course',
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name=_('Course'),
        db_index=True
    )
    
    # Question content
    title = models.CharField(
        max_length=255,
        verbose_name=_('Question Title'),
        help_text=_('Short identifier for this question')
    )
    
    QUESTION_TYPE_MULTIPLE_CHOICE = 'multiple_choice'
    QUESTION_TYPE_TRUE_FALSE = 'true_false'
    QUESTION_TYPE_SHORT_ANSWER = 'short_answer'
    QUESTION_TYPE_ESSAY = 'essay'
    QUESTION_TYPE_FILL_BLANK = 'fill_blank'
    QUESTION_TYPE_MATCHING = 'matching'
    
    QUESTION_TYPE_CHOICES = [
        (QUESTION_TYPE_MULTIPLE_CHOICE, _('Multiple Choice')),
        (QUESTION_TYPE_TRUE_FALSE, _('True/False')),
        (QUESTION_TYPE_SHORT_ANSWER, _('Short Answer')),
        (QUESTION_TYPE_ESSAY, _('Essay/Descriptive')),
        (QUESTION_TYPE_FILL_BLANK, _('Fill in the Blank')),
        (QUESTION_TYPE_MATCHING, _('Matching')),
    ]
    
    question_type = models.CharField(
        max_length=20,
        choices=QUESTION_TYPE_CHOICES,
        default=QUESTION_TYPE_MULTIPLE_CHOICE,
        verbose_name=_('Question Type')
    )
    
    question_text = models.TextField(
        verbose_name=_('Question Text')
    )
    
    # Options stored as JSON for flexibility
    # For multiple_choice: [{"id": 1, "text": "Option 1", "is_correct": false}, ...]
    # For matching: {"left": [...], "right": [...], "pairs": [[0, 1], [1, 2]]}
    # For fill_blank: [{"blank_id": 1, "correct_answer": "..."}, ...]
    options = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Options'),
        help_text=_('Question options and configuration')
    )
    
    # Correct answer - format depends on question_type
    correct_answer = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Correct Answer'),
        help_text=_('Correct answer for auto-grading')
    )
    
    points = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1.0,
        validators=[MinValueValidator(0)],
        verbose_name=_('Points')
    )
    
    DIFFICULTY_EASY = 'easy'
    DIFFICULTY_MEDIUM = 'medium'
    DIFFICULTY_HARD = 'hard'
    
    DIFFICULTY_CHOICES = [
        (DIFFICULTY_EASY, _('Easy')),
        (DIFFICULTY_MEDIUM, _('Medium')),
        (DIFFICULTY_HARD, _('Hard')),
    ]
    
    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        default=DIFFICULTY_MEDIUM,
        verbose_name=_('Difficulty Level')
    )
    
    tags = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Tags'),
        help_text=_('List of tags for categorization')
    )
    
    # Media attachments
    media_files = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Media Files'),
        help_text=_('List of attached files [{"type": "image/pdf/audio", "url": "..."}]')
    )
    
    # Approval workflow
    STATUS_DRAFT = 'draft'
    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_ARCHIVED = 'archived'
    
    STATUS_CHOICES = [
        (STATUS_DRAFT, _('Draft')),
        (STATUS_PENDING, _('Pending Approval')),
        (STATUS_APPROVED, _('Approved')),
        (STATUS_REJECTED, _('Rejected')),
        (STATUS_ARCHIVED, _('Archived')),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
        verbose_name=_('Status')
    )
    
    is_approved = models.BooleanField(
        default=False,
        verbose_name=_('Is Approved')
    )
    
    approved_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_questions',
        verbose_name=_('Approved By')
    )
    
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Approved At')
    )
    
    rejection_reason = models.TextField(
        blank=True,
        verbose_name=_('Rejection Reason')
    )
    
    # Sharing settings
    is_public = models.BooleanField(
        default=False,
        verbose_name=_('Is Public'),
        help_text=_('Visible to other teachers in the school')
    )
    
    usage_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Usage Count'),
        help_text=_('How many times this question has been used in exams')
    )
    
    class Meta:
        verbose_name = _('Question Bank')
        verbose_name_plural = _('Question Bank')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['school', 'grade_level', 'branch', 'course']),
            models.Index(fields=['school', 'status', 'is_approved']),
            models.Index(fields=['created_by_teacher', 'status']),
            models.Index(fields=['school', 'is_public', 'status']),
        ]
    
    def __str__(self):
        branch_str = f" ({self.branch})" if self.branch else ""
        return f"{self.title} - Grade {self.grade_level}{branch_str} - {self.course.name}"


class QuestionFile(BaseModel):
    """
    PDF files uploaded as questions (for display during exam).
    """
    question = models.ForeignKey(
        QuestionBank,
        on_delete=models.CASCADE,
        related_name='files',
        verbose_name=_('Question'),
        null=True,
        blank=True
    )
    
    uploaded_by = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.CASCADE,
        related_name='uploaded_files',
        verbose_name=_('Uploaded By')
    )
    
    file = models.FileField(
        upload_to='questions/files/%Y/%m/',
        verbose_name=_('PDF File'),
        help_text=_('Only PDF files allowed')
    )
    
    file_name = models.CharField(
        max_length=255,
        verbose_name=_('File Name')
    )
    
    file_size = models.PositiveIntegerField(
        verbose_name=_('File Size (bytes)')
    )
    
    page_count = models.PositiveSmallIntegerField(
        default=1,
        verbose_name=_('Page Count')
    )
    
    description = models.TextField(
        blank=True,
        verbose_name=_('Description')
    )
    
    STATUS_UPLOADED = 'uploaded'
    STATUS_LINKED = 'linked'
    STATUS_ERROR = 'error'
    
    STATUS_CHOICES = [
        (STATUS_UPLOADED, _('Uploaded')),
        (STATUS_LINKED, _('Linked to Question')),
        (STATUS_ERROR, _('Error')),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_UPLOADED,
        verbose_name=_('Status')
    )
    
    class Meta:
        verbose_name = _('Question File')
        verbose_name_plural = _('Question Files')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.file_name} - {self.uploaded_by}"


class Exam(BaseModel):
    """
    Exam definition with scheduling and settings.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='exams',
        verbose_name=_('School')
    )
    
    title = models.CharField(
        max_length=255,
        verbose_name=_('Exam Title')
    )
    
    description = models.TextField(
        blank=True,
        verbose_name=_('Description')
    )
    
    created_by_teacher = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.CASCADE,
        related_name='created_exams',
        verbose_name=_('Created By')
    )
    
    # Categorization (must match questions)
    grade_level = models.CharField(
        max_length=2,
        choices=[(str(i), _(f'Grade {i}')) for i in range(1, 13)],
        verbose_name=_('Grade Level')
    )
    
    branch = models.CharField(
        max_length=20,
        choices=QuestionBank.BRANCH_CHOICES,
        blank=True,
        null=True,
        verbose_name=_('Branch')
    )
    
    course = models.ForeignKey(
        'classes.Course',
        on_delete=models.CASCADE,
        related_name='exams',
        verbose_name=_('Course')
    )
    
    # Exam type
    EXAM_TYPE_QUIZ = 'quiz'
    EXAM_TYPE_MIDTERM = 'midterm'
    EXAM_TYPE_FINAL = 'final'
    EXAM_TYPE_PRACTICE = 'practice'
    
    EXAM_TYPE_CHOICES = [
        (EXAM_TYPE_QUIZ, _('Quiz')),
        (EXAM_TYPE_MIDTERM, _('Midterm')),
        (EXAM_TYPE_FINAL, _('Final Exam')),
        (EXAM_TYPE_PRACTICE, _('Practice')),
    ]
    
    exam_type = models.CharField(
        max_length=20,
        choices=EXAM_TYPE_CHOICES,
        default=EXAM_TYPE_QUIZ,
        verbose_name=_('Exam Type')
    )
    
    # Scheduling
    scheduled_at = models.DateTimeField(
        verbose_name=_('Scheduled Start Time')
    )
    
    end_time = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Scheduled End Time'),
        help_text=_('If not set, exam ends based on duration')
    )
    
    duration_minutes = models.PositiveIntegerField(
        default=60,
        verbose_name=_('Duration (minutes)'),
        help_text=_('Maximum time allowed for the exam')
    )
    
    # Status
    STATUS_DRAFT = 'draft'
    STATUS_PUBLISHED = 'published'
    STATUS_ACTIVE = 'active'
    STATUS_FINISHED = 'finished'
    STATUS_ARCHIVED = 'archived'
    
    STATUS_CHOICES = [
        (STATUS_DRAFT, _('Draft')),
        (STATUS_PUBLISHED, _('Published')),
        (STATUS_ACTIVE, _('Active')),
        (STATUS_FINISHED, _('Finished')),
        (STATUS_ARCHIVED, _('Archived')),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
        verbose_name=_('Status')
    )
    
    # Exam settings (JSON for flexibility)
    settings = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Exam Settings'),
        help_text=_('''
        {
            "shuffle_questions": true,
            "shuffle_options": true,
            "show_result_immediately": false,
            "max_attempts": 1,
            "passing_percentage": 50,
            "allow_review_after_finish": true,
            "prevent_copy_paste": true,
            "tab_switch_limit": 3,
            "tab_switch_action": "warn",
            "fullscreen_required": false,
            "webcam_required": false
        }
        ''')
    )
    
    # Calculated fields
    total_points = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        verbose_name=_('Total Points')
    )
    
    question_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Question Count')
    )
    
    published_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Published At')
    )
    
    class Meta:
        verbose_name = _('Exam')
        verbose_name_plural = _('Exams')
        ordering = ['-scheduled_at']
        indexes = [
            models.Index(fields=['school', 'status']),
            models.Index(fields=['created_by_teacher', 'status']),
            models.Index(fields=['grade_level', 'branch', 'course']),
            models.Index(fields=['scheduled_at', 'status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_exam_type_display()}"


class ExamQuestion(models.Model):
    """
    Link between Exam and QuestionBank with ordering and point override.
    """
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='exam_questions',
        verbose_name=_('Exam')
    )
    
    question = models.ForeignKey(
        QuestionBank,
        on_delete=models.CASCADE,
        related_name='exam_usages',
        verbose_name=_('Question')
    )
    
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Display Order')
    )
    
    points_override = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Points Override'),
        help_text=_('If set, overrides the question default points')
    )
    
    class Meta:
        verbose_name = _('Exam Question')
        verbose_name_plural = _('Exam Questions')
        ordering = ['order', 'id']
        unique_together = ['exam', 'question']
    
    def __str__(self):
        return f"{self.exam.title} - {self.question.title}"
    
    @property
    def effective_points(self):
        """Get points for this question in the exam context."""
        if self.points_override is not None:
            return self.points_override
        return self.question.points


class StudentExam(models.Model):
    """
    Student's participation in an exam.
    """
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='exam_participations',
        verbose_name=_('Student')
    )
    
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='student_exams',
        verbose_name=_('Exam')
    )
    
    STATUS_NOT_STARTED = 'not_started'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_SUBMITTED = 'submitted'
    STATUS_GRADED = 'graded'
    STATUS_TIMEOUT = 'timeout'
    STATUS_CHEATING_DETECTED = 'cheating_detected'
    
    STATUS_CHOICES = [
        (STATUS_NOT_STARTED, _('Not Started')),
        (STATUS_IN_PROGRESS, _('In Progress')),
        (STATUS_SUBMITTED, _('Submitted')),
        (STATUS_GRADED, _('Graded')),
        (STATUS_TIMEOUT, _('Time Out')),
        (STATUS_CHEATING_DETECTED, _('Cheating Detected')),
    ]
    
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default=STATUS_NOT_STARTED,
        verbose_name=_('Status')
    )
    
    attempt_number = models.PositiveSmallIntegerField(
        default=1,
        verbose_name=_('Attempt Number')
    )
    
    # Timing
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Started At')
    )
    
    submitted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Submitted At')
    )
    
    time_spent_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_('Time Spent (minutes)')
    )
    
    # Scoring
    total_score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Total Score')
    )
    
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Percentage')
    )
    
    passed = models.BooleanField(
        null=True,
        blank=True,
        verbose_name=_('Passed')
    )
    
    # Security tracking
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_('IP Address')
    )
    
    user_agent = models.TextField(
        blank=True,
        verbose_name=_('User Agent')
    )
    
    tab_switch_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Tab Switch Count')
    )
    
    fullscreen_exit_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Fullscreen Exit Count')
    )
    
    # Answers snapshot (for reconstruction)
    answers_snapshot = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Answers Snapshot'),
        help_text=_('Snapshot of all answers at submission time')
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Student Exam')
        verbose_name_plural = _('Student Exams')
        ordering = ['-created_at']
        unique_together = ['student', 'exam', 'attempt_number']
        indexes = [
            models.Index(fields=['student', 'exam']),
            models.Index(fields=['exam', 'status']),
            models.Index(fields=['student', 'status']),
        ]
    
    def __str__(self):
        return f"{self.student} - {self.exam.title} (Attempt {self.attempt_number})"


class StudentAnswer(models.Model):
    """
    Individual answer by a student to a question.
    """
    student_exam = models.ForeignKey(
        StudentExam,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name=_('Student Exam')
    )
    
    question = models.ForeignKey(
        QuestionBank,
        on_delete=models.CASCADE,
        related_name='student_answers',
        verbose_name=_('Question')
    )
    
    # Answer content
    answer_text = models.TextField(
        blank=True,
        verbose_name=_('Answer Text')
    )
    
    answer_json = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Answer JSON'),
        help_text=_('Structured answer data for complex question types')
    )
    
    # Grading
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Score')
    )
    
    is_auto_graded = models.BooleanField(
        default=False,
        verbose_name=_('Is Auto Graded')
    )
    
    graded_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='graded_answers',
        verbose_name=_('Graded By')
    )
    
    graded_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Graded At')
    )
    
    feedback = models.TextField(
        blank=True,
        verbose_name=_('Feedback')
    )
    
    # For AI grading (future)
    ai_grade_suggested = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('AI Suggested Grade')
    )
    
    ai_confidence = models.DecimalField(
        max_digits=4,
        decimal_places=3,
        null=True,
        blank=True,
        verbose_name=_('AI Confidence'),
        validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Student Answer')
        verbose_name_plural = _('Student Answers')
        ordering = ['id']
        unique_together = ['student_exam', 'question']
    
    def __str__(self):
        return f"{self.student_exam.student} - {self.question.title}"
