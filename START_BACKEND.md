# How to Start the Backend Server

## Correct Commands:

1. **Navigate to the project root:**
   ```powershell
   cd "C:\MAIN PROJECT"
   ```

2. **Start Django backend server:**
   ```powershell
   python manage.py runserver
   ```

   The server will start at: `http://127.0.0.1:8000/`

## Important Notes:
- `manage.py` is in the ROOT directory (`C:\MAIN PROJECT\`), NOT in `backend\`
- The `backend\` folder is the Django project folder (contains settings.py, urls.py, etc.)
- Always run `manage.py` from the root directory
