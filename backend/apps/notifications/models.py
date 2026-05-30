"""
Notification models for SMS, email, and in-app notifications.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.core.models import TimestampModel


class Notification(TimestampModel):
    """
    In-app notification model.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('School')
    )
    recipient = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('Recipient')
    )
    
    # Type
    TYPE_ATTENDANCE = 'attendance'
    TYPE_GRADE = 'grade'
    TYPE_PAYMENT = 'payment'
    TYPE_ANNOUNCEMENT = 'announcement'
    TYPE_MESSAGE = 'message'
    TYPE_ALERT = 'alert'
    TYPE_OTHER = 'other'
    
    TYPE_CHOICES = [
        (TYPE_ATTENDANCE, _('Attendance')),
        (TYPE_GRADE, _('Grade')),
        (TYPE_PAYMENT, _('Payment')),
        (TYPE_ANNOUNCEMENT, _('Announcement')),
        (TYPE_MESSAGE, _('Message')),
        (TYPE_ALERT, _('Alert')),
        (TYPE_OTHER, _('Other')),
    ]
    
    notification_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default=TYPE_OTHER,
        verbose_name=_('Type')
    )
    
    # Content
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    body = models.TextField(verbose_name=_('Body'))
    
    # Link/Action
    action_url = models.CharField(
        max_length=500,
        blank=True,
        verbose_name=_('Action URL')
    )
    action_type = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_('Action Type')
    )
    
    # Related objects
    related_object_type = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Related Object Type')
    )
    related_object_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Related Object ID')
    )
    
    # Status
    is_read = models.BooleanField(default=False, verbose_name=_('Is Read'))
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Read At')
    )
    
    # Priority
    PRIORITY_LOW = 'low'
    PRIORITY_NORMAL = 'normal'
    PRIORITY_HIGH = 'high'
    PRIORITY_URGENT = 'urgent'
    
    PRIORITY_CHOICES = [
        (PRIORITY_LOW, _('Low')),
        (PRIORITY_NORMAL, _('Normal')),
        (PRIORITY_HIGH, _('High')),
        (PRIORITY_URGENT, _('Urgent')),
    ]
    
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default=PRIORITY_NORMAL,
        verbose_name=_('Priority')
    )
    
    class Meta:
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['school', 'notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.email}"
    
    def mark_as_read(self):
        from django.utils import timezone
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])


class SMSLog(TimestampModel):
    """
    Log of sent SMS messages.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='sms_logs',
        verbose_name=_('School')
    )
    
    recipient_phone = models.CharField(
        max_length=20,
        verbose_name=_('Recipient Phone')
    )
    message = models.TextField(verbose_name=_('Message'))
    
    # Template used
    template_name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Template Name')
    )
    
    # Status
    STATUS_PENDING = 'pending'
    STATUS_SENT = 'sent'
    STATUS_DELIVERED = 'delivered'
    STATUS_FAILED = 'failed'
    
    STATUS_CHOICES = [
        (STATUS_PENDING, _('Pending')),
        (STATUS_SENT, _('Sent')),
        (STATUS_DELIVERED, _('Delivered')),
        (STATUS_FAILED, _('Failed')),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        verbose_name=_('Status')
    )
    
    # Provider response
    provider_message_id = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Provider Message ID')
    )
    error_message = models.TextField(
        blank=True,
        verbose_name=_('Error Message')
    )
    
    # Cost
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Cost (Toman)')
    )
    
    # Timestamps
    sent_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Sent At')
    )
    delivered_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Delivered At')
    )
    
    # Related user
    user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sms_logs',
        verbose_name=_('Related User')
    )
    
    class Meta:
        verbose_name = _('SMS Log')
        verbose_name_plural = _('SMS Logs')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"SMS to {self.recipient_phone} - {self.get_status_display()}"


class NotificationTemplate(TimestampModel):
    """
    Templates for common notifications.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='notification_templates',
        verbose_name=_('School')
    )
    
    name = models.CharField(max_length=100, verbose_name=_('Template Name'))
    code = models.SlugField(verbose_name=_('Template Code'))
    
    # Type
    TYPE_SMS = 'sms'
    TYPE_EMAIL = 'email'
    TYPE_IN_APP = 'in_app'
    TYPE_PUSH = 'push'
    
    TYPE_CHOICES = [
        (TYPE_SMS, _('SMS')),
        (TYPE_EMAIL, _('Email')),
        (TYPE_IN_APP, _('In-App')),
        (TYPE_PUSH, _('Push Notification')),
    ]
    
    template_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default=TYPE_SMS,
        verbose_name=_('Template Type')
    )
    
    # Content
    subject = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Subject')
    )
    body = models.TextField(verbose_name=_('Body'))
    
    # Variables available
    variables = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Variables'),
        help_text=_('List of available template variables')
    )
    
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    class Meta:
        verbose_name = _('Notification Template')
        verbose_name_plural = _('Notification Templates')
        unique_together = ['school', 'code', 'template_type']
    
    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"
    
    def render(self, context):
        """Render template with given context variables."""
        from string import Template
        template = Template(self.body)
        return template.safe_substitute(context)
