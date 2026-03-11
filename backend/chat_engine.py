"""
Rule-based chat engine for lightweight resume assistant responses.

This module intentionally avoids heavy AI models and external API calls.
"""

from __future__ import annotations


# Basic tech knowledge base for simple "What is X?" style prompts.
knowledge_base = {
    "react": "React is a JavaScript library used for building user interfaces.",
    "python": "Python is a versatile programming language used for backend development and data science.",
    "docker": "Docker is a container platform used to deploy applications consistently.",
    "aws": "AWS is a cloud computing platform used to host scalable applications.",
}


def _format_missing_skills(analysis_data: dict | None) -> str | None:
    """
    Build a user-facing missing skills sentence when analysis data is available.
    """
    if not isinstance(analysis_data, dict):
        return None

    missing = analysis_data.get("missing_skills") or analysis_data.get("missingSkills")
    if not isinstance(missing, list):
        return None

    cleaned = [str(skill).strip() for skill in missing if str(skill).strip()]
    if not cleaned:
        return "Great news - your current analysis shows no missing skills."
    return f"You are missing the following skills: {', '.join(cleaned)}."


def generate_reply(message: str, analysis_data: dict | None = None) -> str:
    """
    Return a chatbot response using keyword-based rules and optional analysis context.
    """
    user_message = (message or "").strip()
    normalized = user_message.lower()

    # Handle "What is X?" knowledge lookups first for direct definitions.
    if normalized.startswith("what is "):
        topic = normalized.replace("what is ", "", 1).replace("?", "").strip()
        if topic in knowledge_base:
            return knowledge_base[topic]

    # Also support direct mentions like "explain react" or "react".
    for topic, description in knowledge_base.items():
        if topic in normalized and ("what is" in normalized or "explain" in normalized or normalized == topic):
            return description

    if "hello" in normalized or "hi" in normalized:
        return "Hello! I am your Resume Assistant. Ask me about your resume, skills, or career."

    if "missing skill" in normalized or "missing skills" in normalized:
        analysis_reply = _format_missing_skills(analysis_data)
        if analysis_reply:
            return analysis_reply
        return "You are missing some important skills required by the job."

    if "improve resume" in normalized or "improve my resume" in normalized:
        return "You can improve your resume by adding strong action verbs and measurable achievements."

    if "ats score" in normalized:
        return "Your ATS score represents how well your resume matches the job description."

    if "learn" in normalized or "skill" in normalized:
        return "Focus on learning technologies mentioned in the job description."

    return "I can help with resume improvement, skills, and career advice."
