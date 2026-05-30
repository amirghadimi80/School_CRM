"""
Analytics and reporting models.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import TimestampModel


class DashboardStat(TimestampModel):
    """
    Pre-calculated dashboard statistics.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='dashboard_stats',
        verbose_name=_('School')
    )
    
    STAT_TYPE_STUDENTS = 'students'
    STAT_TYPE_TEACHERS = 'teachers'
    STAT_TYPE_CLASSES = 'classes'
    STAT_TYPE_ATTENDANCE = 'attendance'
    STAT_TYPE_FINANCE = 'finance'
    STAT_TYPE_GRADES = 'grades'
    
    STAT_TYPE_CHOICES = [
        (STAT_TYPE_STUDENTS, _('Students')),
        (STAT_TYPE_TEACHERS, _('Teachers')),
        (STAT_TYPE_CLASSES, _('Classes')),
        (STAT_TYPE_ATTENDANCE, _('Attendance')),
        (STAT_TYPE_FINANCE, _('Finance')),
        (STAT_TYPE_GRADES, _('Grades')),
    ]
    
    stat_type = models.CharField(
        max_length=20,
        choices=STAT_TYPE_CHOICES,
        verbose_name=_('Statistic Type')
    )
    
    # Date range
    date = models.DateField(verbose_name=_('Date'))
    period = models.CharField(
        max_length=20,
        default='daily',
        verbose_name=_('Period'),
        help_text=_('daily, weekly, monthly, yearly')
    )
    
    # Values
    total_count = models.PositiveIntegerField(default=0)
    active_count = models.PositiveIntegerField(default=0)
    change_from_previous = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Change from Previous Period')
    )
    
    # JSON for detailed breakdown
    details = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Details')
    )
    
    class Meta:
        verbose_name = _('Dashboard Statistic')
        verbose_name_plural = _('Dashboard Statistics')
        ordering = ['-date']
        unique_together = ['school', 'stat_type', 'date', 'period']
        indexes = [
            models.Index(fields=['school', 'stat_type', 'date']),
            models.Index(fields=['date', 'period']),
        ]
    
    def __str__(self):
        return f"{self.school} - {self.get_stat_type_display()} - {self.date}"


class SchoolActivityLog(TimestampModel):
    """
    Audit log for school activities.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='activity_logs',
        verbose_name=_('School')
    )
    user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs',
        verbose_name=_('User')
    )
    
    # Action details
    action = models.CharField(
        max_length=100,
        verbose_name=_('Action')
    )
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    # Target object
    object_type = models.CharField(
        max_length=100,
        verbose_name=_('Object Type')
    )
    object_id = models.CharField(
        max_length=100,
        verbose_name=_('Object ID')
    )
    object_repr = models.CharField(
        max_length=500,
        blank=True,
        verbose_name=_('Object Representation')
    )
    
    # Changes
    changes = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Changes'),
        help_text=_('Old and new values of changed fields')
    )
    
    # IP and user agent
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_('IP Address')
    )
    user_agent = models.TextField(
        blank=True,
        verbose_name=_('User Agent')
    )
    
    class Meta:
        verbose_name = _('Activity Log')
        verbose_name_plural = _('Activity Logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['school', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['object_type', 'object_id']),
        ]
    
    def __str__(self):
        return f"{self.action} - {self.object_type} - {self.created_at}"
