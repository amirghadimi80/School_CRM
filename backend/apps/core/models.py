"""
Base models for School CRM with multi-tenant support.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.common.middleware.tenant import get_current_tenant


class TimestampModel(models.Model):
    """
    Abstract base model with timestamp fields.
    """
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        abstract = True
        ordering = ['-created_at']


class TenantModel(TimestampModel):
    """
    Abstract base model for tenant-aware models.
    All school-specific models should inherit from this.
    """
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='%(class)s_set',
        verbose_name=_('School'),
        db_index=True,
    )
    
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['school', 'created_at']),
        ]
    
    def save(self, *args, **kwargs):
        # Auto-assign tenant if not set. Some subclasses override ``school`` as
        # a derived property (e.g. ``self.class_assigned.school``); those have
        # no concrete ``school`` column, so skip the auto-assignment for them.
        if self._has_concrete_school_field() and not self.school_id:
            current_tenant = get_current_tenant()
            if current_tenant:
                self.school = current_tenant
        super().save(*args, **kwargs)

    @classmethod
    def _has_concrete_school_field(cls):
        try:
            field = cls._meta.get_field('school')
        except Exception:
            return False
        return getattr(field, 'concrete', False)


class SoftDeleteModel(models.Model):
    """
    Abstract base model with soft delete support.
    """
    is_deleted = models.BooleanField(default=False, verbose_name=_('Is Deleted'))
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Deleted At'))
    
    class Meta:
        abstract = True
    
    def delete(self, *args, **kwargs):
        """Soft delete instead of hard delete."""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])
    
    def hard_delete(self, *args, **kwargs):
        """Actually delete the record."""
        super().delete(*args, **kwargs)


class AuditModel(models.Model):
    """
    Abstract base model with audit fields.
    """
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_created',
        verbose_name=_('Created By'),
    )
    updated_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_updated',
        verbose_name=_('Updated By'),
    )
    
    class Meta:
        abstract = True


class BaseModel(TenantModel, SoftDeleteModel, AuditModel):
    """
    Complete base model with all features.
    Use this for most models in the system.
    """
    
    class Meta:
        abstract = True
        ordering = ['-created_at']
