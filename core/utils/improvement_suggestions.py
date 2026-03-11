"""
Improve resume language by replacing weak action verbs.
"""

from __future__ import annotations

import re
from typing import Dict, List


WEAK_VERB_REPLACEMENTS: Dict[str, List[str]] = {
    "worked": ["developed", "implemented", "engineered"],
    "helped": ["supported", "collaborated", "optimized"],
    "did": ["executed", "delivered", "orchestrated"],
}


def detect_weak_verb_suggestions(resume_text: str) -> List[Dict[str, object]]:
    """Detect weak verbs and suggest stronger alternatives."""
    text = (resume_text or "").lower()
    suggestions: List[Dict[str, object]] = []

    for weak_verb, replacements in WEAK_VERB_REPLACEMENTS.items():
        count = len(re.findall(rf"\b{re.escape(weak_verb)}\b", text))
        if count:
            suggestions.append(
                {
                    "weak_verb": weak_verb,
                    "count": count,
                    "suggestions": replacements,
                }
            )

    return suggestions
