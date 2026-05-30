"""
Custom permission classes for the school management system.
"""
from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission to only allow super admins.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_super_admin


class IsSchoolAdmin(permissions.BasePermission):
    """
    Permission to allow super admins and school admins.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_school_admin


class IsSchoolMember(permissions.BasePermission):
    """
    Permission to allow any active member of the school (admin, teacher, student).
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.is_active and user.school is not None


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to allow owners of an object or admins.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        # Allow super admins and school admins
        if user.is_school_admin:
            return True
        # Allow owners
        return hasattr(obj, 'user') and obj.user == user


class IsTeacher(permissions.BasePermission):
    """
    Permission to only allow teachers.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user and 
            user.is_authenticated and 
            user.is_active and
            hasattr(user, 'teacher_profile')
        )


class IsStudent(permissions.BasePermission):
    """
    Permission to only allow students.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user and 
            user.is_authenticated and 
            user.is_active and
            hasattr(user, 'student_profile')
        )


class IsParent(permissions.BasePermission):
    """
    Permission to only allow parents.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user and 
            user.is_authenticated and 
            user.is_active and
            user.role == 'parent'
        )


class IsTeacherOfClass(permissions.BasePermission):
    """
    Permission to only allow teachers who teach a specific class.
    Must be used after IsTeacher permission.
    """
    def has_object_permission(self, request, view, obj):
        from apps.teachers.models import TeacherAssignment
        
        user = request.user
        if not hasattr(user, 'teacher_profile'):
            return False
        
        teacher = user.teacher_profile
        
        # Check if this teacher teaches the class
        return TeacherAssignment.objects.filter(
            teacher=teacher,
            class_assigned=obj
        ).exists()


class IsOwnerStudent(permissions.BasePermission):
    """
    Permission to only allow students to access their own data.
    Must be used after IsStudent permission.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not hasattr(user, 'student_profile'):
            return False
        
        # Check if the object belongs to this student
        if hasattr(obj, 'student'):
            return obj.student == user.student_profile
        
        if hasattr(obj, 'id'):
            return obj.id == user.student_profile.id
        
        return False


class IsOwnerOrParent(permissions.BasePermission):
    """
    Permission to allow students to access their own data or parents to access their children's data.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Allow if user is the owner
        if hasattr(user, 'student_profile') and hasattr(obj, 'student'):
            if obj.student == user.student_profile:
                return True
        
        # Allow if user is a parent of the student
        # TODO: Implement parent-student relationship checking
        
        return False
