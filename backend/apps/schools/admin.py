"""
School admin configuration.
"""
from django.contrib import admin
from .models import (
    School, AcademicYear, Term,
    Period, Curriculum, TeacherAvailability,
    TeacherSpecialization, GeneratedSchedule
)


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'plan', 'is_active', 'is_verified', 'created_at']
    list_filter = ['plan', 'is_active', 'is_verified', 'created_at']
    search_fields = ['name', 'slug', 'email']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'is_active', 'is_verified')
        }),
        ('Branding', {
            'fields': ('logo', 'primary_color', 'secondary_color')
        }),
        ('Contact', {
            'fields': ('phone', 'email', 'website', 'address')
        }),
        ('Academic', {
            'fields': ('current_academic_year', 'grading_system', 'education_level')
        }),
        ('Scheduling', {
            'fields': ('periods_per_day', 'period_duration_minutes', 'school_start_time', 'max_class_capacity')
        }),
        ('Subscription', {
            'fields': ('plan', 'subscription_expires_at')
        }),
        ('Settings', {
            'fields': ('settings',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['name', 'school', 'start_date', 'end_date', 'is_current', 'is_active']
    list_filter = ['is_current', 'is_active', 'school']
    search_fields = ['name', 'school__name']
    date_hierarchy = 'start_date'


@admin.register(Term)
class TermAdmin(admin.ModelAdmin):
    list_display = ['name', 'academic_year', 'start_date', 'end_date', 'is_current']
    list_filter = ['is_current', 'academic_year__school']
    search_fields = ['name', 'academic_year__name']
    date_hierarchy = 'start_date'


@admin.register(Period)
class PeriodAdmin(admin.ModelAdmin):
    list_display = ['school', 'period_number', 'start_time', 'end_time']
    list_filter = ['school']
    ordering = ['school', 'period_number']


@admin.register(Curriculum)
class CurriculumAdmin(admin.ModelAdmin):
    list_display = ['school', 'grade_level', 'branch', 'course', 'weekly_hours', 'is_specialized']
    list_filter = ['school', 'grade_level', 'branch', 'is_specialized']
    search_fields = ['course__name']


@admin.register(TeacherAvailability)
class TeacherAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['teacher', 'day_of_week', 'periods']
    list_filter = ['day_of_week']
    search_fields = ['teacher__employee_id', 'teacher__user__first_name', 'teacher__user__last_name']


@admin.register(TeacherSpecialization)
class TeacherSpecializationAdmin(admin.ModelAdmin):
    list_display = ['teacher', 'course', 'grade_levels']
    list_filter = ['course']
    search_fields = ['teacher__employee_id', 'course__name']


@admin.register(GeneratedSchedule)
class GeneratedScheduleAdmin(admin.ModelAdmin):
    list_display = ['class_assigned', 'day_of_week', 'period', 'course', 'teacher', 'academic_year']
    list_filter = ['day_of_week', 'academic_year', 'is_active']
    search_fields = ['class_assigned__name', 'course__name', 'teacher__employee_id']
