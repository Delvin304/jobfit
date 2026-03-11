"""
Django Admin configuration for the core app models.

Django Admin provides a ready-made interface for managing database records.
This is useful for:
- Testing and development
- Managing data without writing custom views
- Quick CRUD operations on models

We register all models here so they appear in the Django admin panel at /admin/
"""

from django.contrib import admin
from .models import Resume, Skill, JobRole, SkillGapResult


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    """
    Admin interface configuration for the Resume model.
    
    list_display: Fields shown in the admin list view
    list_filter: Fields that can be used to filter the list
    search_fields: Fields that can be searched
    readonly_fields: Fields that cannot be edited (auto-generated)
    """
    list_display = ['user', 'file', 'uploaded_at', 'has_extracted_text']
    list_filter = ['uploaded_at', 'user']
    search_fields = ['user__username', 'file', 'extracted_text']
    readonly_fields = ['uploaded_at']
    
    def has_extracted_text(self, obj):
        """
        Custom method to show if text has been extracted from the resume.
        Returns a boolean indicator in the admin list view.
        """
        return bool(obj.extracted_text)
    has_extracted_text.boolean = True
    has_extracted_text.short_description = "Text Extracted"


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """
    Admin interface configuration for the Skill model.
    
    Simple model, so we just enable search functionality.
    """
    list_display = ['name']
    search_fields = ['name']


@admin.register(JobRole)
class JobRoleAdmin(admin.ModelAdmin):
    """
    Admin interface configuration for the JobRole model.
    
    filter_horizontal: Makes it easier to select multiple skills
    (shows two boxes: available skills and selected skills)
    """
    list_display = ['title', 'skill_count']
    search_fields = ['title']
    filter_horizontal = ['required_skills']  # Better UI for many-to-many fields
    
    def skill_count(self, obj):
        """
        Custom method to show the number of required skills for this job role.
        """
        return obj.required_skills.count()
    skill_count.short_description = "Required Skills"


@admin.register(SkillGapResult)
class SkillGapResultAdmin(admin.ModelAdmin):
    """
    Admin interface configuration for the SkillGapResult model.
    
    This allows viewing and managing skill gap analysis results.
    """
    list_display = ['resume', 'job_role', 'match_percentage', 'analyzed_at']
    list_filter = ['job_role', 'analyzed_at', 'match_percentage']
    search_fields = ['resume__user__username', 'job_role__title']
    readonly_fields = ['analyzed_at']
    
    # Group fields in the detail view for better organization
    fieldsets = (
        ('Relationships', {
            'fields': ('resume', 'job_role')
        }),
        ('Analysis Results', {
            'fields': ('matched_skills', 'missing_skills', 'match_percentage')
        }),
        ('Metadata', {
            'fields': ('analyzed_at',)
        }),
    )
