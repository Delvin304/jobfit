"""
Lightweight skill extraction + fuzzy matching helpers for ATS analysis.

This module intentionally uses regex + difflib only to stay low-memory.
"""

from __future__ import annotations

import difflib
import re
from typing import Dict, Iterable, List, Set


# Canonical aliases normalize common resume/JD variations.
SKILL_ALIASES: Dict[str, str] = {
    "react.js": "react",
    "reactjs": "react",
    "nodejs": "node.js",
    "node js": "node.js",
    "py": "python",
    "js": "javascript",
    "ts": "typescript",
    "postgres": "postgresql",
    "mongo": "mongodb",
}

COMMON_SKILLS: Set[str] = {
    "python", "django", "flask", "fastapi", "javascript", "typescript", "react", "node.js",
    "html", "css", "tailwind", "sql", "mysql", "postgresql", "mongodb", "redis", "git",
    "docker", "kubernetes", "aws", "azure", "gcp", "rest", "graphql", "linux", "java",
    "c++", "c#", "go", "figma", "jira", "postman", "pytest", "pandas", "numpy",
}

TOOL_KEYWORDS = {"git", "docker", "kubernetes", "jira", "postman", "figma", "linux"}
TECH_KEYWORDS = {
    "python", "django", "flask", "fastapi", "javascript", "typescript", "react", "node.js",
    "aws", "azure", "gcp", "sql", "postgresql", "mongodb", "redis", "rest", "graphql",
}


def normalize_skill_name(skill: str) -> str:
    """Normalize skill strings to canonical, lowercase values."""
    cleaned = re.sub(r"\s+", " ", (skill or "").strip().lower())
    return SKILL_ALIASES.get(cleaned, cleaned)


def extract_job_description_keywords(job_description: str, reference_skills: Iterable[str]) -> Dict[str, List[str]]:
    """
    Extract required skills/tools/technologies from JD text using keyword heuristics.
    """
    text = (job_description or "").lower()
    if not text:
        return {"required_skills": [], "tools": [], "technologies": [], "keywords": []}

    vocabulary = {normalize_skill_name(skill) for skill in reference_skills if skill}
    vocabulary |= COMMON_SKILLS

    found = []
    for term in sorted(vocabulary):
        if len(term) <= 1:
            continue
        escaped = re.escape(term)
        if re.search(rf"\b{escaped}\b", text):
            found.append(term)

    found_set = set(found)
    tools = sorted([skill for skill in found_set if skill in TOOL_KEYWORDS])
    technologies = sorted([skill for skill in found_set if skill in TECH_KEYWORDS])
    return {
        "required_skills": sorted(found_set),
        "tools": tools,
        "technologies": technologies,
        "keywords": sorted(found_set),
    }


def fuzzy_match_skills(resume_skills: Iterable[str], job_skills: Iterable[str], cutoff: float = 0.78) -> Dict[str, object]:
    """
    Compare resume skills with job skills using exact + difflib fuzzy matching.
    """
    resume_canonical = sorted({normalize_skill_name(skill) for skill in resume_skills if skill})
    job_canonical = sorted({normalize_skill_name(skill) for skill in job_skills if skill})

    resume_lookup = {normalize_skill_name(skill): skill for skill in resume_skills if skill}
    matched_skills: Set[str] = set()
    missing_skills: Set[str] = set()

    for job_skill in job_canonical:
        if job_skill in resume_canonical:
            matched_skills.add(job_skill)
            continue

        fuzzy_hit = difflib.get_close_matches(job_skill, resume_canonical, n=1, cutoff=cutoff)
        if fuzzy_hit:
            matched_skills.add(job_skill)
        else:
            missing_skills.add(job_skill)

    total = len(job_canonical)
    match_percentage = (len(matched_skills) / total * 100.0) if total else 0.0

    return {
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills),
        "match_percentage": round(match_percentage, 2),
        "normalized_resume_skills": sorted(resume_lookup.keys()),
    }
