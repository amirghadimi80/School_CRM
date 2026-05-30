"""
Attendance tracking models.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import BaseModel


class Attendance(BaseModel):
    """
    Daily attendance record for students.
    """
    
    # Status choices
    STATUS_PRESENT = 'present'
    STATUS_ABSENT = 'absent'
    STATUS_LATE = 'late'
    STATUS_EXCUSED = 'excused'
    STATUS_SICK = 'sick'
    
    STATUS_CHOICES = [
        (STATUS_PRESENT, _('Present')),
        (STATUS_ABSENT, _('Absent')),
        (STATUS_LATE, _('Late')),
        (STATUS_EXCUSED, _('Excused')),
        (STATUS_SICK, _('Sick')),
    ]
    
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='attendance_records',
        verbose_name=_('Student')
    )
    class_record = models.ForeignKey(
        'classes.Class',
        on_delete=models.CASCADE,
        related_name='attendance_records',
        verbose_name=_('Class')
    )
    
    # Date and time
    date = models.DateField(verbose_name=_('Date'))
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PRESENT,
        verbose_name=_('Status')
    )
    
    # For late arrivals
    arrival_time = models.TimeField(
        null=True,
        blank=True,
        verbose_name=_('Arrival Time')
    )
    minutes_late = models.PositiveSmallIntegerField(
        default=0,
        verbose_name=_('Minutes Late')
    )
    
    # Who recorded this
    recorded_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_attendance',
        verbose_name=_('Recorded By')
    )
    
    # Notes
    notes = models.TextField(
        blank=True,
        verbose_name=_('Notes')
    )
    
    # SMS notification sent
    sms_sent = models.BooleanField(
        default=False,
        verbose_name=_('SMS Sent')
    )
    sms_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('SMS Sent At')
    )
    
    class Meta:
        verbose_name = _('Attendance Record')
        verbose_name_plural = _('Attendance Records')
        ordering = ['-date', 'student__student_code']
        unique_together = ['student', 'date']
        indexes = [
            models.Index(fields=['class_record', 'date']),
            models.Index(fields=['student', 'date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.student.student_code} - {self.date} - {self.get_status_display()}"
    
    @property
    def school(self):
        return self.student.school
    
    def save(self, *args, **kwargs):
        # Auto-calculate minutes late if arrival time provided
        if self.arrival_time and self.status == self.STATUS_LATE:
            from datetime import datetime, time
            class_start = time(8, 0)  # Assume 8:00 AM start
            arrival = datetime.combine(self.date, self.arrival_time)
            start = datetime.combine(self.date, class_start)
            diff = arrival - start
            self.minutes_late = max(0, int(diff.total_seconds() / 60))
        super().save(*args, **kwargs)


class AttendanceStats(models.Model):
    """
    Pre-calculated attendance statistics for performance.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='attendance_stats',
        verbose_name=_('School')
    )
    class_record = models.ForeignKey(
        'classes.Class',
        on_delete=models.CASCADE,
        related_name='attendance_stats',
        verbose_name=_('Class')
    )
    
    # Date range
    start_date = models.DateField(verbose_name=_('Start Date'))
    end_date = models.DateField(verbose_name=_('End Date'))
    
    # Stats
    total_students = models.PositiveIntegerField(verbose_name=_('Total Students'))
    total_days = models.PositiveIntegerField(verbose_name=_('Total Days'))
    
    present_count = models.PositiveIntegerField(default=0)
    absent_count = models.PositiveIntegerField(default=0)
    late_count = models.PositiveIntegerField(default=0)
    excused_count = models.PositiveIntegerField(default=0)
    sick_count = models.PositiveIntegerField(default=0)
    
    attendance_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name=_('Attendance Rate %')
    )
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Attendance Statistics')
        verbose_name_plural = _('Attendance Statistics')
        ordering = ['-end_date']
        unique_together = ['class_record', 'start_date', 'end_date']
    
    def __str__(self):
        return f"{self.class_record} - {self.start_date} to {self.end_date}"


class AbsenceAlert(models.Model):
    """
    Alerts for students with excessive absences.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='absence_alerts',
        verbose_name=_('School')
    )
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='absence_alerts',
        verbose_name=_('Student')
    )
    
    consecutive_absences = models.PositiveSmallIntegerField(
        verbose_name=_('Consecutive Absences')
    )
    total_absences_month = models.PositiveSmallIntegerField(
        verbose_name=_('Total Absences This Month')
    )
    
    alert_date = models.DateField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_alerts',
        verbose_name=_('Resolved By')
    )
    
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    class Meta:
        verbose_name = _('Absence Alert')
        verbose_name_plural = _('Absence Alerts')
        ordering = ['-alert_date']
    
    def __str__(self):
        return f"Alert: {self.student.student_code} - {self.consecutive_absences} consecutive absences"
