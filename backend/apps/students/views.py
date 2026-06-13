"""
Student API views.
"""
import re

from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend

from apps.common.permissions import IsSchoolAdmin, IsSchoolMember, IsOwnerOrAdmin
from apps.common.middleware.tenant import get_current_tenant
from .models import Student, StudentDocument, StudentEnrollment
from .serializers import (
    StudentListSerializer, StudentDetailSerializer,
    StudentCreateSerializer, StudentUpdateSerializer,
    StudentDocumentSerializer, StudentBulkUploadSerializer,
    StudentEnrollmentSerializer,
)
from .services.registration import generate_unique_national_id, is_profile_complete


class StudentViewSet(viewsets.ModelViewSet):
    """ViewSet for student management."""
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'grade_level', 'current_class']
    search_fields = ['student_code', 'user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['student_code', 'user__first_name', 'created_at']
    lookup_field = 'id'
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        tenant = get_current_tenant()
        if tenant:
            return Student.objects.filter(school=tenant, is_deleted=False).select_related(
                'user', 'user__profile', 'current_class'
            )
        return Student.objects.none()

    def get_serializer_class(self):
        if self.action == 'list':
            return StudentListSerializer
        if self.action == 'create':
            return StudentCreateSerializer
        if self.action in ['update', 'partial_update']:
            return StudentUpdateSerializer
        return StudentDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['school'] = get_current_tenant()
        return context

    def get_permissions(self):
        if self.action == 'create':
            return [IsSchoolAdmin()]
        if self.action in ['update', 'partial_update', 'destroy', 'upload_avatar']:
            return [IsOwnerOrAdmin()]
        if self.action == 'me':
            return [permissions.IsAuthenticated()]
        if self.action in ['attendance', 'grades', 'finance']:
            return [IsSchoolMember()]
        return [IsSchoolMember()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        return Response(
            StudentListSerializer(student).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'], permission_classes=[IsSchoolAdmin])
    def generate_code(self, request):
        """Generate a unique national-id-style code for students without one."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)
        national_id = generate_unique_national_id(school=school)
        return Response({'national_id': national_id})

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current student's profile."""
        if not hasattr(request.user, 'student_profile'):
            return Response({'detail': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        student = request.user.student_profile
        serializer = StudentDetailSerializer(student)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_avatar(self, request, id=None):
        """Upload student profile photo (3x4)."""
        student = self.get_object()
        avatar = request.FILES.get('avatar')
        if not avatar:
            return Response({'detail': 'فایل عکس ارسال نشده است.'}, status=status.HTTP_400_BAD_REQUEST)

        student.user.avatar = avatar
        student.user.save(update_fields=['avatar'])

        profile = getattr(student.user, 'profile', None)
        student.profile_completed = is_profile_complete(
            phone=student.user.phone,
            birth_date=profile.birth_date if profile else None,
            father_phone=student.father_phone,
            mother_phone=student.mother_phone,
            grade_level=student.grade_level,
        )
        student.save(update_fields=['profile_completed'])

        return Response(StudentDetailSerializer(student).data)

    @action(detail=True, methods=['get'])
    def attendance(self, request, id=None):
        from apps.attendance.models import Attendance
        from apps.attendance.serializers import AttendanceSerializer

        student = self.get_object()
        attendance = Attendance.objects.filter(student=student)
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            attendance = attendance.filter(date__gte=start_date)
        if end_date:
            attendance = attendance.filter(date__lte=end_date)
        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def grades(self, request, id=None):
        from apps.grades.models import Grade
        from apps.grades.serializers import GradeSerializer

        student = self.get_object()
        grades = Grade.objects.filter(student=student)
        term = request.query_params.get('term')
        if term:
            grades = grades.filter(term=term)
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def finance(self, request, id=None):
        from apps.finance.models import Invoice
        from apps.finance.serializers import InvoiceListSerializer

        student = self.get_object()
        invoices = Invoice.objects.filter(student=student)
        total_due = sum(
            inv.remaining_amount
            for inv in invoices.filter(status__in=['pending', 'overdue', 'partial'])
        )
        total_paid = sum(inv.paid_amount for inv in invoices.filter(status='paid'))
        serializer = InvoiceListSerializer(invoices, many=True)
        return Response({
            'invoices': serializer.data,
            'summary': {
                'total_due': total_due,
                'total_paid': total_paid,
                'invoice_count': invoices.count(),
            },
        })

    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        serializer = StudentBulkUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(
            {'detail': 'Bulk upload processing started'},
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=True, methods=['post'], permission_classes=[IsSchoolAdmin])
    def activate(self, request, id=None):
        student = self.get_object()
        student.status = request.data.get('status', Student.STATUS_ACTIVE)
        student.save(update_fields=['status'])
        return Response({
            'detail': f"Student status updated to {student.get_status_display()}",
            'status': student.status,
        })


class StudentDocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for student documents."""
    serializer_class = StudentDocumentSerializer
    permission_classes = [IsSchoolMember]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        tenant = get_current_tenant()
        queryset = StudentDocument.objects.filter(school=tenant) if tenant else StudentDocument.objects.none()
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        return queryset

    def perform_create(self, serializer):
        tenant = get_current_tenant()
        student_id = self.request.data.get('student')
        student = get_object_or_404(Student, id=student_id, school=tenant)
        serializer.save(school=tenant, student=student)


class StudentEnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing student enrollments in academic years."""
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsSchoolAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['academic_year', 'status', 'class_assigned']

    def get_queryset(self):
        tenant = get_current_tenant()
        if tenant:
            return StudentEnrollment.objects.filter(
                academic_year__school=tenant
            ).select_related('student', 'academic_year', 'class_assigned')
        return StudentEnrollment.objects.none()

    @action(detail=False, methods=['post'])
    def bulk_assign_class(self, request):
        enrollment_ids = request.data.get('enrollment_ids', [])
        class_id = request.data.get('class_id')
        if not enrollment_ids or not class_id:
            return Response(
                {'detail': 'enrollment_ids and class_id are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        updated_count = StudentEnrollment.objects.filter(
            id__in=enrollment_ids
        ).update(class_assigned_id=class_id)
        return Response({'status': 'success', 'updated_count': updated_count})

    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        enrollment_ids = request.data.get('enrollment_ids', [])
        new_status = request.data.get('status')
        if not enrollment_ids or not new_status:
            return Response(
                {'detail': 'enrollment_ids and status are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        updated_count = StudentEnrollment.objects.filter(
            id__in=enrollment_ids
        ).update(status=new_status)
        return Response({'status': 'success', 'updated_count': updated_count})
