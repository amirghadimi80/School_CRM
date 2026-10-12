"""
Student and teacher dashboard routes.

The frontend and README call /api/v1/users/{student,teacher}/dashboard/...
Auth routes stay mounted at /api/v1/auth/ (trailing_slash=False).
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .student_views import StudentDashboardViewSet
from .teacher_views import TeacherDashboardViewSet

router = DefaultRouter(trailing_slash=True)
router.register(r'teacher/dashboard', TeacherDashboardViewSet, basename='teacher-dashboard-alias')
router.register(r'student/dashboard', StudentDashboardViewSet, basename='student-dashboard-alias')

urlpatterns = [
    path('', include(router.urls)),
]
