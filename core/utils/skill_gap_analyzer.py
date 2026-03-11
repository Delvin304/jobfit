"""
Utility functions for very simple skill gap analysis.

This module uses ONLY pure Python:
- No database access
- No Django models or views
- No AI or NLP

Idea:
- We receive two lists of skills as plain strings:
  * resume_skills: skills found in the candidate's resume
  * job_skills:    skills required for a specific job role
- We normalize them to lowercase and use set operations
  to find matches and gaps.
"""

from __future__ import annotations

from typing import Dict, List


def analyze_skill_gap(resume_skills: List[str], job_skills: List[str]) -> Dict[str, object]:
    """
    Analyze the skill gap between resume skills and job-required skills.

    Parameters:
        resume_skills: list of skill names found in the resume (strings)
        job_skills:    list of skill names required for the job role (strings)

    Steps:
    1. Convert both lists to lowercase sets to:
       - Ignore case differences ('Python' vs 'python')
       - Remove duplicates automatically
    2. Find:
       - matched_skills = intersection of the two sets
       - missing_skills = job_skills_set - resume_skills_set
    3. Calculate match_percentage:
       - (number of matched skills / total job skills) * 100
       - Handle division by zero if job_skills is empty.
    """
    # Normalize to lowercase and remove duplicates using sets
    resume_set = {s.strip().lower() for s in resume_skills if s and s.strip()}
    job_set = {s.strip().lower() for s in job_skills if s and s.strip()}

    # Set intersection: skills present in both resume and job requirements
    matched_set = resume_set & job_set

    # Set difference: skills required for the job but missing in the resume
    missing_set = job_set - resume_set

    total_job_skills = len(job_set)
    if total_job_skills == 0:
        # Avoid division by zero; if no required skills, treat as 0% by convention
        match_percentage = 0.0
    else:
        match_percentage = (len(matched_set) / total_job_skills) * 100.0

    # Convert sets back to sorted lists for a stable, readable output
    matched_skills = sorted(matched_set)
    missing_skills = sorted(missing_set)

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "match_percentage": match_percentage,
    }


# -------------------------------------------------------------------
# Example usage (for manual testing / viva explanation) - commented
# -------------------------------------------------------------------
# if __name__ == "__main__":
#     resume_skills_example = ["Python", "Django", "Git", "REST APIs"]
#     job_skills_example = ["Python", "Django", "Docker", "REST APIs", "SQL"]
#
#     result = analyze_skill_gap(resume_skills_example, job_skills_example)
#     print(result)
#     # Expected (order may vary slightly depending on sorting):
#     # {
#     #   "matched_skills": ["django", "python", "rest apis"],
#     #   "missing_skills": ["docker", "sql"],
#     #   "match_percentage": 60.0
#     # }

