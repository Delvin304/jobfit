from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import JobRole, Skill, Resume


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_and_login_flow(self):
        # register a new user
        register_url = reverse('core:register')
        data = {'username': 'alice', 'password': 'password123', 'email': 'alice@example.com'}
        resp = self.client.post(register_url, data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', resp.data)
        self.assertEqual(resp.data['username'], 'alice')

        # login with the same credentials
        login_url = reverse('core:login')
        resp2 = self.client.post(login_url, {'username': 'alice', 'password': 'password123'})
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        self.assertIn('token', resp2.data)
        self.assertEqual(resp2.data['username'], 'alice')

    def test_invalid_login(self):
        url = reverse('core:login')
        resp = self.client.post(url, {'username': 'bob', 'password': 'wrong'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', resp.data)


class ResumeAnalysisAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='tester', password='secret')
        # create a job role so analysis can reference it
        role = JobRole.objects.create(title='Tester Role')
        # create a couple of skills for the role (use get_or_create to avoid
        # migrations' initial data causing duplicates)
        s1, _ = Skill.objects.get_or_create(name='Python')
        s2, _ = Skill.objects.get_or_create(name='Django')
        role.required_skills.add(s1, s2)

    def authenticate(self):
        # obtain token via login
        resp = self.client.post(reverse('core:login'), {'username': 'tester', 'password': 'secret'})
        token = resp.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

    def test_analysis_requires_auth(self):
        url = reverse('core:analyze-resume')
        # request without auth should be 401
        resp = self.client.post(url, {})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

        # with auth but missing params should 400
        self.authenticate()
        resp2 = self.client.post(url, {})
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)
