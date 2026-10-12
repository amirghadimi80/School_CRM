"""
Teacher API URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeacherViewSet, TeacherAssignmentViewSet

router = DefaultRouter()
# Register assignments before the catch-all teacher viewset so
# /assignments/ is not captured as a teacher id.
router.register(r'assignments', TeacherAssignmentViewSet, basename='teacher-assignment')
router.register(r'', TeacherViewSet, basename='teacher')

urlpatterns = [
    path('', include(router.urls)),
]
