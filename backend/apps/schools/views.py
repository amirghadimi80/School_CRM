"""
School API views.
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
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
    
    @action(detail=True, methods=['patch'], url_path='settings')
    def update_settings(self, request, slug=None):
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

    Academic years are defined and managed by super admins through the Django
    admin panel. School admins can only list the years that are made visible to
    them and choose which one is current (``set_current``). Creating, editing or
    deleting years through the API is therefore disabled.
    """
    serializer_class = AcademicYearSerializer
    permission_classes = [IsSchoolAdmin]
    
    def get_queryset(self):
        school = get_current_tenant()
        if school:
            return AcademicYear.objects.filter(school=school, is_visible=True)
        return AcademicYear.objects.none()

    def create(self, request, *args, **kwargs):
        return Response(
            {'detail': _('Academic years are managed by the system administrator.')},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def update(self, request, *args, **kwargs):
        return Response(
            {'detail': _('Academic years are managed by the system administrator.')},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return Response(
            {'detail': _('Academic years are managed by the system administrator.')},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    @action(detail=True, methods=['post'])
    def set_current(self, request, pk=None):
        """Set this academic year as the current year."""
        academic_year = self.get_object()
        if not academic_year.is_active:
            return Response(
                {'detail': _('This academic year is inactive and cannot be selected.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        academic_year.is_current = True
        academic_year.save()
        return Response({'status': 'success', 'is_current': True})
    
    @action(detail=True, methods=['post'])
    def copy_classes(self, request, pk=None):
        """Copy classes from another academic year."""
        target_year = self.get_object()
        source_year_id = request.data.get('source_year_id')
        
        if not source_year_id:
            return Response(
                {'detail': 'source_year_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            source_year = AcademicYear.objects.get(id=source_year_id)
        except AcademicYear.DoesNotExist:
            return Response(
                {'detail': 'Source academic year not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Copy classes from source year
        from apps.classes.models import Class
        source_classes = Class.objects.filter(academic_year=source_year)
        
        copied_count = 0
        for cls in source_classes:
            # Create new class for target year
            Class.objects.create(
                school=cls.school,
                name=cls.name,
                grade_level=cls.grade_level,
                academic_year=target_year,
                room_number=cls.room_number,
                capacity=cls.capacity,
                homeroom_teacher=cls.homeroom_teacher,
                schedule={},  # Reset schedule
                is_active=True,
            )
            copied_count += 1
        
        return Response({
            'status': 'success',
            'copied_count': copied_count
        })
    
    @action(detail=True, methods=['post'])
    def rollover_students(self, request, pk=None):
        """Roll over active students from previous year."""
        target_year = self.get_object()
        
        # Find previous year
        previous_year = AcademicYear.objects.filter(
            school=target_year.school,
            end_date__lt=target_year.start_date
        ).order_by('-end_date').first()
        
        if not previous_year:
            return Response(
                {'detail': 'No previous academic year found.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get active enrollments from previous year
        from apps.students.models import StudentEnrollment
        previous_enrollments = StudentEnrollment.objects.filter(
            academic_year=previous_year,
            status=StudentEnrollment.STATUS_ACTIVE
        )
        
        enrolled_count = 0
        for enrollment in previous_enrollments:
            # Create new enrollment for target year
            StudentEnrollment.objects.get_or_create(
                student=enrollment.student,
                academic_year=target_year,
                defaults={
                    'class_assigned': None,  # Students need to be reassigned
                    'status': StudentEnrollment.STATUS_ACTIVE,
                    'is_rollover': True,
                }
            )
            enrolled_count += 1
        
        return Response({
            'status': 'success',
            'enrolled_count': enrolled_count
        })


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
                if int(grade) >= 10:
                    if branch:
                        queryset = queryset.filter(branch=branch)
                else:
                    queryset = queryset.filter(branch__isnull=True)
            elif branch:
                queryset = queryset.filter(branch=branch)
            return queryset.select_related('course')
        return Curriculum.objects.none()
    
    def perform_create(self, serializer):
        school = get_current_tenant()
        serializer.save(school=school)

    @action(detail=False, methods=['get'])
    def official_template(self, request):
        """Get official curriculum template for a grade/branch."""
        grade_level = request.query_params.get('grade_level')
        branch = request.query_params.get('branch')
        if not grade_level:
            return Response({'detail': 'grade_level is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if int(grade_level) >= 10 and not branch:
            return Response({'detail': 'branch is required for grades 10-12.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.classes.models import Course
        from .official_curriculum import get_official_template

        template = get_official_template(grade_level, branch)
        items = []
        for item in template:
            course = Course.objects.filter(
                code=item['course_code'], school__isnull=True, is_active=True
            ).first()
            items.append({
                **item,
                'course_id': course.id if course else None,
                'course_name': course.name if course else item['course_code'],
                'found': course is not None,
            })
        return Response({'grade_level': grade_level, 'branch': branch, 'items': items})

    @action(detail=False, methods=['post'])
    def ensure_official(self, request):
        """Auto-fill school curriculum with official courses (adds missing only)."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)

        grade_level = request.data.get('grade_level')
        branch = request.data.get('branch')
        if not grade_level:
            return Response({'detail': 'grade_level is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if int(grade_level) >= 10 and not branch:
            return Response({'detail': 'branch is required for grades 10-12.'}, status=status.HTTP_400_BAD_REQUEST)

        from .official_curriculum import ensure_official_curriculum
        result = ensure_official_curriculum(school, grade_level, branch)

        queryset = Curriculum.objects.filter(
            school=school, grade_level=grade_level,
        )
        if int(grade_level) >= 10:
            queryset = queryset.filter(branch=branch)
        else:
            queryset = queryset.filter(branch__isnull=True)

        serializer = CurriculumSerializer(queryset.select_related('course'), many=True)
        return Response({
            **result,
            'entries': serializer.data,
        })
    
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
        """Generate schedule for a class using teacher assignments."""
        school = get_current_tenant()
        if not school:
            return Response({'detail': 'No active school.'}, status=status.HTTP_404_NOT_FOUND)

        class_id = request.data.get('class_id')
        academic_year = request.data.get('academic_year', school.current_academic_year)
        regenerate = request.data.get('regenerate', False)

        if not class_id:
            return Response({'detail': 'class_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.classes.models import Class
        from apps.teachers.services.schedule_generator import generate_class_schedule

        try:
            class_obj = Class.objects.get(id=class_id, school=school)
        except Class.DoesNotExist:
            return Response({'detail': 'Class not found.'}, status=status.HTTP_404_NOT_FOUND)

        result = generate_class_schedule(
            class_obj, school, academic_year, regenerate=regenerate
        )

        if not result.get('success'):
            return Response(
                {
                    'detail': 'امکان تولید برنامه وجود ندارد.',
                    'errors': result.get('errors', []),
                    'warnings': result.get('warnings', []),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            'generated': result['generated'],
            'schedules': result['schedules'],
            'unplaced_hours': result.get('unplaced_hours', []),
            'warnings': result.get('warnings', []),
            'status': result.get('status', 'complete'),
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
