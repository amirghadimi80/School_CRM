"""
Student API URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, StudentDocumentViewSet, StudentEnrollmentViewSet

router = DefaultRouter()
# Register concrete prefixes before the catch-all viewset. Otherwise
# /documents/ and /enrollments/ are captured as a student id.
router.register(r'documents', StudentDocumentViewSet, basename='student-document')
router.register(r'enrollments', StudentEnrollmentViewSet, basename='student-enrollment')
router.register(r'', StudentViewSet, basename='student')

urlpatterns = [
    path('', include(router.urls)),
]
