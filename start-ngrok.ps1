# PowerShell script to start ngrok tunnels for both frontend and backend

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Blood Donation Platform - ngrok Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokInstalled) {
    Write-Host "ERROR: ngrok is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install ngrok:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "2. Or use chocolatey: choco install ngrok" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✓ ngrok is installed" -ForegroundColor Green
Write-Host ""

# Check if servers are running
Write-Host "Checking if servers are running..." -ForegroundColor Yellow

$frontendRunning = netstat -ano | Select-String ":3000.*LISTENING"
$backendRunning = netstat -ano | Select-String ":5000.*LISTENING"

if (-not $frontendRunning) {
    Write-Host "WARNING: Frontend (port 3000) is not running!" -ForegroundColor Red
    Write-Host "Please start: npm start (in client folder)" -ForegroundColor Yellow
}

if (-not $backendRunning) {
    Write-Host "WARNING: Backend (port 5000) is not running!" -ForegroundColor Red
    Write-Host "Please start: python manage.py runserver 5000 (in backend_django folder)" -ForegroundColor Yellow
}

if (-not $frontendRunning -or -not $backendRunning) {
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Starting ngrok tunnels..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Two ngrok windows will open" -ForegroundColor White
Write-Host "2. Copy the HTTPS URLs from both windows" -ForegroundColor White
Write-Host "3. Update client/.env with the backend URL" -ForegroundColor White
Write-Host "4. Share the frontend URL with others" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to start ngrok tunnels..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Start ngrok for frontend (port 3000)
Write-Host ""
Write-Host "Starting ngrok for FRONTEND (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'FRONTEND TUNNEL (Port 3000)' -ForegroundColor Green; Write-Host 'Share this URL with others!' -ForegroundColor Yellow; Write-Host ''; ngrok http 3000"

Start-Sleep -Seconds 2

# Start ngrok for backend (port 5000)
Write-Host "Starting ngrok for BACKEND (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'BACKEND TUNNEL (Port 5000)' -ForegroundColor Green; Write-Host 'Copy this URL to update client/.env' -ForegroundColor Yellow; Write-Host ''; ngrok http 5000"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  ngrok tunnels started!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Look at the ngrok windows for the HTTPS URLs" -ForegroundColor White
Write-Host "2. Copy the BACKEND URL (port 5000)" -ForegroundColor White
Write-Host "3. Edit client/.env and set:" -ForegroundColor White
Write-Host "   REACT_APP_API_URL=https://your-backend-url/api" -ForegroundColor Cyan
Write-Host "4. Restart your React app (Ctrl+C and npm start)" -ForegroundColor White
Write-Host "5. Share the FRONTEND URL with others!" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
