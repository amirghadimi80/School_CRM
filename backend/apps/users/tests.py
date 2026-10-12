from unittest.mock import patch

from django.test import RequestFactory, TestCase
from django.urls import resolve
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.middleware.tenant import set_current_tenant
from apps.common.permissions import IsOwnerOrAdmin
from apps.schools.models import School
from apps.students.models import Student
from apps.users.models import User, UserProfile

PASSWORD = 'CorrectHorse9!'


def auth_client(user):
    client = APIClient()
    token = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')
    return client


class RegisterSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def _payload(self, **overrides):
        data = {
            'email': 'new.student@example.com',
            'password': PASSWORD,
            'first_name': 'New',
            'last_name': 'Student',
            'role': 'student',
        }
        data.update(overrides)
        return data

    def test_public_register_rejects_super_admin(self):
        response = self.client.post(
            '/api/v1/auth/register',
            self._payload(email='root@example.com', role='super_admin'),
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.with_inactive().filter(email='root@example.com').exists())
        self.assertNotIn('super_admin', response.data.get('user', {}) or {})

    def test_public_register_rejects_school_admin(self):
        response = self.client.post(
            '/api/v1/auth/register',
            self._payload(email='boss@example.com', role='school_admin'),
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.with_inactive().filter(email='boss@example.com').exists())

    def test_student_register_is_atomic_and_does_not_leak_errors(self):
        with patch(
            'apps.users.views.UserProfile.objects.create',
            side_effect=RuntimeError('db exploded'),
        ):
            response = self.client.post(
                '/api/v1/auth/register',
                self._payload(),
                format='json',
            )
        body = response.content.decode()
        self.assertEqual(response.status_code, 400)
        self.assertNotIn('db exploded', body)
        self.assertNotIn('IntegrityError', body)
        self.assertFalse(
            User.objects.with_inactive().filter(email='new.student@example.com').exists()
        )

    def test_student_register_creates_profile_without_orphan(self):
        response = self.client.post('/api/v1/auth/register', self._payload(), format='json')
        self.assertEqual(response.status_code, 201, response.content)
        user = User.objects.get(email='new.student@example.com')
        self.assertEqual(user.role, User.ROLE_STUDENT)
        self.assertTrue(UserProfile.objects.filter(user=user).exists())
        self.assertFalse(Student.objects.filter(user=user).exists())
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)


class RefreshTokenTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='active@example.com',
            password=PASSWORD,
            first_name='Active',
            last_name='User',
            role=User.ROLE_STUDENT,
        )
        self.client = APIClient()

    def test_refresh_rotates_and_blacklists_previous_token(self):
        old = str(RefreshToken.for_user(self.user))
        response = self.client.post('/api/v1/auth/refresh', {'refresh': old}, format='json')
        self.assertEqual(response.status_code, 200, response.content)
        self.assertNotEqual(response.data['refresh'], old)
        self.assertTrue(response.data['access'])

        reused = self.client.post('/api/v1/auth/refresh', {'refresh': old}, format='json')
        self.assertEqual(reused.status_code, 401)

    def test_refresh_rejects_inactive_user(self):
        refresh = str(RefreshToken.for_user(self.user))
        self.user.is_active = False
        self.user.save(update_fields=['is_active'])

        response = self.client.post('/api/v1/auth/refresh', {'refresh': refresh}, format='json')
        self.assertEqual(response.status_code, 403)
        self.assertNotIn('access', response.data)


class TenantPermissionTests(TestCase):
    def test_owner_or_admin_does_not_crash_when_tenant_is_none(self):
        school = School.objects.create(name='School', slug='school-a')
        admin = User.objects.create_user(
            email='admin@example.com',
            password=PASSWORD,
            first_name='Admin',
            last_name='User',
            role=User.ROLE_SCHOOL_ADMIN,
            school=school,
        )
        other = User.objects.create_user(
            email='other@example.com',
            password=PASSWORD,
            first_name='Other',
            last_name='User',
            role=User.ROLE_STUDENT,
            school=school,
        )
        request = RequestFactory().get('/')
        request.user = admin
        set_current_tenant(None)
        try:
            allowed = IsOwnerOrAdmin().has_object_permission(request, None, other)
        finally:
            set_current_tenant(None)
        self.assertFalse(allowed)

    def test_school_admin_cannot_assign_super_admin(self):
        school = School.objects.create(name='School', slug='school-b')
        admin = User.objects.create_user(
            email='admin2@example.com',
            password=PASSWORD,
            first_name='Admin',
            last_name='Two',
            role=User.ROLE_SCHOOL_ADMIN,
            school=school,
        )
        student = User.objects.create_user(
            email='pupil@example.com',
            password=PASSWORD,
            first_name='Pupil',
            last_name='One',
            role=User.ROLE_STUDENT,
            school=school,
        )
        response = auth_client(admin).patch(
            f'/api/v1/auth/users/{student.id}',
            {'role': User.ROLE_SUPER_ADMIN},
            format='json',
        )
        self.assertEqual(response.status_code, 400, response.content)
        student.refresh_from_db()
        self.assertEqual(student.role, User.ROLE_STUDENT)

    def test_user_cannot_promote_themselves(self):
        school = School.objects.create(name='School', slug='school-c')
        student = User.objects.create_user(
            email='self@example.com',
            password=PASSWORD,
            first_name='Self',
            last_name='Serve',
            role=User.ROLE_STUDENT,
            school=school,
        )
        response = auth_client(student).patch(
            f'/api/v1/auth/users/{student.id}',
            {'role': User.ROLE_SUPER_ADMIN},
            format='json',
        )
        self.assertIn(response.status_code, (400, 403))
        student.refresh_from_db()
        self.assertEqual(student.role, User.ROLE_STUDENT)


class DashboardRouteTests(TestCase):
    def test_frontend_dashboard_paths_resolve(self):
        student = resolve('/api/v1/users/student/dashboard/dashboard/')
        teacher = resolve('/api/v1/users/teacher/dashboard/schedule/')
        documents = resolve('/api/v1/students/documents/')
        assignments = resolve('/api/v1/teachers/assignments/')
        self.assertIn('student-dashboard', student.url_name)
        self.assertIn('teacher-dashboard', teacher.url_name)
        self.assertIn('document', documents.url_name)
        self.assertNotEqual(documents.url_name, 'student-detail')
        self.assertIn('assignment', assignments.url_name)
        self.assertNotEqual(assignments.url_name, 'teacher-detail')
