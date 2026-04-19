@echo off
echo ===================================================
echo   🌾 FarmConnect - Automatic Setup Script 🌾
echo ===================================================
echo.

echo [1/3] Installing Root dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing root dependencies. Make sure Node.js is installed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Installing Backend (Server) dependencies...
cd server
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing server dependencies. 
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [3/3] Installing Frontend (Client) dependencies...
cd client
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing client dependencies.
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo ===================================================
echo   ✅ Setup Complete! 
echo.
echo   To start the project, type: npm run start:all
echo   Or run start_project.bat
echo ===================================================
pause
