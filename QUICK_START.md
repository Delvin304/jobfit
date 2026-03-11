# Quick Start Guide

## Project Structure:
```
C:\MAIN PROJECT\
├── manage.py          ← Django management script (run from here)
├── backend\           ← Django project folder
├── core\              ← Django app folder
├── frontend\          ← React frontend (run npm from here)
└── requirements.txt
```

## Starting Both Servers:

### Terminal 1 - Backend (Django):
```powershell
cd "C:\MAIN PROJECT"
python manage.py runserver
```
Backend runs at: `http://127.0.0.1:8000/`

### Terminal 2 - Frontend (React):
```powershell
cd "C:\MAIN PROJECT\frontend"
npm run dev
```
Frontend runs at: `http://localhost:5173/`

## Common Errors Fixed:

❌ **WRONG:** `cd backend` then `python manage.py runserver`
✅ **CORRECT:** `cd "C:\MAIN PROJECT"` then `python manage.py runserver`

❌ **WRONG:** `cd backend` then `cd frontend`
✅ **CORRECT:** `cd "C:\MAIN PROJECT\frontend"`

## Testing the Integration:

1. Open frontend in browser: `http://localhost:5173/`
2. Upload a resume file (PDF or DOCX)
3. Select a job role
4. Click "Analyze Resume"
5. View results from the backend API
