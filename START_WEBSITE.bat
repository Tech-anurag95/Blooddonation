@echo off
echo ==================================================
echo   Blood Donation Platform - Quick Start
echo ==================================================
echo.

REM Start Django backend with password fix
echo [1/2] Starting Django backend (port 5000)...
start "Django Backend" cmd /k "cd backend_django && python start_server.py"

REM Wait a moment for Django to start
timeout /t 3 /nobreak >nul

REM Start React frontend
echo [2/2] Starting React frontend (port 3000)...
start "React Frontend" cmd /k "cd client && npm start"

echo.
echo ==================================================
echo   Servers are starting!
echo ==================================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Login credentials:
echo   - shivam@gmail.com / shivam123
echo   - test@test.com / test123
echo   - admin@blooddonation.com / admin123
echo.
echo Press any key to exit this window...
pause >nul
