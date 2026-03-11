"""
URL configuration for backend project.

This is the main URL configuration file (ROOT_URLCONF).
It routes incoming HTTP requests to the appropriate views.

URL Structure:
- /admin/ - Django admin interface
- /api/ - API endpoints (includes core app URLs)

Why include()?
- Allows us to include URL patterns from other apps
- Keeps the project organized and modular
- Each app manages its own URLs
"""
from django.contrib import admin
from django.urls import path, include
from core import views as core_views

urlpatterns = [
    # Django admin interface (for managing data in the database)
    path('admin/', admin.site.urls),
    # Direct chatbot endpoint for simple integrations.
    path('chat/', core_views.ChatAPIView.as_view()),
    
    # API endpoints
    # All URLs starting with /api/ will be handled by the core app
    # Example: /api/health/ -> core.urls -> HealthCheckView
    path('api/', include('core.urls')),
]
