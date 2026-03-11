"""
Views for the core application.

This file contains API views for the AI-Assisted Resume Analyzer & Skill Gap Platform.
We use Django REST Framework (DRF) to build RESTful APIs.

Why DRF?
- Provides serializers for converting complex data types to JSON
- Offers APIView, ViewSet, and other powerful view classes
- Built-in authentication, permissions, and throttling
- Automatic API documentation support
- Makes it easy to build REST APIs following best practices
"""

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
import io

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

from rest_framework.authtoken.models import Token
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

from backend.chat_engine import generate_reply

from .models import Resume, Skill, JobRole, SkillGapResult
from .serializers import ResumeUploadSerializer, UserSerializer
from .utils.resume_parser import (
    extract_resume_text,
    parse_resume_sections,
    check_missing_sections,
    build_recruiter_summary,
)
from .utils.skill_extractor import extract_skills_from_text
from .utils.skill_matcher import (
    COMMON_SKILLS,
    extract_job_description_keywords,
    fuzzy_match_skills,
)
from .utils.ats_scoring import calculate_ats_score
from .utils.learning_resources import get_learning_recommendations
from .utils.improvement_suggestions import detect_weak_verb_suggestions


class HealthCheckView(APIView):
    """
    Health check endpoint to verify that the backend is running.
    
    This is a simple endpoint that returns a success message.
    Useful for:
    - Testing if the server is running
    - Monitoring and health checks
    - Verifying API connectivity
    
    Endpoint: GET /api/health/
    Response: JSON with status and message
    """
    
    # No authentication required for health check
    authentication_classes = []
    permission_classes = []
    
    def get(self, request):
        """
        Handle GET requests to the health check endpoint.
        
        Returns a JSON response indicating the backend is running successfully.
        """
        return Response(
            {
                "status": "OK",
                "message": "Backend is running successfully",
            },
            status=status.HTTP_200_OK,
        )


class ResumeAnalysisAPIView(APIView):
    """
    API endpoint to analyze a resume against a selected job role.

    Data flow (high level):
    1. Client sends a POST request with:
       - resume_file (PDF/DOCX)
       - job_role_id (which job to compare against)
    2. We validate the input using a DRF serializer.
    3. We save the resume in the database (Resume model).
    4. We extract plain text from the file (resume_parser utility).
    5. We extract skills from the text (skill_extractor utility).
    6. We fetch the required skills for the selected JobRole.
    7. We run a simple skill gap analysis (skill_gap_analyzer utility).
    8. We store the result in SkillGapResult and return it as JSON.

    Authentication:
    - This endpoint now requires a valid token.
    - The user making the request is available as `request.user`.
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Handle POST request to analyze a resume.
        """
        serializer = ResumeUploadSerializer(data=request.data)
        if not serializer.is_valid():
            # If data is invalid, return 400 with error details
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        resume_file = serializer.validated_data["resume_file"]
        job_role_id = serializer.validated_data.get("job_role_id")
        job_description = serializer.validated_data.get("job_description", "").strip()

        # Keep backward compatibility with old flow while allowing JD-only analysis.
        if not job_role_id and not job_description:
            return Response(
                {"detail": "Provide either job_role_id or job_description."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get selected JobRole only if provided.
        job_role = None
        if job_role_id:
            job_role = get_object_or_404(JobRole, pk=job_role_id)

        # Use the authenticated user (request.user)
        user = request.user


        # 1) Save the Resume instance with the uploaded file.
        # We initially save without extracted_text, then update it.
        resume = Resume.objects.create(user=user, file=resume_file)

        # 2) Extract text from the uploaded resume file using our utility.
        #    This uses pdfplumber/python-docx under the hood.
        try:
            extracted_text = extract_resume_text(resume.file.path)
        except Exception as exc:  # pragma: no cover - broad error safe for demo
            # If extraction fails, delete the resume to avoid keeping broken data.
            resume.delete()
            return Response(
                {"detail": f"Failed to extract text from resume: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update the resume with extracted text.
        resume.extracted_text = extracted_text
        resume.save(update_fields=["extracted_text"])

        # 3) Fetch known skills from DB and keep a common fallback list.
        all_skills = list(Skill.objects.values_list("name", flat=True))
        all_skills.extend(list(COMMON_SKILLS))

        # 4) Extract sections and skills from resume.
        parsed_sections = parse_resume_sections(extracted_text)
        try:
            resume_skills = extract_skills_from_text(extracted_text, all_skills)
        except Exception:
            # Fallback for environments where spaCy model is unavailable.
            resume_skills = [
                skill for skill in all_skills
                if skill and skill.lower() in extracted_text.lower()
            ]

        # 5) Build job-required skills from selected role and pasted JD.
        job_skills = []
        if job_role:
            job_skills.extend(list(job_role.required_skills.values_list("name", flat=True)))

        jd_analysis = extract_job_description_keywords(job_description, all_skills)
        job_skills.extend(jd_analysis["required_skills"])
        job_skills = sorted(set(job_skills))

        # 6) Run fuzzy ATS-style skill matching.
        gap_result = fuzzy_match_skills(resume_skills, job_skills)

        # 7) Compute weighted ATS score and recommendation helpers.
        ats_breakdown = calculate_ats_score(
            skill_match_percentage=gap_result["match_percentage"],
            parsed_sections=parsed_sections,
            resume_text=extracted_text,
            jd_keywords=jd_analysis["keywords"] or job_skills,
        )
        section_warnings = check_missing_sections(parsed_sections)
        learning_recommendations = get_learning_recommendations(gap_result["missing_skills"])
        verb_suggestions = detect_weak_verb_suggestions(extracted_text)
        recruiter_summary = build_recruiter_summary(parsed_sections, extracted_text)
        recruiter_summary["top_skills"] = gap_result["matched_skills"][:5]

        # 8) Save result only when a JobRole exists (legacy compatibility).
        if job_role:
            matched_str = ", ".join(gap_result["matched_skills"])
            missing_str = ", ".join(gap_result["missing_skills"])

            SkillGapResult.objects.create(
                resume=resume,
                job_role=job_role,
                matched_skills=matched_str,
                missing_skills=missing_str,
                match_percentage=gap_result["match_percentage"],
            )

        # 9) Return legacy + extended ATS payload.
        return Response(
            {
                "resume_id": resume.id,
                "job_role_id": job_role.id if job_role else None,
                "matched_skills": gap_result["matched_skills"],
                "missing_skills": gap_result["missing_skills"],
                "match_percentage": gap_result["match_percentage"],
                "ats_score": ats_breakdown["final_ats_score"],
                "score_breakdown": ats_breakdown,
                "parsed_sections": parsed_sections,
                "section_warnings": section_warnings,
                "job_description_analysis": jd_analysis,
                "learning_recommendations": learning_recommendations,
                "improvement_suggestions": verb_suggestions,
                "recruiter_summary": recruiter_summary,
            },
            status=status.HTTP_201_CREATED,
        )


class RegisterView(APIView):
    """Endpoint for creating a new user account."""

    # allow anyone to attempt registration
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "username": user.username}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChatAPIView(APIView):
    """
    Lightweight rule-based chatbot endpoint.

    Endpoint: POST /api/chat/
    Request: {"message": "...", "analysis_data": {...optional...}}
    Response: {"reply": "..."}
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = (request.data.get("message") or "").strip()
        analysis_data = request.data.get("analysis_data")

        if not message:
            return Response(
                {"detail": "Message is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reply = generate_reply(message, analysis_data)
        return Response({"reply": reply}, status=status.HTTP_200_OK)


class LoginView(APIView):
    """Endpoint for obtaining an authentication token."""

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username})

class GoogleLoginView(APIView):
    """Endpoint for logging in with a Google ID token."""
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        token_str = request.data.get('token')
        if not token_str:
            return Response({'detail': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify the token with Google
            # If you configure GOOGLE_OAUTH2_CLIENT_ID in settings, pass it here: audience=settings.GOOGLE_OAUTH2_CLIENT_ID
            client_id = getattr(settings, 'GOOGLE_OAUTH2_CLIENT_ID', None)
            
            try:
                idinfo = id_token.verify_oauth2_token(
                    token_str, 
                    google_requests.Request(), 
                    audience=client_id,
                    clock_skew_in_seconds=600  # Allow 10 minutes of clock skew to fix "used too early" error
                )
            except ValueError as e:
                # Catch specific token validation errors (like audience mismatch)
                return Response({'detail': f'Token validation failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

            # ID token is valid. Get the user's Google Account ID from the decoded token.
            email = idinfo.get('email')
            name = idinfo.get('name', '')
            
            if not email:
                return Response({'detail': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Find the user by email, or create them
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # If they don't exist, create them. Handle potential username collisions.
                base_username = email.split('@')[0]
                username = base_username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                user = User.objects.create(email=email, username=username)
            
            # Generate or get the DRF token
            drf_token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": drf_token.key, "username": user.username})
            
        except Exception as e:
            # Catch-all for unexpected database or logic errors
            return Response({'detail': f'Login Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DownloadAnalysisReportView(APIView):
    """Generate a lightweight PDF report from current analysis payload."""

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas
        except Exception:
            return Response(
                {"detail": "reportlab is not installed on the backend."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        payload = request.data or {}
        score = payload.get("ats_score", payload.get("match_percentage", 0))
        matched = payload.get("matched_skills", [])
        missing = payload.get("missing_skills", [])
        section_warnings = payload.get("section_warnings", [])

        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 50

        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(50, y, "ATS Resume Analysis Report")
        y -= 30

        pdf.setFont("Helvetica", 12)
        pdf.drawString(50, y, f"ATS Score: {score}")
        y -= 24
        pdf.drawString(50, y, f"Matched Skills ({len(matched)}): {', '.join(matched[:12]) or 'None'}")
        y -= 24
        pdf.drawString(50, y, f"Missing Skills ({len(missing)}): {', '.join(missing[:12]) or 'None'}")
        y -= 24

        pdf.drawString(50, y, "Section Warnings:")
        y -= 18
        if section_warnings:
            for warning in section_warnings[:8]:
                pdf.drawString(64, y, f"- {warning}")
                y -= 16
                if y < 80:
                    pdf.showPage()
                    y = height - 50
                    pdf.setFont("Helvetica", 12)
        else:
            pdf.drawString(64, y, "- None")

        pdf.showPage()
        pdf.save()
        buffer.seek(0)

        response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="analysis_report.pdf"'
        return response
