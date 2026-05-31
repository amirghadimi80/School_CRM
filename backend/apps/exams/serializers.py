"""
Serializers for exams app.
"""
from rest_framework import serializers
from .models import QuestionBank, QuestionFile, Exam, ExamQuestion, StudentExam, StudentAnswer
from apps.classes.models import Course
from apps.teachers.models import Teacher


class QuestionFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionFile
        fields = ['id', 'file', 'file_name', 'file_size', 'page_count', 'description', 'status', 'created_at']
        read_only_fields = ['file_size', 'status']


class QuestionBankSerializer(serializers.ModelSerializer):
    files = QuestionFileSerializer(many=True, read_only=True)
    created_by_teacher_name = serializers.CharField(source='created_by_teacher.full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = QuestionBank
        fields = [
            'id', 'title', 'question_type', 'question_text', 'options', 'correct_answer',
            'points', 'difficulty', 'tags', 'media_files', 'files',
            'grade_level', 'branch', 'course', 'course_name',
            'status', 'is_approved', 'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason',
            'is_public', 'usage_count',
            'created_by_teacher', 'created_by_teacher_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'is_approved', 'approved_by', 'approved_at', 'rejection_reason',
            'usage_count', 'school'
        ]


class QuestionBankCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new questions."""
    
    class Meta:
        model = QuestionBank
        fields = [
            'title', 'question_type', 'question_text', 'options', 'correct_answer',
            'points', 'difficulty', 'tags', 'media_files',
            'grade_level', 'branch', 'course'
        ]
    
    def create(self, validated_data):
        # Set created_by_teacher from context
        teacher = self.context.get('teacher')
        if teacher:
            validated_data['created_by_teacher'] = teacher
            validated_data['school'] = teacher.school
        return super().create(validated_data)


class QuestionBankListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    course_name = serializers.CharField(source='course.name', read_only=True)
    created_by_teacher_name = serializers.CharField(source='created_by_teacher.full_name', read_only=True)
    
    class Meta:
        model = QuestionBank
        fields = [
            'id', 'title', 'question_type', 'points', 'difficulty',
            'grade_level', 'branch', 'course_name',
            'status', 'is_approved', 'is_public', 'usage_count',
            'created_by_teacher_name', 'created_at'
        ]


class ExamQuestionSerializer(serializers.ModelSerializer):
    question_details = QuestionBankListSerializer(source='question', read_only=True)
    effective_points = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = ExamQuestion
        fields = ['id', 'question', 'question_details', 'order', 'points_override', 'effective_points']


class ExamSerializer(serializers.ModelSerializer):
    exam_questions = ExamQuestionSerializer(many=True, read_only=True)
    question_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    created_by_teacher_name = serializers.CharField(source='created_by_teacher.full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'exam_type',
            'grade_level', 'branch', 'course', 'course_name',
            'scheduled_at', 'end_time', 'duration_minutes',
            'status', 'settings', 'total_points', 'question_count',
            'exam_questions', 'question_ids',
            'created_by_teacher', 'created_by_teacher_name', 'published_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'status', 'total_points', 'question_count', 'published_at', 'school'
        ]
    
    def create(self, validated_data):
        question_ids = validated_data.pop('question_ids', [])
        teacher = self.context.get('teacher')
        
        if teacher:
            validated_data['created_by_teacher'] = teacher
            validated_data['school'] = teacher.school
        
        exam = super().create(validated_data)
        
        # Add questions with ordering
        for index, question_id in enumerate(question_ids):
            try:
                question = QuestionBank.objects.get(
                    id=question_id,
                    school=exam.school,
                    status=QuestionBank.STATUS_APPROVED
                )
                ExamQuestion.objects.create(
                    exam=exam,
                    question=question,
                    order=index
                )
            except QuestionBank.DoesNotExist:
                pass
        
        # Update exam stats
        exam.question_count = exam.exam_questions.count()
        exam.total_points = sum(
            eq.effective_points for eq in exam.exam_questions.all()
        )
        exam.save()
        
        return exam


class ExamListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for exam list."""
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'exam_type', 'grade_level', 'branch', 'course_name',
            'scheduled_at', 'duration_minutes', 'status', 'question_count', 'total_points'
        ]


class StudentAnswerSerializer(serializers.ModelSerializer):
    question_details = QuestionBankListSerializer(source='question', read_only=True)
    
    class Meta:
        model = StudentAnswer
        fields = [
            'id', 'question', 'question_details', 'answer_text', 'answer_json',
            'score', 'is_auto_graded', 'feedback'
        ]


class StudentExamSerializer(serializers.ModelSerializer):
    answers = StudentAnswerSerializer(many=True, read_only=True)
    exam_details = ExamListSerializer(source='exam', read_only=True)
    
    class Meta:
        model = StudentExam
        fields = [
            'id', 'exam', 'exam_details', 'status', 'attempt_number',
            'started_at', 'submitted_at', 'time_spent_minutes',
            'total_score', 'percentage', 'passed',
            'tab_switch_count', 'fullscreen_exit_count',
            'answers'
        ]
        read_only_fields = [
            'status', 'total_score', 'percentage', 'passed',
            'tab_switch_count', 'fullscreen_exit_count'
        ]


# Curriculum cascading serializers
class GradeSerializer(serializers.Serializer):
    value = serializers.CharField()
    label = serializers.CharField()


class BranchSerializer(serializers.Serializer):
    value = serializers.CharField()
    label = serializers.CharField()


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'code', 'name', 'category']
