# How to Start Frontend Server

## The Issue:
Frontend at `http://localhost:5173/` shows "connection failed" because the development server is not running.

## Solution:

### Option 1: Start Frontend in a New Terminal (Recommended)

1. **Open a NEW PowerShell terminal** (keep backend running in the other terminal)

2. **Navigate to frontend directory:**
   ```powershell
   cd "C:\MAIN PROJECT\frontend"
   ```

3. **Start the development server:**
   ```powershell
   npm run dev
   ```

4. **You should see output like:**
   ```
   VITE v7.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

5. **Open browser:** `http://localhost:5173/`

### Option 2: Use the Script

```powershell
cd "C:\MAIN PROJECT"
.\start-frontend.ps1
```

## Important Notes:

- **Keep BOTH terminals open:**
  - Terminal 1: Backend (Django) - `python manage.py runserver`
  - Terminal 2: Frontend (React) - `npm run dev`

- **If port 5173 is already in use:**
  - Vite will automatically use the next available port (5174, 5175, etc.)
  - Check the terminal output for the actual port number

- **To stop the frontend server:**
  - Press `Ctrl+C` in the terminal where it's running

## Troubleshooting:

1. **"Port already in use" error:**
   - Kill the process using the port:
   ```powershell
   netstat -ano | findstr :5173
   taskkill /PID <PID_NUMBER> /F
   ```

2. **"npm run dev" not found:**
   - Make sure you're in the frontend directory
   - Check if `package.json` exists: `Test-Path package.json`

3. **Still not working:**
   - Delete `node_modules` and reinstall:
   ```powershell
   cd "C:\MAIN PROJECT\frontend"
   Remove-Item -Recurse -Force node_modules
   npm install
   npm run dev
   ```
