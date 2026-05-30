"""
Student API URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, StudentDocumentViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'student-documents', StudentDocumentViewSet, basename='student-document')

urlpatterns = [
    path('', include(router.urls)),
]
