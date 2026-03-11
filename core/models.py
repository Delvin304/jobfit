"""
Database models for the AI-Assisted Resume Analyzer & Skill Gap Platform.

This file defines the database schema using Django ORM (Object-Relational Mapping).
Django ORM allows us to define database tables as Python classes, making it easy
to work with databases without writing raw SQL.

Model Relationships:
- Resume belongs to a User (ForeignKey)
- SkillGapResult belongs to a Resume and JobRole (ForeignKeys)
- JobRole has many Skills (ManyToManyField)
"""

from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    """
    Model to store uploaded resume files and extracted text.
    
    Each resume is associated with a user who uploaded it.
    The extracted_text field will store the text content extracted from the PDF/Word file.
    This text will be used later for skill extraction and gap analysis.
    
    Fields:
    - user: The user who uploaded this resume (required)
    - file: The actual resume file (PDF, DOCX, etc.)
    - extracted_text: Text content extracted from the resume file
    - uploaded_at: Timestamp when the resume was uploaded (auto-generated)
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='resumes',
        help_text="The user who uploaded this resume"
    )
    file = models.FileField(
        upload_to='resumes/',
        help_text="The resume file (PDF, DOCX, etc.)"
    )
    extracted_text = models.TextField(
        blank=True,
        help_text="Text content extracted from the resume file"
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the resume was uploaded"
    )
    
    class Meta:
        # Order resumes by upload date (newest first)
        ordering = ['-uploaded_at']
        # Human-readable name for admin interface
        verbose_name = "Resume"
        verbose_name_plural = "Resumes"
    
    def __str__(self):
        """
        String representation of the Resume model.
        Shows the user's username and filename for easy identification.
        """
        return f"Resume by {self.user.username} - {self.file.name}"


class Skill(models.Model):
    """
    Model to store individual skills that can be found in resumes or required for job roles.
    
    Skills are stored as separate entities to enable:
    - Reusability across multiple job roles
    - Easy skill matching and comparison
    - Skill normalization (same skill, different spellings)
    
    Example skills: "Python", "JavaScript", "Project Management", "Machine Learning"
    
    Fields:
    - name: The name of the skill (unique to avoid duplicates)
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Name of the skill (e.g., 'Python', 'JavaScript', 'Project Management')"
    )
    
    class Meta:
        # Order skills alphabetically
        ordering = ['name']
        verbose_name = "Skill"
        verbose_name_plural = "Skills"
    
    def __str__(self):
        """
        String representation of the Skill model.
        Simply returns the skill name.
        """
        return self.name


class JobRole(models.Model):
    """
    Model to store job roles and their required skills.
    
    A job role represents a specific position (e.g., "Python Developer", "Data Scientist").
    Each job role has multiple required skills that candidates should possess.
    
    The ManyToManyField allows a job role to have many skills, and a skill can be
    required by multiple job roles (flexible relationship).
    
    Fields:
    - title: The job role title (e.g., "Senior Python Developer")
    - required_skills: Many-to-many relationship with Skill model
    """
    title = models.CharField(
        max_length=100,
        help_text="Job role title (e.g., 'Python Developer', 'Data Scientist')"
    )
    required_skills = models.ManyToManyField(
        Skill,
        related_name='job_roles',
        help_text="Skills required for this job role"
    )
    
    class Meta:
        # Order job roles alphabetically by title
        ordering = ['title']
        verbose_name = "Job Role"
        verbose_name_plural = "Job Roles"
    
    def __str__(self):
        """
        String representation of the JobRole model.
        Returns the job role title.
        """
        return self.title


class SkillGapResult(models.Model):
    """
    Model to store the results of skill gap analysis.
    
    This model stores the comparison results between a resume and a job role.
    It tracks which skills match, which are missing, and calculates a match percentage.
    
    Relationship:
    - Each SkillGapResult is linked to one Resume and one JobRole
    - When a Resume or JobRole is deleted, related SkillGapResults are also deleted (CASCADE)
    
    Fields:
    - resume: The resume being analyzed (required)
    - job_role: The job role being compared against (required)
    - matched_skills: JSON or comma-separated list of skills that match
    - missing_skills: JSON or comma-separated list of skills that are missing
    - match_percentage: Percentage of required skills found in the resume (0-100)
    - analyzed_at: Timestamp when the analysis was performed (auto-generated)
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='skill_gap_results',
        help_text="The resume being analyzed"
    )
    job_role = models.ForeignKey(
        JobRole,
        on_delete=models.CASCADE,
        related_name='skill_gap_results',
        help_text="The job role being compared against"
    )
    matched_skills = models.TextField(
        help_text="Skills from the resume that match the job role requirements"
    )
    missing_skills = models.TextField(
        help_text="Required skills that are missing from the resume"
    )
    match_percentage = models.FloatField(
        help_text="Percentage of required skills found in the resume (0-100)"
    )
    analyzed_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the analysis was performed"
    )
    
    class Meta:
        # Order results by analysis date (newest first)
        ordering = ['-analyzed_at']
        # Ensure one result per resume-job_role combination (optional constraint)
        unique_together = [['resume', 'job_role']]
        verbose_name = "Skill Gap Result"
        verbose_name_plural = "Skill Gap Results"
    
    def __str__(self):
        """
        String representation of the SkillGapResult model.
        Shows the resume user, job role, and match percentage.
        """
        return f"{self.resume.user.username} - {self.job_role.title} ({self.match_percentage:.1f}% match)"
