"""
Admin configuration for exams app.
"""
from django.contrib import admin
from .models import QuestionBank, QuestionFile, Exam, ExamQuestion, StudentExam, StudentAnswer


@admin.register(QuestionBank)
class QuestionBankAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'question_type', 'grade_level', 'branch', 'course',
        'points', 'difficulty', 'status', 'is_approved', 'created_by_teacher'
    ]
    list_filter = [
        'status', 'is_approved', 'question_type', 'difficulty',
        'grade_level', 'branch', 'school'
    ]
    search_fields = ['title', 'question_text', 'tags']
    readonly_fields = ['created_at', 'updated_at', 'usage_count']
    actions = ['approve_questions', 'reject_questions', 'make_public']
    
    def approve_questions(self, request, queryset):
        from django.utils import timezone
        queryset.update(
            status=QuestionBank.STATUS_APPROVED,
            is_approved=True,
            approved_by=request.user,
            approved_at=timezone.now()
        )
    approve_questions.short_description = "Approve selected questions"
    
    def reject_questions(self, request, queryset):
        queryset.update(
            status=QuestionBank.STATUS_REJECTED,
            is_approved=False
        )
    reject_questions.short_description = "Reject selected questions"
    
    def make_public(self, request, queryset):
        queryset.update(is_public=True)
    make_public.short_description = "Make selected questions public"


@admin.register(QuestionFile)
class QuestionFileAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'uploaded_by', 'status', 'file_size', 'created_at']
    list_filter = ['status']


class ExamQuestionInline(admin.TabularInline):
    model = ExamQuestion
    extra = 1


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'exam_type', 'grade_level', 'branch', 'course',
        'status', 'scheduled_at', 'duration_minutes', 'created_by_teacher'
    ]
    list_filter = ['status', 'exam_type', 'grade_level', 'branch', 'school']
    search_fields = ['title', 'description']
    inlines = [ExamQuestionInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(StudentExam)
class StudentExamAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'exam', 'status', 'attempt_number',
        'started_at', 'submitted_at', 'percentage', 'passed'
    ]
    list_filter = ['status', 'exam']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = [
        'student_exam', 'question', 'score', 'is_auto_graded', 'graded_by'
    ]
    list_filter = ['is_auto_graded']
    readonly_fields = ['created_at', 'updated_at']
