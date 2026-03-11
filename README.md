# JobFit AI

JobFit AI is an AI-assisted resume analyzer and ATS preparation platform built with Django, React, and Vite. It helps users upload a resume, compare it against a job role or pasted job description, view ATS-style scoring, identify missing skills, generate improvement suggestions, download a report, and chat with a built-in resume assistant.

## Features

- User authentication with username/password login and Google login
- Resume upload with PDF and DOCX support
- ATS-style resume analysis against a selected role or custom job description
- Match score, ATS score, matched skills, and missing skills
- Section-level resume feedback and improvement suggestions
- Recruiter-oriented summary view
- Downloadable analysis report
- Floating AI assistant chatbot for resume and career guidance
- Cached last analysis in the browser for a smoother user experience

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Django, Django REST Framework
- Authentication: DRF Token Auth, Google OAuth
- Database: SQLite (development)

## Project Structure

```text
jobfit/
├── backend/              # Django project settings
├── core/                 # Main Django app, APIs, serializers, business logic
├── frontend/             # React + Vite frontend
├── resumes/              # Uploaded resume files (ignored in git)
├── manage.py
└── requirements.txt
```

## Main Workflows

### 1. Authentication

Users can:

- Register with username, email, and password
- Log in with username and password
- Log in using Google OAuth

### 2. Resume Analysis

Users can:

- Upload a PDF or DOCX resume
- Select a predefined job role
- Or paste a custom job description
- Run ATS analysis and receive:
  - ATS score
  - match percentage
  - matched skills
  - missing skills
  - section warnings
  - recruiter summary
  - learning recommendations

### 3. Resume Assistant

The floating chatbot provides lightweight guidance based on:

- ATS score
- matched skills
- missing skills
- resume improvement questions
- general career guidance

## API Endpoints

Base URL:

```text
http://127.0.0.1:8000/api/
```

Important endpoints:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/google/`
- `POST /api/analyze-resume/`
- `POST /api/download-report/`
- `POST /api/chat/`

## Local Setup

### Prerequisites

- Python 3.11+ recommended
- Node.js 18+ recommended
- npm

### Backend Setup

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at:

```text
http://127.0.0.1:8000/
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173/
```

## Environment Notes

The current project uses local development defaults in code. Before production deployment, move secrets and environment-specific values into environment variables.

Recommended environment variables:

### Backend

- `DJANGO_SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `GOOGLE_OAUTH2_CLIENT_ID`

### Frontend

- `VITE_API_BASE_URL`
- `VITE_GOOGLE_CLIENT_ID`

## Production Considerations

Before deployment, update the following:

- Set `DEBUG = False`
- Configure `ALLOWED_HOSTS`
- Move Google OAuth client ID into environment variables
- Move Django secret key into environment variables
- Replace SQLite if you need a production-grade database
- Configure static files and media handling
- Tighten CORS settings for your deployed frontend domain

## Current Status

This project is functional for local development and feature testing, with:

- working auth flow
- Google login support
- resume analysis flow
- recruiter and candidate views
- floating chatbot assistant

## Future Improvements

- Better AI/NLP pipeline for smarter resume suggestions
- User dashboard with analysis history
- Improved PDF report styling
- Production deployment configuration
- Better chatbot memory and contextual answers

## Author

Built by Delvin.
