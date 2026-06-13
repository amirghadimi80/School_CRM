"""
Class API views.
"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.common.permissions import IsSchoolAdmin, IsSchoolMember
from apps.common.middleware.tenant import get_current_tenant
from .models import Class
from .serializers import ClassSerializer, ClassListSerializer


class ClassViewSet(viewsets.ModelViewSet):
    """
    ViewSet for class management.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['grade_level', 'branch', 'academic_year', 'is_active']
    search_fields = ['name', 'room_number']
    ordering_fields = ['grade_level', 'name', 'created_at']
    lookup_field = 'id'

    def get_queryset(self):
        school = get_current_tenant()
        if school:
            return Class.objects.filter(
                school=school, is_deleted=False
            ).select_related('academic_year', 'homeroom_teacher__user')
        return Class.objects.none()

    def get_serializer_class(self):
        if self.action == 'list':
            return ClassListSerializer
        return ClassSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSchoolAdmin()]
        return [IsSchoolMember()]

    def perform_create(self, serializer):
        school = get_current_tenant()
        serializer.save(school=school)
