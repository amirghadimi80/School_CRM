"""
Student API views.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.common.permissions import IsSchoolAdmin, IsSchoolMember, IsTeacher, IsOwnerOrAdmin
from apps.common.middleware.tenant import get_current_tenant
from .models import Student, StudentDocument
from .serializers import (
    StudentListSerializer, StudentDetailSerializer,
    StudentCreateSerializer, StudentUpdateSerializer,
    StudentDocumentSerializer, StudentBulkUploadSerializer
)


class StudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for student management.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'grade_level', 'current_class']
    search_fields = ['student_code', 'user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['student_code', 'user__first_name', 'created_at']
    lookup_field = 'id'
    
    def get_queryset(self):
        tenant = get_current_tenant()
        if tenant:
            return Student.objects.filter(school=tenant, is_deleted=False)
        return Student.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return StudentListSerializer
        if self.action == 'create':
            return StudentCreateSerializer
        if self.action in ['update', 'partial_update']:
            return StudentUpdateSerializer
        return StudentDetailSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsSchoolAdmin()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrAdmin()]
        if self.action in ['attendance', 'grades', 'finance']:
            return [IsSchoolMember()]
        return [IsSchoolMember()]
    
    @action(detail=True, methods=['get'])
    def attendance(self, request, id=None):
        """Get student attendance records."""
        from apps.attendance.models import Attendance
        from apps.attendance.serializers import AttendanceSerializer
        
        student = self.get_object()
        attendance = Attendance.objects.filter(student=student)
        
        # Filter by date range
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
        """Get student grades."""
        from apps.grades.models import Grade
        from apps.grades.serializers import GradeSerializer
        
        student = self.get_object()
        grades = Grade.objects.filter(student=student)
        
        # Filter by term
        term = request.query_params.get('term')
        if term:
            grades = grades.filter(term=term)
        
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def finance(self, request, id=None):
        """Get student financial information."""
        from apps.finance.models import Invoice
        from apps.finance.serializers import InvoiceListSerializer
        
        student = self.get_object()
        invoices = Invoice.objects.filter(student=student)
        
        # Calculate summary
        total_due = sum(inv.remaining_amount for inv in invoices.filter(status__in=['pending', 'overdue', 'partial']))
        total_paid = sum(inv.paid_amount for inv in invoices.filter(status='paid'))
        
        serializer = InvoiceListSerializer(invoices, many=True)
        return Response({
            'invoices': serializer.data,
            'summary': {
                'total_due': total_due,
                'total_paid': total_paid,
                'invoice_count': invoices.count()
            }
        })
    
    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        """Bulk upload students from CSV/Excel."""
        serializer = StudentBulkUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # TODO: Implement CSV/Excel parsing and bulk creation
        return Response(
            {'detail': 'Bulk upload processing started'},
            status=status.HTTP_202_ACCEPTED
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsSchoolAdmin])
    def activate(self, request, id=None):
        """Activate/deactivate student."""
        student = self.get_object()
        student.status = request.data.get('status', Student.STATUS_ACTIVE)
        student.save(update_fields=['status'])
        return Response({
            'detail': f"Student status updated to {student.get_status_display()}",
            'status': student.status
        })


class StudentDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for student documents.
    """
    serializer_class = StudentDocumentSerializer
    permission_classes = [IsSchoolMember]
    
    def get_queryset(self):
        tenant = get_current_tenant()
        if tenant:
            return StudentDocument.objects.filter(school=tenant)
        return StudentDocument.objects.none()
    
    def perform_create(self, serializer):
        tenant = get_current_tenant()
        serializer.save(school=tenant)
