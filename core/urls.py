"""
URL configuration for the core application.

This file defines the URL patterns for the core app.
Each URL pattern maps a URL path to a view function or class.

Why separate URLs file?
- Keeps code organized by app
- Makes it easier to manage routes as the project grows
- Follows Django best practices for URL routing
"""

from django.urls import path
from . import views

# app_name helps avoid URL name conflicts when including this in project URLs
app_name = 'core'

# URL patterns for the core app
# Each path() maps a URL to a view
urlpatterns = [
    # Health check endpoint
    # URL: /api/health/
    # View: HealthCheckView (handles GET requests)
    # Name: 'health' (used for reverse URL lookup)
    path('health/', views.HealthCheckView.as_view(), name='health'),

    # Resume analysis endpoint
    # URL: /api/analyze-resume/
    # View: ResumeAnalysisAPIView (handles POST requests with resume file + job role)
    path('analyze-resume/', views.ResumeAnalysisAPIView.as_view(), name='analyze-resume'),
    path('download-report/', views.DownloadAnalysisReportView.as_view(), name='download-report'),
    path('chat/', views.ChatAPIView.as_view(), name='chat'),
    # authentication endpoints
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/google/', views.GoogleLoginView.as_view(), name='google-login'),
]


