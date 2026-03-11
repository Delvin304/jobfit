"""
Learning resource mapping for missing skills.
"""

from __future__ import annotations

from typing import Dict, List


RESOURCE_MAP: Dict[str, str] = {
    "react": "https://www.freecodecamp.org/news/react-course/",
    "docker": "https://www.freecodecamp.org/news/docker-tutorial/",
    "aws": "https://aws.amazon.com/training/",
    "python": "https://www.freecodecamp.org/news/learn-python-free-python-courses-for-beginners/",
    "django": "https://www.freecodecamp.org/news/how-to-learn-django/",
    "javascript": "https://www.freecodecamp.org/news/full-javascript-course-for-beginners/",
    "sql": "https://www.freecodecamp.org/news/sql-and-databases-full-course/",
}


def get_learning_recommendations(missing_skills: List[str]) -> List[Dict[str, str]]:
    """Return learning links for missing skills, with a safe fallback URL."""
    recommendations: List[Dict[str, str]] = []

    for skill in missing_skills:
        normalized = (skill or "").strip().lower()
        if not normalized:
            continue

        url = RESOURCE_MAP.get(
            normalized,
            f"https://www.freecodecamp.org/news/search?query={normalized}",
        )
        recommendations.append(
            {
                "skill": normalized,
                "title": f"Learn {normalized.title()} (Free Course)",
                "url": url,
            }
        )

    return recommendations
