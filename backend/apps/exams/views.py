"""
Views for exams app.
"""
from django.utils import timezone
from django.db.models import Q
from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import QuestionBank, QuestionFile, Exam, StudentExam, StudentAnswer
from .serializers import (
    QuestionBankSerializer, QuestionBankCreateSerializer, QuestionBankListSerializer,
    QuestionFileSerializer, ExamSerializer, ExamListSerializer,
    StudentExamSerializer, StudentAnswerSerializer,
    GradeSerializer, BranchSerializer, CourseSerializer
)
from apps.classes.models import Course
from apps.teachers.models import Teacher
from apps.students.models import Student


class CurriculumViewSet(viewsets.ViewSet):
    """
    API endpoints for cascading curriculum data (Grade -> Branch -> Course).
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def grades(self, request):
        """Get list of available grade levels."""
        grades = [
            {'value': str(i), 'label': f'پایه {i}'} for i in range(1, 13)
        ]
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def branches(self, request):
        """Get list of branches (only for grades 10-12)."""
        grade = request.query_params.get('grade')
        
        # Branches only available for high school (grades 10-12)
        if grade and int(grade) >= 10:
            branches = [
                {'value': 'math', 'label': 'ریاضی'},
                {'value': 'science', 'label': 'تجربی'},
                {'value': 'humanities', 'label': 'انسانی'},
            ]
        else:
            branches = []
        
        serializer = BranchSerializer(branches, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def courses(self, request):
        """Get list of courses for a specific grade and branch."""
        school = request.user.school if hasattr(request.user, 'school') else None
        if not school:
            return Response([])
        
        grade = request.query_params.get('grade')
        branch = request.query_params.get('branch')
        
        # Use for_school() to get both global and school-specific courses
        queryset = Course.objects.for_school(school)
        
        if grade:
            # Filter manually for applicable grades (SQLite compatibility)
            all_courses = list(queryset)
            queryset = [c for c in all_courses if grade in c.applicable_grades]
        
        serializer = CourseSerializer(queryset, many=True)
        return Response(serializer.data)


class QuestionBankViewSet(viewsets.ModelViewSet):
    """
    ViewSet for QuestionBank management.
    Teachers can create and view their own questions.
    Admins can approve/reject questions.
    """
    serializer_class = QuestionBankSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['grade_level', 'branch', 'course', 'status', 'is_public', 'question_type']
    search_fields = ['title', 'question_text', 'tags']
    ordering_fields = ['created_at', 'usage_count', 'difficulty']
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]
    
    def get_queryset(self):
        user = self.request.user
        school = user.school if hasattr(user, 'school') else None
        
        if not school:
            return QuestionBank.objects.none()
        
        queryset = QuestionBank.objects.filter(school=school)
        
        # Filter based on user role
        try:
            teacher = user.teacher_profile
            # Teachers see: their own questions + public approved questions
            queryset = queryset.filter(
                Q(created_by_teacher=teacher) | 
                Q(is_public=True, status=QuestionBank.STATUS_APPROVED)
            )
        except:
            pass
        
        return queryset.select_related('course', 'created_by_teacher')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return QuestionBankCreateSerializer
        elif self.action == 'list':
            return QuestionBankListSerializer
        return QuestionBankSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        try:
            context['teacher'] = self.request.user.teacher_profile
        except:
            pass
        return context
    
    def perform_create(self, serializer):
        teacher = self.request.user.teacher_profile
        serializer.save(
            created_by_teacher=teacher,
            school=teacher.school
        )
    
    @action(detail=True, methods=['post'])
    def submit_for_approval(self, request, pk=None):
        """Submit a draft question for admin approval."""
        question = self.get_object()
        if question.status != QuestionBank.STATUS_DRAFT:
            return Response(
                {'error': 'Only draft questions can be submitted for approval'},
                status=status.HTTP_400_BAD_REQUEST
            )
        question.status = QuestionBank.STATUS_PENDING
        question.save()
        return Response({'status': 'submitted for approval'})
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Admin approves a question."""
        question = self.get_object()
        question.status = QuestionBank.STATUS_APPROVED
        question.is_approved = True
        question.approved_by = request.user
        question.approved_at = timezone.now()
        question.save()
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Admin rejects a question with reason."""
        question = self.get_object()
        reason = request.data.get('reason', '')
        question.status = QuestionBank.STATUS_REJECTED
        question.is_approved = False
        question.rejection_reason = reason
        question.save()
        return Response({'status': 'rejected', 'reason': reason})
    
    @action(detail=True, methods=['post'])
    def make_public(self, request, pk=None):
        """Make question visible to other teachers."""
        question = self.get_object()
        question.is_public = True
        question.save()
        return Response({'status': 'made public'})
    
    @action(detail=True, methods=['post'], parser_classes=[parsers.MultiPartParser])
    def upload_file(self, request, pk=None):
        """Upload a PDF file for this question."""
        question = self.get_object()
        file_obj = request.FILES.get('file')
        
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not file_obj.name.endswith('.pdf'):
            return Response({'error': 'Only PDF files allowed'}, status=status.HTTP_400_BAD_REQUEST)
        
        teacher = request.user.teacher_profile
        
        question_file = QuestionFile.objects.create(
            question=question,
            uploaded_by=teacher,
            file=file_obj,
            file_name=file_obj.name,
            file_size=file_obj.size,
            status=QuestionFile.STATUS_LINKED
        )
        
        # Update question media_files
        media_files = question.media_files or []
        media_files.append({
            'type': 'pdf',
            'url': question_file.file.url,
            'name': file_obj.name,
            'size': file_obj.size
        })
        question.media_files = media_files
        question.save()
        
        return Response(QuestionFileSerializer(question_file).data, status=status.HTTP_201_CREATED)


class QuestionFileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for file uploads (PDF questions).
    """
    serializer_class = QuestionFileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        school = self.request.user.school if hasattr(self.request.user, 'school') else None
        if not school:
            return QuestionFile.objects.none()
        return QuestionFile.objects.filter(school=school)
    
    def perform_create(self, serializer):
        teacher = self.request.user.teacher_profile
        file_obj = self.request.FILES.get('file')
        serializer.save(
            uploaded_by=teacher,
            school=teacher.school,
            file_name=file_obj.name if file_obj else '',
            file_size=file_obj.size if file_obj else 0
        )


class ExamViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Exam management.
    """
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['grade_level', 'branch', 'course', 'status', 'exam_type']
    search_fields = ['title', 'description']
    ordering_fields = ['scheduled_at', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        school = user.school if hasattr(user, 'school') else None
        
        if not school:
            return Exam.objects.none()
        
        queryset = Exam.objects.filter(school=school)
        
        # Filter based on user role
        try:
            teacher = user.teacher_profile
            queryset = queryset.filter(created_by_teacher=teacher)
        except:
            pass
        
        return queryset.select_related('course', 'created_by_teacher').prefetch_related('exam_questions__question')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ExamListSerializer
        return ExamSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        try:
            context['teacher'] = self.request.user.teacher_profile
        except:
            pass
        return context
    
    def perform_create(self, serializer):
        teacher = self.request.user.teacher_profile
        serializer.save(
            created_by_teacher=teacher,
            school=teacher.school
        )
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish the exam to make it available for students."""
        exam = self.get_object()
        if exam.status != Exam.STATUS_DRAFT:
            return Response(
                {'error': 'Only draft exams can be published'},
                status=status.HTTP_400_BAD_REQUEST
            )
        exam.status = Exam.STATUS_PUBLISHED
        exam.published_at = timezone.now()
        exam.save()
        return Response({'status': 'published'})
    
    @action(detail=True, methods=['post'])
    def start_now(self, request, pk=None):
        """Manually start the exam immediately."""
        exam = self.get_object()
        if exam.status not in [Exam.STATUS_PUBLISHED, Exam.STATUS_DRAFT]:
            return Response(
                {'error': 'Exam cannot be started'},
                status=status.HTTP_400_BAD_REQUEST
            )
        exam.status = Exam.STATUS_ACTIVE
        exam.scheduled_at = timezone.now()
        exam.save()
        return Response({'status': 'started'})
    
    @action(detail=True, methods=['post'])
    def finish(self, request, pk=None):
        """Manually finish the exam."""
        exam = self.get_object()
        exam.status = Exam.STATUS_FINISHED
        exam.save()
        return Response({'status': 'finished'})
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate an exam with new ID."""
        exam = self.get_object()
        
        # Create new exam
        new_exam = Exam.objects.create(
            school=exam.school,
            title=f"{exam.title} (کپی)",
            description=exam.description,
            created_by_teacher=exam.created_by_teacher,
            grade_level=exam.grade_level,
            branch=exam.branch,
            course=exam.course,
            exam_type=exam.exam_type,
            duration_minutes=exam.duration_minutes,
            settings=exam.settings,
            status=Exam.STATUS_DRAFT
        )
        
        # Copy questions
        for eq in exam.exam_questions.all():
            ExamQuestion.objects.create(
                exam=new_exam,
                question=eq.question,
                order=eq.order,
                points_override=eq.points_override
            )
        
        return Response(ExamSerializer(new_exam).data)


class StudentExamViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for student exam participation.
    """
    serializer_class = StudentExamSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Check if user is a student
        try:
            student = user.student_profile
            return StudentExam.objects.filter(student=student)
        except:
            return StudentExam.objects.none()
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start the exam for this student."""
        try:
            student = request.user.student_profile
        except:
            return Response({'error': 'Only students can start exams'}, status=status.HTTP_403_FORBIDDEN)
        
        student_exam = self.get_object()
        
        if student_exam.status != StudentExam.STATUS_NOT_STARTED:
            return Response(
                {'error': 'Exam already started'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if exam is active
        exam = student_exam.exam
        if exam.status not in [Exam.STATUS_PUBLISHED, Exam.STATUS_ACTIVE]:
            return Response(
                {'error': 'Exam is not available'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        student_exam.status = StudentExam.STATUS_IN_PROGRESS
        student_exam.started_at = timezone.now()
        student_exam.ip_address = self.get_client_ip(request)
        student_exam.user_agent = request.META.get('HTTP_USER_AGENT', '')
        student_exam.save()
        
        return Response(StudentExamSerializer(student_exam).data)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit exam answers."""
        student_exam = self.get_object()
        
        if student_exam.status != StudentExam.STATUS_IN_PROGRESS:
            return Response(
                {'error': 'Exam is not in progress'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        answers = request.data.get('answers', [])
        
        # Save answers
        for answer_data in answers:
            StudentAnswer.objects.update_or_create(
                student_exam=student_exam,
                question_id=answer_data['question_id'],
                defaults={
                    'answer_text': answer_data.get('answer_text', ''),
                    'answer_json': answer_data.get('answer_json', {})
                }
            )
        
        student_exam.status = StudentExam.STATUS_SUBMITTED
        student_exam.submitted_at = timezone.now()
        
        # Calculate time spent
        if student_exam.started_at:
            delta = student_exam.submitted_at - student_exam.started_at
            student_exam.time_spent_minutes = int(delta.total_seconds() / 60)
        
        # Auto-grade multiple choice and true/false
        self._auto_grade(student_exam)
        
        student_exam.save()
        
        return Response(StudentExamSerializer(student_exam).data)
    
    def _auto_grade(self, student_exam):
        """Auto-grade objective questions."""
        total_score = 0
        total_points = 0
        
        for answer in student_exam.answers.all():
            question = answer.question
            total_points += question.points
            
            # Only auto-grade if answer is empty
            if answer.score is not None:
                total_score += answer.score
                continue
            
            if question.question_type in [
                QuestionBank.QUESTION_TYPE_MULTIPLE_CHOICE,
                QuestionBank.QUESTION_TYPE_TRUE_FALSE
            ]:
                correct_answer = question.correct_answer
                student_answer = answer.answer_json
                
                # Compare answers
                if self._compare_answers(correct_answer, student_answer):
                    answer.score = question.points
                    answer.is_auto_graded = True
                    answer.save()
                    total_score += question.points
        
        student_exam.total_score = total_score
        if total_points > 0:
            student_exam.percentage = (total_score / total_points) * 100
            passing = student_exam.exam.settings.get('passing_percentage', 50)
            student_exam.passed = student_exam.percentage >= passing
        
        # Update status based on grading
        if all(a.score is not None for a in student_exam.answers.all()):
            student_exam.status = StudentExam.STATUS_GRADED
    
    def _compare_answers(self, correct, student):
        """Compare correct answer with student answer."""
        if isinstance(correct, list) and isinstance(student, list):
            return set(correct) == set(student)
        return correct == student
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


class StudentAnswerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for manual grading by teachers.
    """
    serializer_class = StudentAnswerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        try:
            teacher = user.teacher_profile
            # Get answers for exams created by this teacher
            return StudentAnswer.objects.filter(
                student_exam__exam__created_by_teacher=teacher
            )
        except:
            return StudentAnswer.objects.none()
    
    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """Manually grade an answer."""
        answer = self.get_object()
        score = request.data.get('score')
        feedback = request.data.get('feedback', '')
        
        if score is None:
            return Response(
                {'error': 'Score is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        answer.score = score
        answer.feedback = feedback
        answer.graded_by = request.user
        answer.graded_at = timezone.now()
        answer.is_auto_graded = False
        answer.save()
        
        # Update student exam totals
        self._update_student_exam_score(answer.student_exam)
        
        return Response(StudentAnswerSerializer(answer).data)
    
    def _update_student_exam_score(self, student_exam):
        """Recalculate total score after grading."""
        total = sum(a.score or 0 for a in student_exam.answers.all())
        student_exam.total_score = total
        
        total_points = sum(a.question.points for a in student_exam.answers.all())
        if total_points > 0:
            student_exam.percentage = (total / total_points) * 100
            passing = student_exam.exam.settings.get('passing_percentage', 50)
            student_exam.passed = student_exam.percentage >= passing
        
        # Check if all answers are graded
        if all(a.score is not None for a in student_exam.answers.all()):
            student_exam.status = StudentExam.STATUS_GRADED
        else:
            student_exam.status = StudentExam.STATUS_SUBMITTED
        
        student_exam.save()
