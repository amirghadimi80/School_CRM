"""
Teacher API views.
"""
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse

from apps.common.permissions import IsSchoolAdmin, IsSchoolMember
from apps.common.middleware.tenant import get_current_tenant
from apps.classes.models import Class
from .models import Teacher, TeacherAssignment
from .serializers import (
    TeacherListSerializer,
    TeacherCreateSerializer,
    TeacherAssignmentSerializer,
    BulkTeacherAssignmentSerializer,
)
from .services.assignments import (
    build_assignment_rows,
    get_assignment_status,
    get_academic_year,
)
from .services.gradebook_pdf import generate_gradebook_pdf


class TeacherViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for listing and creating teachers."""

    serializer_class = TeacherListSerializer
    permission_classes = [permissions.IsAuthenticated, IsSchoolMember]
    lookup_field = 'id'

    def get_queryset(self):
        school = get_current_tenant()
        if school:
            queryset = Teacher.objects.filter(school=school).select_related('user')
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset
        return Teacher.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherCreateSerializer
        return TeacherListSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsSchoolAdmin()]
        return [permissions.IsAuthenticated(), IsSchoolMember()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['school'] = get_current_tenant()
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        teacher = serializer.save()
        return Response(
            TeacherListSerializer(teacher).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['get'], permission_classes=[IsSchoolAdmin])
    def gradebook_pdf(self, request, id=None):
        """Generate and download empty gradebook PDF for a teacher."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)

        teacher = self.get_object()
        academic_year = request.query_params.get(
            'academic_year', school.current_academic_year
        )

        pdf_bytes = generate_gradebook_pdf(teacher, school, academic_year)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        filename = f'gradebook_{teacher.employee_id}.pdf'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class TeacherAssignmentViewSet(viewsets.ViewSet):
    """ViewSet for teacher-to-class course assignments."""

    permission_classes = [IsSchoolAdmin]

    def _get_class(self, class_id, school):
        return get_object_or_404(Class, id=class_id, school=school, is_deleted=False)

    def list(self, request):
        """Get assignment rows for a class (curriculum + assigned teachers)."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)

        class_id = request.query_params.get('class_id')
        if not class_id:
            return Response({'detail': 'class_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        class_obj = self._get_class(class_id, school)
        academic_year = get_academic_year(
            school, request.query_params.get('academic_year')
        )

        rows = build_assignment_rows(class_obj, school, academic_year)
        status_data = get_assignment_status(class_obj, school, academic_year)

        return Response({
            'class': {
                'id': class_obj.id,
                'name': class_obj.name,
                'grade_level': class_obj.grade_level,
                'branch': class_obj.branch,
                'branch_display': class_obj.get_branch_display() if class_obj.branch else None,
            },
            'academic_year': academic_year,
            'assignments': rows,
            'status': status_data,
        })

    @action(detail=False, methods=['get'])
    def status(self, request):
        """Get assignment completion status for a class."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)

        class_id = request.query_params.get('class_id')
        if not class_id:
            return Response({'detail': 'class_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        class_obj = self._get_class(class_id, school)
        academic_year = get_academic_year(
            school, request.query_params.get('academic_year')
        )
        return Response(get_assignment_status(class_obj, school, academic_year))

    @action(detail=False, methods=['post'])
    def bulk(self, request):
        """Bulk upsert teacher assignments for a class."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = BulkTeacherAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        class_obj = self._get_class(data['class_id'], school)
        academic_year = data['academic_year']

        created = []
        for item in data['assignments']:
            teacher = get_object_or_404(
                Teacher,
                id=item['teacher_id'],
                school=school,
                status=Teacher.STATUS_ACTIVE,
            )
            assignment, _ = TeacherAssignment.objects.update_or_create(
                class_assigned=class_obj,
                course_id=item['course_id'],
                academic_year=academic_year,
                defaults={'teacher': teacher},
            )
            created.append(assignment)

        result_serializer = TeacherAssignmentSerializer(created, many=True)
        status_data = get_assignment_status(class_obj, school, academic_year)

        return Response({
            'saved': len(created),
            'assignments': result_serializer.data,
            'status': status_data,
        })
