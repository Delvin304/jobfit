# How to Start the Application

## Simple Method (Copy & Paste):

### Terminal 1 - Start Backend:
```powershell
cd "C:\MAIN PROJECT"
python manage.py runserver
```

### Terminal 2 - Start Frontend:
```powershell
cd "C:\MAIN PROJECT\frontend"
npm run dev
```

## Using the Scripts (Fixed):

### Terminal 1 - Backend:
```powershell
cd "C:\MAIN PROJECT"
.\start-backend.ps1
```

### Terminal 2 - Frontend:
```powershell
cd "C:\MAIN PROJECT"
.\start-frontend.ps1
```

## What to Expect:

**Backend:**
- Server starts at: `http://127.0.0.1:8000/`
- You should see: "Starting development server at http://127.0.0.1:8000/"

**Frontend:**
- Server starts at: `http://localhost:5173/` (or similar port)
- You should see: "Local: http://localhost:5173/"

## Troubleshooting:

If scripts don't work, use the simple method above (copy & paste commands directly).
