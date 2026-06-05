"""
Multi-tenant middleware for School CRM.
Implements tenant resolution based on subdomain or header.
"""
import threading
from django.http import Http404
from django.db import connection

_thread_locals = threading.local()


def get_current_tenant():
    """Get the current tenant from thread-local storage."""
    return getattr(_thread_locals, 'tenant', None)


def set_current_tenant(tenant):
    """Set the current tenant in thread-local storage."""
    _thread_locals.tenant = tenant


def get_current_tenant_id():
    """Get the current tenant ID."""
    tenant = get_current_tenant()
    return tenant.id if tenant else None


class TenantMiddleware:
    """
    Middleware to handle multi-tenancy.
    
    Resolves tenant from:
    1. X-Tenant-ID header (for API requests)
    2. Subdomain (for white-label domains)
    3. User's primary school (for authenticated requests)
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        from apps.schools.models import School
        
        tenant = None
        
        # Try header first
        tenant_id = request.headers.get('X-Tenant-ID')
        if tenant_id and tenant_id not in ('null', 'undefined'):
            try:
                tenant = School.objects.get(id=tenant_id, is_active=True)
            except (School.DoesNotExist, ValueError, TypeError):
                pass
        
        # Try subdomain
        if not tenant:
            host = request.get_host()
            subdomain = host.split('.')[0] if '.' in host else None
            if subdomain and subdomain not in ['localhost', '127', 'www', 'api']:
                try:
                    tenant = School.objects.get(slug=subdomain, is_active=True)
                except School.DoesNotExist:
                    pass
        
        # Try user's school for authenticated requests
        if not tenant and request.user and request.user.is_authenticated:
            if hasattr(request.user, 'school') and request.user.school:
                tenant = request.user.school if request.user.school.is_active else None
        
        # Set default tenant if none found (for super admin or public endpoints)
        if not tenant and request.path.startswith('/api/v1/auth/'):
            # Allow auth endpoints without tenant
            set_current_tenant(None)
        elif not tenant and not request.user.is_superuser:
            # Require tenant for non-superusers
            if not request.path.startswith('/admin/'):
                raise Http404("Tenant not found or inactive")
        else:
            set_current_tenant(tenant)
        
        request.tenant = tenant
        
        response = self.get_response(request)
        
        # Clean up thread-local
        set_current_tenant(None)
        
        return response


class TenantAwareQuerySetMixin:
    """
    Mixin for models to automatically filter by tenant.
    Must be used with TenantModel base class.
    """
    
    def get_queryset(self):
        queryset = super().get_queryset()
        tenant = get_current_tenant()
        if tenant:
            queryset = queryset.filter(school=tenant)
        elif not self.request.user.is_superuser:
            queryset = queryset.none()
        return queryset
