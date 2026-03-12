@echo off
cd /d "C:\MAIN PROJECT"

if exist ".venv\Scripts\python.exe" (
  echo Using project virtual environment Python
  ".venv\Scripts\python.exe" manage.py runserver 127.0.0.1:8000
) else (
  echo Using system Python
  python manage.py runserver 127.0.0.1:8000
)
