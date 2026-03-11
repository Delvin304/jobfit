"""
ATS score calculation utilities.

Weights:
- Skill Match: 50%
- Section Completeness: 20%
- Keyword Density: 20%
- Formatting Checks: 10%
"""

from __future__ import annotations

import re
from typing import Dict, Iterable, List


def _section_completeness_score(parsed_sections: Dict[str, List[str]]) -> float:
    required_sections = ["skills", "education", "experience", "projects"]
    present_count = sum(1 for section in required_sections if parsed_sections.get(section))
    return (present_count / len(required_sections)) * 100.0


def _keyword_density_score(resume_text: str, jd_keywords: Iterable[str]) -> float:
    keywords = [keyword for keyword in jd_keywords if keyword]
    if not keywords:
        return 0.0

    resume_lower = (resume_text or "").lower()
    hits = 0
    for keyword in keywords:
        if re.search(rf"\b{re.escape(keyword.lower())}\b", resume_lower):
            hits += 1
    return (hits / len(keywords)) * 100.0


def _formatting_score(resume_text: str) -> float:
    """
    Lightweight formatting checks to mimic ATS-friendly structure.
    """
    text = resume_text or ""
    score = 0.0

    # Simple email pattern
    if re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text):
        score += 30.0

    # Phone number pattern
    if re.search(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}", text):
        score += 30.0

    # Presence of bullets (common ATS-friendly formatting)
    if re.search(r"(^|\n)\s*[-*•]\s+", text):
        score += 20.0

    # Reasonable minimum length check
    if len(text.split()) >= 150:
        score += 20.0

    return min(score, 100.0)


def calculate_ats_score(skill_match_percentage: float, parsed_sections: Dict[str, List[str]], resume_text: str, jd_keywords: Iterable[str]) -> Dict[str, float]:
    """
    Compute weighted ATS score and return detailed breakdown.
    """
    section_score = _section_completeness_score(parsed_sections)
    keyword_score = _keyword_density_score(resume_text, jd_keywords)
    formatting_score = _formatting_score(resume_text)

    final_score = (
        (skill_match_percentage * 0.50)
        + (section_score * 0.20)
        + (keyword_score * 0.20)
        + (formatting_score * 0.10)
    )

    return {
        "skill_match_score": round(skill_match_percentage, 2),
        "section_completeness_score": round(section_score, 2),
        "keyword_density_score": round(keyword_score, 2),
        "formatting_score": round(formatting_score, 2),
        "final_ats_score": round(final_score, 2),
    }
