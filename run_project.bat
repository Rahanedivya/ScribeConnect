@echo off
TITLE ScribeConnect - One-Click Setup and Run
echo ==========================================
echo    ScribeConnect - One-Click Setup & Run
echo ==========================================

:: Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install it from https://nodejs.org/
    pause
    exit
)

echo [OK] Node.js is installed.

:: Setup Backend
echo.
echo [INFO] Setting up Backend...
cd backend

if not exist node_modules (
    echo    Installing backend dependencies...
    call npm install
) else (
    echo    Backend dependencies already installed.
)

if not exist .env (
    echo    Creating backend .env file...
    copy .env.example .env
    echo    [WARNING] Please edit backend/.env and update MONGODB_URI with your database credentials!
    timeout /t 5
) else (
    echo    Backend .env file exists.
)

cd ..

:: Setup Frontend
echo.
echo [INFO] Setting up Frontend...
cd frontend

if not exist node_modules (
    echo    Installing frontend dependencies...
    call npm install
) else (
    echo    Frontend dependencies already installed.
)

if not exist .env (
    echo    Creating frontend .env file...
    copy .env.example .env
) else (
    echo    Frontend .env file exists.
)

cd ..

echo.
echo ==========================================
echo [START] Starting ScribeAI...
echo ==========================================
echo One window will open for Backend, one for Frontend.
echo.

:: Start Backend in new window
start "ScribeAI Backend" cmd /k "cd backend && npm run dev"

:: Start Frontend in new window
start "ScribeAI Frontend" cmd /k "cd frontend && npm run dev"

echo Servers started! ensure MongoDB is running.
echo.
echo Press any key to close this launcher...
pause >nul
