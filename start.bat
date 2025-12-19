@echo off
echo Starting ShiftMaster Application...
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd server && node server.js"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend" cmd /k "cd client && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause