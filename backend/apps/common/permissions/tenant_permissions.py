"""
Custom permissions for multi-tenant architecture.
"""
from rest_framework import permissions
from apps.common.middleware.tenant import get_current_tenant


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission for super admins only.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_super_admin
        )


class IsSchoolAdmin(permissions.BasePermission):
    """
    Permission for school admins (and super admins).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_super_admin:
            return True
        
        tenant = get_current_tenant()
        if not tenant:
            return False
        
        return (
            request.user.school_id == tenant.id and 
            request.user.is_school_admin
        )


class IsSchoolMember(permissions.BasePermission):
    """
    Permission for any member of the school.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_super_admin:
            return True
        
        tenant = get_current_tenant()
        if not tenant:
            return False
        
        return request.user.school_id == tenant.id


class IsTeacher(permissions.BasePermission):
    """
    Permission for teachers.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_super_admin:
            return True
        
        tenant = get_current_tenant()
        if not tenant:
            return False
        
        return (
            request.user.school_id == tenant.id and 
            (request.user.is_teacher or request.user.is_school_admin)
        )


class IsStudent(permissions.BasePermission):
    """
    Permission for students (to access their own data).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        tenant = get_current_tenant()
        if not tenant:
            return False
        
        return (
            request.user.school_id == tenant.id and 
            request.user.is_student_user
        )


class IsParent(permissions.BasePermission):
    """
    Permission for parents (to access their children's data).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        tenant = get_current_tenant()
        if not tenant:
            return False
        
        return (
            request.user.school_id == tenant.id and 
            request.user.is_parent_user
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to only allow owners of an object or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Super admins can do anything
        if request.user.is_super_admin:
            return True
        
        # School admins can do anything in their school
        tenant = get_current_tenant()
        if request.user.is_school_admin and request.user.school_id == tenant.id:
            return True
        
        # Check if object has a user field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Check if object has created_by field
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        return False


class ReadOnly(permissions.BasePermission):
    """
    Permission to only allow read-only access.
    """
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS
