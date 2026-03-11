"""
Serializers for the core application.

Why serializers?
- Part of Django REST Framework (DRF).
- Help validate and transform incoming request data into Python types.
- Keep validation logic separate from views for cleaner, more testable code.
"""

from __future__ import annotations

from rest_framework import serializers
from django.contrib.auth.models import User


class ResumeUploadSerializer(serializers.Serializer):
    """
    Serializer for handling resume upload and job role selection.

    This serializer is intentionally simple:
    - resume_file: the uploaded resume (PDF or DOCX).
    - job_role_id: the ID of the JobRole the user wants to match against.

    We use a basic Serializer instead of a ModelSerializer because
    we want full control over how the Resume and SkillGapResult
    objects are created in the view.
    """

    resume_file = serializers.FileField(
        help_text="Resume file to analyze (PDF or DOCX)."
    )
    job_role_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="ID of the job role to analyze against."
    )
    job_description = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Optional pasted job description text."
    )


class UserSerializer(serializers.ModelSerializer):
    """Serializer for creating a new user during registration."""

    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']

    def create(self, validated_data):
        # Use Django's create_user helper which handles hashing
        user = User.objects.create_user(**validated_data)
        return user

