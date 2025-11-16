@echo off
REM Firebase Setup Script for Bible App (Windows)
REM Usage: setup-firebase.bat

setlocal enabledelayedexpansion

echo.
echo ======================================================================
echo.  Firebase Setup for Biblical Lessons App
echo.
echo ======================================================================
echo.

REM Check if firebase-key.json exists
echo Step 1: Checking Firebase configuration...
echo.

set NODEJS_KEY=backend\nodejs\config\firebase-key.json
set DJANGO_KEY=backend\django\config\firebase-key.json

if not exist "%NODEJS_KEY%" (
  echo [!] Node.js service account not found at: %NODEJS_KEY%
  echo.
  echo    To get this file:
  echo    1. Go to Firebase Console ^> Project Settings ^> Service Accounts
  echo    2. Click 'Generate New Private Key'
  echo    3. Save the JSON file to: %NODEJS_KEY%
  echo.
) else (
  echo [OK] Node.js service account found
  echo.
)

if not exist "%DJANGO_KEY%" (
  echo [!] Django service account not found at: %DJANGO_KEY%
  echo.
  echo    You can use the same file as Node.js:
  echo    mkdir backend\django\config
  echo    copy %NODEJS_KEY% %DJANGO_KEY%
  echo.
) else (
  echo [OK] Django service account found
  echo.
)

REM Create directories if needed
echo Step 2: Creating directories...
echo.

if not exist backend\nodejs\config mkdir backend\nodejs\config
if not exist backend\django\config mkdir backend\django\config
if not exist scripts mkdir scripts

echo [OK] Directories created
echo.

REM Create .env files if they don't exist
echo Step 3: Setting up environment files...
echo.

if not exist "backend\nodejs\.env" (
  echo Creating backend\nodejs\.env
  copy backend\nodejs\.env.example backend\nodejs\.env >nul
  echo [OK] Created backend\nodejs\.env
  echo     [!] Edit this file with your Firebase credentials
) else (
  echo [OK] backend\nodejs\.env already exists
)
echo.

if not exist "backend\django\.env" (
  echo Creating backend\django\.env
  copy backend\django\.env.example backend\django\.env >nul
  echo [OK] Created backend\django\.env
  echo     [!] Edit this file with your Firebase credentials
) else (
  echo [OK] backend\django\.env already exists
)

echo.

REM Check for Node.js
echo Step 4: Checking Node.js...
echo.

where /q node
if errorlevel 1 (
  echo [!] Node.js not found. Please install Node.js from https://nodejs.org
  goto django_setup
)

echo [OK] Node.js is installed
echo.

if not exist "backend\nodejs\node_modules" (
  echo Installing npm packages...
  cd backend\nodejs
  call npm install
  cd ..\..
  echo [OK] Node.js dependencies installed
) else (
  echo [OK] Node.js dependencies already installed
)

:django_setup
echo.

REM Check for Python
echo Step 5: Checking Python...
echo.

where /q python
if errorlevel 1 (
  echo [!] Python not found. Please install Python from https://www.python.org
  goto complete
)

echo [OK] Python is installed
echo.

if not exist "backend\django\venv" (
  echo Creating virtual environment...
  cd backend\django
  python -m venv venv
  call venv\Scripts\activate.bat
  pip install -q -r requirements.txt
  call venv\Scripts\deactivate.bat
  cd ..\..
  echo [OK] Python virtual environment created
) else (
  echo [OK] Python virtual environment exists
)

:complete
echo.
echo ======================================================================
echo [OK] Setup Complete!
echo ======================================================================
echo.
echo Next Steps:
echo.

if not exist "%NODEJS_KEY%" (
  echo 1. Add Firebase Service Account:
  echo    - Get your service account JSON from Firebase Console
  echo    - Place it at: %NODEJS_KEY%
  echo.
)

echo 2. Configure Environment Variables:
echo    - Edit backend\nodejs\.env
echo    - Edit backend\django\.env
echo    - Add your Firebase Project ID and credentials
echo.

echo 3. Load Sample Lessons:
echo    Option A (Node.js):
echo      cd backend\nodejs
echo      node ..\..\scripts\load-lessons.js
echo.
echo    Option B (Python):
echo      cd backend\django
echo      venv\Scripts\activate.bat
echo      python ..\..\scripts\load_lessons.py
echo.

echo 4. Start Development Servers:
echo    Terminal 1 (iOS):
echo      open ios\BibleApp.xcworkspace
echo.
echo    Terminal 2 (Node.js):
echo      cd backend\nodejs
echo      npm run dev
echo.
echo    Terminal 3 (Django):
echo      cd backend\django
echo      venv\Scripts\activate.bat
echo      python manage.py runserver
echo.

echo Documentation:
echo   - Firebase Setup: docs\FIREBASE-SETUP.md
echo   - Quick Start: docs\FIREBASE-QUICK-START.md
echo   - Development: docs\SETUP.md
echo.

echo Happy coding! ^_^
echo.

pause
