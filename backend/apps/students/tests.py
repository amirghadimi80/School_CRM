from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient

from apps.schools.models import School
from apps.students.models import Student
from apps.users.models import User

PASSWORD = 'CorrectHorse9!'


class StudentVisibilityTests(TestCase):
    def setUp(self):
        self.school = School.objects.create(name='Visibility School', slug='visibility-school')
        self.student_user = User.objects.create_user(
            email='student.a@example.com',
            password=PASSWORD,
            first_name='Student',
            last_name='A',
            role=User.ROLE_STUDENT,
            school=self.school,
        )
        self.other_user = User.objects.create_user(
            email='student.b@example.com',
            password=PASSWORD,
            first_name='Student',
            last_name='B',
            role=User.ROLE_STUDENT,
            school=self.school,
        )
        self.student = Student.objects.create(
            user=self.student_user,
            school=self.school,
            student_code='STD00001',
            grade_level='1',
        )
        self.other = Student.objects.create(
            user=self.other_user,
            school=self.school,
            student_code='STD00002',
            grade_level='1',
        )
        token = RefreshToken.for_user(self.student_user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')

    def test_student_lists_only_themselves(self):
        response = self.client.get('/api/v1/students/')
        self.assertEqual(response.status_code, 200, response.content)
        ids = [row['id'] for row in response.data['results']]
        self.assertEqual(ids, [self.student.id])

    def test_student_cannot_open_another_student(self):
        response = self.client.get(f'/api/v1/students/{self.other.id}/')
        self.assertEqual(response.status_code, 404)

    def test_documents_route_is_not_shadowed(self):
        response = self.client.get('/api/v1/students/documents/')
        self.assertEqual(response.status_code, 200, response.content)
        self.assertIn('results', response.data)
