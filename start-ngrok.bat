@echo off
echo ==================================================
echo   Blood Donation Platform - ngrok Setup
echo ==================================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: ngrok is not installed!
    echo.
    echo Please install ngrok:
    echo 1. Download from: https://ngrok.com/download
    echo 2. Or use chocolatey: choco install ngrok
    echo.
    pause
    exit /b 1
)

echo [OK] ngrok is installed
echo.

echo ==================================================
echo   Starting ngrok tunnels...
echo ==================================================
echo.
echo INSTRUCTIONS:
echo 1. Two command windows will open
echo 2. Copy the HTTPS URLs from both windows
echo 3. Update client/.env with the backend URL
echo 4. Share the frontend URL with others
echo.
pause

REM Start ngrok for frontend (port 3000)
echo.
echo Starting ngrok for FRONTEND (port 3000)...
start "FRONTEND - Port 3000" cmd /k "echo FRONTEND TUNNEL (Port 3000) && echo Share this URL with others! && echo. && ngrok http 3000"

timeout /t 2 /nobreak >nul

REM Start ngrok for backend (port 5000)
echo Starting ngrok for BACKEND (port 5000)...
start "BACKEND - Port 5000" cmd /k "echo BACKEND TUNNEL (Port 5000) && echo Copy this URL to update client/.env && echo. && ngrok http 5000"

echo.
echo ==================================================
echo   ngrok tunnels started!
echo ==================================================
echo.
echo NEXT STEPS:
echo 1. Look at the ngrok windows for the HTTPS URLs
echo 2. Copy the BACKEND URL (port 5000)
echo 3. Edit client/.env and set:
echo    REACT_APP_API_URL=https://your-backend-url/api
echo 4. Restart your React app (Ctrl+C and npm start)
echo 5. Share the FRONTEND URL with others!
echo.
pause
