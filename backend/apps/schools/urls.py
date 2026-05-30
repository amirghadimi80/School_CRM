"""
School API URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SchoolViewSet, AcademicYearViewSet, TermViewSet,
    PeriodViewSet, CurriculumViewSet, TeacherAvailabilityViewSet,
    TeacherSpecializationViewSet, GeneratedScheduleViewSet
)

router = DefaultRouter()
router.register(r'schools', SchoolViewSet, basename='school')
router.register(r'academic-years', AcademicYearViewSet, basename='academic-year')
router.register(r'terms', TermViewSet, basename='term')
router.register(r'periods', PeriodViewSet, basename='period')
router.register(r'curriculum', CurriculumViewSet, basename='curriculum')
router.register(r'teacher-availabilities', TeacherAvailabilityViewSet, basename='teacher-availability')
router.register(r'teacher-specializations', TeacherSpecializationViewSet, basename='teacher-specialization')
router.register(r'schedules', GeneratedScheduleViewSet, basename='schedule')

urlpatterns = [
    path('', include(router.urls)),
]
