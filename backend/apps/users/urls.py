"""
User API URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, UserViewSet
from .teacher_views import TeacherDashboardViewSet
from .student_views import StudentDashboardViewSet

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'teacher/dashboard', TeacherDashboardViewSet, basename='teacher-dashboard')
router.register(r'student/dashboard', StudentDashboardViewSet, basename='student-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
