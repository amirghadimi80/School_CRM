"""
URL configuration for exams app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CurriculumViewSet, QuestionBankViewSet, QuestionFileViewSet,
    ExamViewSet, StudentExamViewSet, StudentAnswerViewSet
)

app_name = 'exams'

router = DefaultRouter()
router.register(r'curriculum', CurriculumViewSet, basename='curriculum')
router.register(r'questions', QuestionBankViewSet, basename='questions')
router.register(r'files', QuestionFileViewSet, basename='files')
router.register(r'exams', ExamViewSet, basename='exams')
router.register(r'student-exams', StudentExamViewSet, basename='student-exams')
router.register(r'student-answers', StudentAnswerViewSet, basename='student-answers')

urlpatterns = [
    path('', include(router.urls)),
]
