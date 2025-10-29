@echo off
echo 🚀 Starting AURA Backend API...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo ⚙️ Setting up environment...
    npm run setup
    echo.
)

REM Start the server
echo 🌐 Starting server on http://localhost:5000
echo 📱 Web Tester will be available at http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev




