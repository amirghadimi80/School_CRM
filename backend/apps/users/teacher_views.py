"""
Teacher dashboard and operations API views.
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.common.calendar import iran_weekday
from apps.common.permissions import IsTeacher
from apps.common.middleware.tenant import get_current_tenant
from apps.teachers.models import TeacherAssignment
from apps.schools.models import GeneratedSchedule
from apps.attendance.models import Attendance
from apps.grades.models import Grade


class TeacherDashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for teacher dashboard and operations.
    """
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def _get_academic_year(self, request):
        school = get_current_tenant()
        if school and school.current_academic_year:
            return school.current_academic_year
        return request.query_params.get('academic_year', str(timezone.now().year))
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get teacher dashboard data."""
        teacher = request.user.teacher_profile
        today = timezone.now().date()
        academic_year = self._get_academic_year(request)
        
        # Today's classes from schedule
        today_classes = GeneratedSchedule.objects.filter(
            teacher=teacher,
            day_of_week=iran_weekday(today),
            is_active=True
        ).select_related('course', 'class_assigned', 'period').order_by('period__period_number')
        
        # Get unique classes for this teacher
        teacher_assignments = TeacherAssignment.objects.filter(
            teacher=teacher,
            academic_year=academic_year
        ).select_related('class_assigned', 'course')
        
        classes_data = []
        for assignment in teacher_assignments:
            class_obj = assignment.class_assigned
            student_count = class_obj.students.filter(status='active').count()
            classes_data.append({
                'id': class_obj.id,
                'name': class_obj.name,
                'grade_level': class_obj.grade_level,
                'course': assignment.course.name,
                'student_count': student_count,
                'is_primary': assignment.is_primary_teacher,
            })
        
        # Today's schedule
        schedule_data = []
        for item in today_classes:
            student_count = item.class_assigned.students.filter(status='active').count()
            schedule_data.append({
                'id': item.id,
                'period': item.period.period_number,
                'course': item.course.name,
                'class_name': item.class_assigned.name,
                'class_id': item.class_assigned.id,
                'student_count': student_count,
                'start_time': item.period.start_time.strftime('%H:%M') if item.period.start_time else None,
                'end_time': item.period.end_time.strftime('%H:%M') if item.period.end_time else None,
            })
        
        # Weekly schedule summary
        weekly_schedule = GeneratedSchedule.objects.filter(
            teacher=teacher,
            is_active=True
        ).values('day_of_week').distinct().count()
        
        return Response({
            'teacher': {
                'id': teacher.id,
                'full_name': teacher.full_name,
                'specialization': teacher.specialization,
                'employee_id': teacher.employee_id,
            },
            'today_classes_count': len(schedule_data),
            'total_classes': len(classes_data),
            'today_schedule': schedule_data,
            'my_classes': classes_data,
            'working_days': weekly_schedule,
        })
    
    @action(detail=False, methods=['get'])
    def schedule(self, request):
        """Get teacher's weekly schedule."""
        teacher = request.user.teacher_profile
        
        schedules = GeneratedSchedule.objects.filter(
            teacher=teacher,
            is_active=True
        ).select_related('course', 'class_assigned', 'period').order_by('day_of_week', 'period__period_number')
        
        # Group by day
        days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']
        weekly_schedule = {day: [] for day in days}
        
        for item in schedules:
            day_name = days[item.day_of_week] if item.day_of_week < 7 else 'other'
            weekly_schedule[day_name].append({
                'id': item.id,
                'period': item.period.period_number,
                'course': item.course.name,
                'class_name': item.class_assigned.name,
                'class_id': item.class_assigned.id,
                'start_time': item.period.start_time.strftime('%H:%M') if item.period.start_time else None,
                'end_time': item.period.end_time.strftime('%H:%M') if item.period.end_time else None,
            })
        
        return Response({
            'schedule': weekly_schedule,
            'days': days,
        })
    
    @action(detail=False, methods=['get'])
    def classes(self, request):
        """Get teacher's assigned classes."""
        teacher = request.user.teacher_profile
        academic_year = self._get_academic_year(request)
        
        assignments = TeacherAssignment.objects.filter(
            teacher=teacher,
            academic_year=academic_year
        ).select_related('class_assigned', 'course')
        
        classes_data = []
        for assignment in assignments:
            class_obj = assignment.class_assigned
            student_count = class_obj.students.filter(status='active').count()
            classes_data.append({
                'id': class_obj.id,
                'name': class_obj.name,
                'grade_level': class_obj.grade_level,
                'course': assignment.course.name,
                'course_id': assignment.course.id,
                'student_count': student_count,
                'is_primary': assignment.is_primary_teacher,
            })
        
        return Response({'classes': classes_data})
    
    @action(detail=True, methods=['get'])
    def class_attendance(self, request, pk=None):
        """Get attendance for a specific class."""
        from apps.classes.models import Class
        
        teacher = request.user.teacher_profile
        school = get_current_tenant()
        class_obj = get_object_or_404(Class, id=pk, school=school)
        
        # Verify teacher teaches this class
        has_access = TeacherAssignment.objects.filter(
            teacher=teacher,
            class_assigned=class_obj
        ).exists()
        
        if not has_access:
            return Response(
                {'detail': 'You do not have access to this class'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        date_str = request.query_params.get('date')
        if date_str:
            from datetime import datetime
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            date = timezone.now().date()
        
        # Get students in class
        students = class_obj.students.filter(status='active')
        
        # Get attendance for this date
        attendances = Attendance.objects.filter(
            student__in=students,
            date=date
        ).select_related('student')
        
        attendance_map = {a.student.id: a.status for a in attendances}
        
        students_data = []
        for student in students:
            students_data.append({
                'id': student.id,
                'student_code': student.student_code,
                'full_name': student.full_name,
                'status': attendance_map.get(student.id, 'not_marked'),
            })
        
        return Response({
            'class': {
                'id': class_obj.id,
                'name': class_obj.name,
            },
            'date': date.strftime('%Y-%m-%d'),
            'students': students_data,
        })
    
    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        """Mark attendance for a class."""
        from apps.classes.models import Class
        from apps.students.models import Student
        
        teacher = request.user.teacher_profile
        school = get_current_tenant()
        class_obj = get_object_or_404(Class, id=pk, school=school)
        
        # Verify teacher teaches this class
        has_access = TeacherAssignment.objects.filter(
            teacher=teacher,
            class_assigned=class_obj
        ).exists()
        
        if not has_access:
            return Response(
                {'detail': 'You do not have access to this class'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        date_str = request.data.get('date')
        attendance_data = request.data.get('attendance', [])
        
        if date_str:
            from datetime import datetime
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            date = timezone.now().date()
        
        # Create or update attendance records
        for item in attendance_data:
            student_id = item.get('student_id')
            attendance_status = item.get('status')
            
            student = get_object_or_404(
                Student, id=student_id, school=school, current_class=class_obj
            )
            
            Attendance.objects.update_or_create(
                student=student,
                date=date,
                defaults={
                    'status': attendance_status,
                    'class_record': class_obj,
                    'recorded_by': request.user,
                    'school': school,
                }
            )
        
        return Response({'detail': 'Attendance marked successfully'})
    
    @action(detail=True, methods=['get'])
    def class_grades(self, request, pk=None):
        """Get grades for a specific class."""
        from apps.classes.models import Class
        
        teacher = request.user.teacher_profile
        school = get_current_tenant()
        class_obj = get_object_or_404(Class, id=pk, school=school)
        course_id = request.query_params.get('course_id')
        
        # Verify teacher teaches this class
        assignment = TeacherAssignment.objects.filter(
            teacher=teacher,
            class_assigned=class_obj
        ).first()
        
        if not assignment:
            return Response(
                {'detail': 'You do not have access to this class'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get students in class
        students = class_obj.students.filter(status='active')
        
        # Get grades for the course
        if course_id:
            grades = Grade.objects.filter(
                student__in=students,
                course_id=course_id
            ).select_related('student')
        else:
            grades = Grade.objects.filter(
                student__in=students
            ).select_related('student', 'course')
        
        # Group by student
        students_data = []
        for student in students:
            student_grades = [g for g in grades if g.student_id == student.id]
            grades_data = [{
                'id': g.id,
                'course': g.course.name,
                'course_id': g.course.id,
                'score': float(g.score),
                'max_score': float(g.max_score),
                'grade_type': g.exam_type,
                'date': g.exam_date.strftime('%Y-%m-%d'),
            } for g in student_grades]
            
            # Calculate average
            if grades_data:
                avg_score = sum(g['score'] for g in grades_data) / len(grades_data)
            else:
                avg_score = None
            
            students_data.append({
                'id': student.id,
                'student_code': student.student_code,
                'full_name': student.full_name,
                'grades': grades_data,
                'average': round(avg_score, 2) if avg_score else None,
            })
        
        return Response({
            'class': {
                'id': class_obj.id,
                'name': class_obj.name,
            },
            'course': assignment.course.name if not course_id else None,
            'students': students_data,
        })
    
    @action(detail=True, methods=['post'])
    def add_grade(self, request, pk=None):
        """Add grade for a student in a class."""
        from apps.classes.models import Class
        from apps.students.models import Student
        
        teacher = request.user.teacher_profile
        school = get_current_tenant()
        class_obj = get_object_or_404(Class, id=pk, school=school)
        
        # Verify teacher teaches this class
        assignment = TeacherAssignment.objects.filter(
            teacher=teacher,
            class_assigned=class_obj
        ).first()
        
        if not assignment:
            return Response(
                {'detail': 'You do not have access to this class'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        student_id = request.data.get('student_id')
        score = request.data.get('score')
        max_score = request.data.get('max_score', 20)
        grade_type = request.data.get('grade_type') or request.data.get('exam_type') or Grade.EXAM_TYPE_OTHER
        valid_types = {choice for choice, _label in Grade.EXAM_TYPE_CHOICES}
        if grade_type not in valid_types:
            grade_type = Grade.EXAM_TYPE_OTHER
        description = request.data.get('description', '')
        
        student = get_object_or_404(Student, id=student_id, school=school)
        
        grade = Grade.objects.create(
            student=student,
            course=assignment.course,
            class_record=class_obj,
            score=score,
            max_score=max_score,
            exam_type=grade_type,
            notes=description,
            exam_date=request.data.get('date') or timezone.now().date(),
            academic_year=self._get_academic_year(request),
            term=request.data.get('term') or '',
            recorded_by=request.user,
            school=school,
        )
        
        return Response({
            'detail': 'Grade added successfully',
            'grade_id': grade.id,
        })
