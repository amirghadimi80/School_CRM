"""
School API views.
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.common.permissions import IsSuperAdmin, IsSchoolAdmin, IsSchoolMember
from apps.common.middleware.tenant import get_current_tenant
from .models import (
    School, AcademicYear, Term,
    Period, Curriculum, TeacherAvailability,
    TeacherSpecialization, GeneratedSchedule
)
from .serializers import (
    SchoolSerializer, SchoolListSerializer, SchoolCreateSerializer,
    AcademicYearSerializer, TermSerializer, SchoolSettingsSerializer,
    PeriodSerializer, CurriculumSerializer, TeacherAvailabilitySerializer,
    TeacherSpecializationSerializer, GeneratedScheduleSerializer
)


class SchoolViewSet(viewsets.ModelViewSet):
    """
    ViewSet for School management.
    """
    serializer_class = SchoolSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return School.objects.all()
        return School.objects.filter(users=user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SchoolListSerializer
        if self.action == 'create':
            return SchoolCreateSerializer
        return SchoolSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsSuperAdmin()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsSchoolAdmin()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current school (tenant)."""
        school = get_current_tenant()
        if not school:
            return Response(
                {'detail': 'No active school/tenant found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = SchoolSerializer(school)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def settings(self, request, slug=None):
        """Update school settings only."""
        school = self.get_object()
        serializer = SchoolSettingsSerializer(school, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, slug=None):
        """Activate/deactivate school."""
        school = self.get_object()
        school.is_active = request.data.get('is_active', True)
        school.save(update_fields=['is_active'])
        return Response({'status': 'success', 'is_active': school.is_active})


class AcademicYearViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AcademicYear management.
    """
    serializer_class = AcademicYearSerializer
    permission_classes = [IsSchoolAdmin]
    
    def get_queryset(self):
        school = get_current_tenant()
        if school:
            return AcademicYear.objects.filter(school=school)
        return AcademicYear.objects.none()
    
    def perform_create(self, serializer):
        school = get_current_tenant()
        serializer.save(school=school)


class TermViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Term management.
    """
    serializer_class = TermSerializer
    permission_classes = [IsSchoolAdmin]
    
    def get_queryset(self):
        school = get_current_tenant()
        if school:
            return Term.objects.filter(academic_year__school=school)
        return Term.objects.none()
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current term."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)
        
        term = Term.objects.filter(
            academic_year__school=school,
            is_current=True
        ).first()
        
        if not term:
            return Response({'detail': 'No current term found.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = TermSerializer(term)
        return Response(serializer.data)


class PeriodViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Period management.
    """
    serializer_class = PeriodSerializer
    permission_classes = [IsSchoolAdmin]
    
    def get_queryset(self):
        school = get_current_tenant()
        if school:
            return Period.objects.filter(school=school)
        return Period.objects.none()
    
    def perform_create(self, serializer):
        school = get_current_tenant()
        serializer.save(school=school)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Auto-generate periods based on school settings."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Delete existing periods
        Period.objects.filter(school=school).delete()
        
        # Generate new periods
        from datetime import datetime, timedelta
        start_time = datetime.combine(datetime.today(), school.school_start_time)
        
        for i in range(1, school.periods_per_day + 1):
            end_time = start_time + timedelta(minutes=school.period_duration_minutes)
            Period.objects.create(
                school=school,
                period_number=i,
                start_time=start_time.time(),
                end_time=end_time.time()
            )
            start_time = end_time
        
        serializer = PeriodSerializer(school.periods.all(), many=True)
        return Response(serializer.data)


class CurriculumViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Curriculum management.
    """
    serializer_class = CurriculumSerializer
    permission_classes = [IsSchoolAdmin]
    
    def get_queryset(self):
        school = get_current_tenant()
        if school:
            queryset = Curriculum.objects.filter(school=school)
            grade = self.request.query_params.get('grade_level')
            branch = self.request.query_params.get('branch')
            if grade:
                queryset = queryset.filter(grade_level=grade)
            if branch:
                queryset = queryset.filter(branch=branch)
            return queryset
        return Curriculum.objects.none()
    
    def perform_create(self, serializer):
        school = get_current_tenant()
        serializer.save(school=school)
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple curriculum entries at once."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)
        
        entries = request.data.get('entries', [])
        created = []
        for entry in entries:
            entry['school'] = school.id
            serializer = CurriculumSerializer(data=entry)
            if serializer.is_valid():
                serializer.save()
                created.append(serializer.data)
        
        return Response({'created': len(created), 'entries': created})


class TeacherAvailabilityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TeacherAvailability management.
    """
    serializer_class = TeacherAvailabilitySerializer
    permission_classes = [IsSchoolAdmin]
    
    def get_queryset(self):
        school = get_current_tenant()
        if school:
            queryset = TeacherAvailability.objects.filter(teacher__school=school)
            teacher_id = self.request.query_params.get('teacher')
            if teacher_id:
                queryset = queryset.filter(teacher_id=teacher_id)
            return queryset
        return TeacherAvailability.objects.none()


class TeacherSpecializationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TeacherSpecialization management.
    """
    serializer_class = TeacherSpecializationSerializer
    permission_classes = [IsSchoolAdmin]
    
    def get_queryset(self):
        school = get_current_tenant()
        if school:
            queryset = TeacherSpecialization.objects.filter(teacher__school=school)
            teacher_id = self.request.query_params.get('teacher')
            if teacher_id:
                queryset = queryset.filter(teacher_id=teacher_id)
            return queryset
        return TeacherSpecialization.objects.none()


class GeneratedScheduleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for GeneratedSchedule management.
    """
    serializer_class = GeneratedScheduleSerializer
    permission_classes = [IsSchoolAdmin]
    
    def get_queryset(self):
        school = get_current_tenant()
        if school:
            queryset = GeneratedSchedule.objects.filter(class_assigned__school=school)
            class_id = self.request.query_params.get('class_id')
            teacher_id = self.request.query_params.get('teacher')
            day = self.request.query_params.get('day')
            
            if class_id:
                queryset = queryset.filter(class_assigned_id=class_id)
            if teacher_id:
                queryset = queryset.filter(teacher_id=teacher_id)
            if day:
                queryset = queryset.filter(day_of_week=day)
            
            return queryset.select_related('class_assigned', 'course', 'teacher', 'period')
        return GeneratedSchedule.objects.none()
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate schedule for a class."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)
        
        class_id = request.data.get('class_id')
        academic_year = request.data.get('academic_year', school.current_academic_year)
        
        if not class_id:
            return Response({'detail': 'class_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.classes.models import Class
        try:
            class_obj = Class.objects.get(id=class_id, school=school)
        except Class.DoesNotExist:
            return Response({'detail': 'Class not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get curriculum for this class
        branch = None
        if hasattr(class_obj, 'branch'):
            branch = class_obj.branch
        
        curriculum = Curriculum.objects.filter(
            school=school,
            grade_level=class_obj.grade_level,
            branch=branch
        )
        
        # Simple scheduling algorithm
        periods = list(Period.objects.filter(school=school).order_by('period_number'))
        days = range(6)  # Saturday to Friday
        
        generated = []
        for entry in curriculum:
            hours_needed = entry.weekly_hours
            for day in days:
                if hours_needed <= 0:
                    break
                for period in periods:
                    if hours_needed <= 0:
                        break
                    
                    # Check if slot is available
                    existing = GeneratedSchedule.objects.filter(
                        class_assigned=class_obj,
                        day_of_week=day,
                        period=period,
                        academic_year=academic_year
                    ).first()
                    
                    if not existing:
                        # Find available teacher
                        teacher_spec = TeacherSpecialization.objects.filter(
                            course=entry.course,
                            grade_levels__contains=[class_obj.grade_level]
                        ).first()
                        
                        if teacher_spec:
                            # Check teacher availability
                            avail = TeacherAvailability.objects.filter(
                                teacher=teacher_spec.teacher,
                                day_of_week=day,
                                periods__contains=[period.period_number]
                            ).first()
                            
                            if avail:
                                # Check for teacher conflicts
                                teacher_conflict = GeneratedSchedule.objects.filter(
                                    teacher=teacher_spec.teacher,
                                    day_of_week=day,
                                    period=period,
                                    academic_year=academic_year
                                ).first()
                                
                                if not teacher_conflict:
                                    schedule = GeneratedSchedule.objects.create(
                                        class_assigned=class_obj,
                                        course=entry.course,
                                        teacher=teacher_spec.teacher,
                                        day_of_week=day,
                                        period=period,
                                        academic_year=academic_year
                                    )
                                    generated.append(schedule)
                                    hours_needed -= 1
        
        serializer = GeneratedScheduleSerializer(generated, many=True)
        return Response({
            'generated': len(generated),
            'schedules': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def by_class(self, request):
        """Get schedule organized by class."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)
        
        from apps.classes.models import Class
        classes = Class.objects.filter(school=school, is_active=True)
        academic_year = request.query_params.get('academic_year', school.current_academic_year)
        
        result = {}
        for class_obj in classes:
            schedules = GeneratedSchedule.objects.filter(
                class_assigned=class_obj,
                academic_year=academic_year,
                is_active=True
            ).select_related('course', 'teacher', 'period')
            
            result[class_obj.id] = {
                'class_name': class_obj.name,
                'grade_level': class_obj.grade_level,
                'schedules': GeneratedScheduleSerializer(schedules, many=True).data
            }
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def by_teacher(self, request):
        """Get schedule organized by teacher."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)
        
        from apps.teachers.models import Teacher
        teachers = Teacher.objects.filter(school=school, status='active')
        academic_year = request.query_params.get('academic_year', school.current_academic_year)
        
        result = {}
        for teacher in teachers:
            schedules = GeneratedSchedule.objects.filter(
                teacher=teacher,
                academic_year=academic_year,
                is_active=True
            ).select_related('class_assigned', 'course', 'period')
            
            result[teacher.id] = {
                'teacher_name': teacher.full_name,
                'schedules': GeneratedScheduleSerializer(schedules, many=True).data
            }
        
        return Response(result)
