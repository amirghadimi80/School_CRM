"""
Student dashboard and operations API views.
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models

from apps.common.permissions import IsStudent
from apps.schools.models import GeneratedSchedule
from apps.attendance.models import Attendance
from apps.grades.models import Grade
from apps.finance.models import Invoice, Payment


class StudentDashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for student dashboard and operations.
    """
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get student dashboard data."""
        student = request.user.student_profile
        today = timezone.now().date()
        
        # Today's schedule
        if student.current_class:
            today_schedules = GeneratedSchedule.objects.filter(
                class_assigned=student.current_class,
                day_of_week=today.weekday(),
                is_active=True
            ).select_related('course', 'teacher', 'period').order_by('period__period_number')
        else:
            today_schedules = []
        
        schedule_data = []
        for item in today_schedules:
            schedule_data.append({
                'id': item.id,
                'period': item.period.period_number,
                'course': item.course.name,
                'teacher': item.teacher.full_name if item.teacher else 'N/A',
                'start_time': item.period.start_time.strftime('%H:%M') if item.period.start_time else None,
                'end_time': item.period.end_time.strftime('%H:%M') if item.period.end_time else None,
            })
        
        # GPA
        grades = Grade.objects.filter(student=student)
        if grades.exists():
            gpa = round(grades.aggregate(models.Avg('score'))['score__avg'], 2)
        else:
            gpa = None
        
        # Attendance rate
        total_attendance = Attendance.objects.filter(student=student).count()
        if total_attendance > 0:
            present_count = Attendance.objects.filter(
                student=student,
                status=Attendance.STATUS_PRESENT
            ).count()
            attendance_rate = round((present_count / total_attendance) * 100, 1)
        else:
            attendance_rate = 100
        
        # Financial status
        invoices = Invoice.objects.filter(student=student)
        total_due = sum(inv.balance for inv in invoices)
        
        # Recent absences
        recent_absences = Attendance.objects.filter(
            student=student,
            status__in=[Attendance.STATUS_ABSENT, Attendance.STATUS_LATE]
        ).order_by('-date')[:5]
        
        absences_data = [{
            'date': a.date.strftime('%Y-%m-%d'),
            'status': a.status,
            'course': a.class_schedule.course.name if a.class_schedule else 'N/A',
        } for a in recent_absences]
        
        return Response({
            'student': {
                'id': student.id,
                'student_code': student.student_code,
                'full_name': student.full_name,
                'grade_level': student.grade_level,
                'class_name': student.current_class.name if student.current_class else None,
                'class_id': student.current_class.id if student.current_class else None,
            },
            'today_schedule': schedule_data,
            'gpa': gpa,
            'attendance_rate': attendance_rate,
            'financial_balance': float(total_due),
            'recent_absences': absences_data,
        })
    
    @action(detail=False, methods=['get'])
    def schedule(self, request):
        """Get student's weekly schedule."""
        student = request.user.student_profile
        
        if not student.current_class:
            return Response({'schedule': [], 'message': 'Not assigned to any class'})
        
        schedules = GeneratedSchedule.objects.filter(
            class_assigned=student.current_class,
            is_active=True
        ).select_related('course', 'teacher', 'period').order_by('day_of_week', 'period__period_number')
        
        # Group by day
        days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']
        weekly_schedule = {day: [] for day in days}
        
        for item in schedules:
            day_name = days[item.day_of_week] if item.day_of_week < 7 else 'other'
            weekly_schedule[day_name].append({
                'id': item.id,
                'period': item.period.period_number,
                'course': item.course.name,
                'course_id': item.course.id,
                'teacher': item.teacher.full_name if item.teacher else 'N/A',
                'teacher_id': item.teacher.id if item.teacher else None,
                'start_time': item.period.start_time.strftime('%H:%M') if item.period.start_time else None,
                'end_time': item.period.end_time.strftime('%H:%M') if item.period.end_time else None,
            })
        
        return Response({
            'schedule': weekly_schedule,
            'days': days,
            'class_name': student.current_class.name,
        })
    
    @action(detail=False, methods=['get'])
    def grades(self, request):
        """Get student's grades and transcript."""
        student = request.user.student_profile
        
        grades = Grade.objects.filter(
            student=student
        ).select_related('course', 'class_assigned').order_by('-date')
        
        # Group by course
        from django.db.models import Avg
        course_stats = grades.values('course__name', 'course__id').annotate(
            avg_score=Avg('score'),
            count=models.Count('id')
        )
        
        grades_data = []
        for grade in grades:
            grades_data.append({
                'id': grade.id,
                'course': grade.course.name,
                'course_id': grade.course.id,
                'score': grade.score,
                'max_score': grade.max_score,
                'percentage': round((grade.score / grade.max_score) * 100, 1),
                'grade_type': grade.grade_type,
                'description': grade.description,
                'date': grade.date.strftime('%Y-%m-%d'),
                'class_name': grade.class_assigned.name if grade.class_assigned else None,
            })
        
        # Calculate overall GPA
        if grades.exists():
            overall_gpa = round(grades.aggregate(Avg('score'))['score__avg'], 2)
            total_courses = grades.values('course').distinct().count()
        else:
            overall_gpa = None
            total_courses = 0
        
        # Course averages
        courses_summary = []
        for stat in course_stats:
            courses_summary.append({
                'course_name': stat['course__name'],
                'course_id': stat['course__id'],
                'average': round(stat['avg_score'], 2),
                'count': stat['count'],
            })
        
        return Response({
            'student': {
                'full_name': student.full_name,
                'student_code': student.student_code,
            },
            'grades': grades_data,
            'overall_gpa': overall_gpa,
            'total_courses': total_courses,
            'courses_summary': courses_summary,
        })
    
    @action(detail=False, methods=['get'])
    def attendance(self, request):
        """Get student's attendance records."""
        student = request.user.student_profile
        
        # Get query params
        month = request.query_params.get('month')
        year = request.query_params.get('year', str(timezone.now().year))
        
        attendances = Attendance.objects.filter(
            student=student
        ).select_related('class_record').order_by('-date')
        
        if month:
            attendances = attendances.filter(date__month=month, date__year=year)
        else:
            # Default to current month
            attendances = attendances.filter(
                date__month=timezone.now().month,
                date__year=timezone.now().year
            )
        
        attendance_data = []
        for a in attendances:
            attendance_data.append({
                'id': a.id,
                'date': a.date.strftime('%Y-%m-%d'),
                'status': a.status,
                'status_display': a.get_status_display(),
                'class_name': a.class_record.name if a.class_record else 'N/A',
                'notes': a.notes,
            })
        
        # Calculate statistics
        total = attendances.count()
        if total > 0:
            present = attendances.filter(status=Attendance.STATUS_PRESENT).count()
            absent = attendances.filter(status=Attendance.STATUS_ABSENT).count()
            late = attendances.filter(status=Attendance.STATUS_LATE).count()
            excused = attendances.filter(status=Attendance.STATUS_EXCUSED).count()
            
            stats = {
                'total': total,
                'present': present,
                'absent': absent,
                'late': late,
                'excused': excused,
                'attendance_rate': round((present / total) * 100, 1),
            }
        else:
            stats = {'total': 0, 'present': 0, 'absent': 0, 'late': 0, 'excused': 0, 'attendance_rate': 100}
        
        return Response({
            'attendance': attendance_data,
            'statistics': stats,
            'month': month or timezone.now().month,
            'year': year,
        })
    
    @action(detail=False, methods=['get'])
    def finance(self, request):
        """Get student's financial status."""
        student = request.user.student_profile
        
        invoices = Invoice.objects.filter(
            student=student
        ).order_by('-due_date')
        
        payments = Payment.objects.filter(
            invoice__student=student
        ).order_by('-payment_date')
        
        invoices_data = []
        for inv in invoices:
            invoices_data.append({
                'id': inv.id,
                'invoice_number': inv.invoice_number,
                'fee_type': inv.fee_type.name if inv.fee_type else 'N/A',
                'amount': float(inv.total_amount),
                'paid_amount': float(inv.paid_amount),
                'balance': float(inv.balance),
                'status': inv.status,
                'issue_date': inv.issue_date.strftime('%Y-%m-%d'),
                'due_date': inv.due_date.strftime('%Y-%m-%d'),
            })
        
        payments_data = []
        for pay in payments:
            payments_data.append({
                'id': pay.id,
                'amount': float(pay.amount),
                'payment_date': pay.payment_date.strftime('%Y-%m-%d'),
                'payment_method': pay.payment_method,
                'reference': pay.reference,
                'invoice_number': pay.invoice.invoice_number,
            })
        
        # Calculate totals
        total_invoiced = sum(inv.total_amount for inv in invoices)
        total_paid = sum(inv.paid_amount for inv in invoices)
        total_balance = total_invoiced - total_paid
        
        return Response({
            'student': {
                'full_name': student.full_name,
                'student_code': student.student_code,
            },
            'summary': {
                'total_invoiced': float(total_invoiced),
                'total_paid': float(total_paid),
                'total_balance': float(total_balance),
            },
            'invoices': invoices_data,
            'payments': payments_data,
        })


from django.db import models
