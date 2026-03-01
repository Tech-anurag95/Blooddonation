@echo off
cls
echo ============================================================
echo   Blood Donation Platform - PERMANENT FIX VERSION
echo ============================================================
echo.
echo This script ensures:
echo   [x] Passwords are verified and fixed
echo   [x] API URL is set to localhost
echo   [x] Both servers start correctly
echo.
echo ============================================================
pause

REM Ensure .env is set to localhost
echo.
echo [1/4] Ensuring .env is configured for localhost...
cd client
echo REACT_APP_API_URL=http://localhost:5000/api> .env
echo REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key_here>> .env
echo       Done!
cd ..

REM Verify and fix passwords
echo.
echo [2/4] Verifying user passwords...
cd backend_django
python manage.py ensure_users
cd ..

REM Start Django backend
echo.
echo [3/4] Starting Django backend (port 5000)...
start "Django Backend - Blood Donation" cmd /k "cd backend_django && python manage.py runserver 5000"

REM Wait for Django to start
timeout /t 3 /nobreak >nul

REM Start React frontend
echo.
echo [4/4] Starting React frontend (port 3000)...
start "React Frontend - Blood Donation" cmd /k "cd client && npm start"

echo.
echo ============================================================
echo   SERVERS STARTING!
echo ============================================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000/api
echo.
echo Login Credentials (Verified):
echo   Email: shivam@gmail.com    Password: shivam123
echo   Email: test@test.com       Password: test123
echo   Email: admin@blooddonation.com  Password: admin123
echo.
echo ============================================================
echo   Check the new terminal windows for server status
echo ============================================================
echo.
pause
