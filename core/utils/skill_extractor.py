"""
Lightweight skill extraction using regex/token matching only.

This avoids heavy NLP models and keeps memory usage low.
"""

from __future__ import annotations

import re
from typing import Iterable, List, Set


def preprocess_text(text: str) -> List[str]:
    """
    Convert text into lowercase alphanumeric tokens.
    """
    if not text:
        return []
    return re.findall(r"[a-zA-Z0-9+#.]+", text.lower())


def extract_skills_from_text(resume_text: str, skill_list: Iterable[str]) -> List[str]:
    """
    Extract skills from resume text based on a known list.

    Matching approach:
    - Single-word skills: token set exact match.
    - Multi-word skills: case-insensitive phrase search.
    """
    if not resume_text:
        return []

    token_set: Set[str] = set(preprocess_text(resume_text))
    resume_lower = resume_text.lower()
    matched: Set[str] = set()

    for raw_skill in skill_list:
        if not raw_skill:
            continue

        skill = raw_skill.strip()
        if not skill:
            continue

        skill_lower = skill.lower()

        if " " in skill_lower:
            if re.search(rf"\b{re.escape(skill_lower)}\b", resume_lower):
                matched.add(skill)
        else:
            if skill_lower in token_set:
                matched.add(skill)

    return sorted(matched)
