@echo off
echo Starting LED Display Manager...
echo.

echo Killing any existing Node processes on ports 3000-3002 and 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000 "') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001 "') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3002 "') do taskkill /F /PID %%a 2>nul

timeout /t 2 /nobreak >nul

echo Starting Backend Server on port 3001...
cd backend
start "LED Backend" cmd /k npx ts-node src/index.ts

cd ..
timeout /t 3 /nobreak >nul

echo Starting Frontend Server on port 3000...
cd frontend
start "LED Frontend" cmd /k npm run dev

cd ..
echo.
echo Servers are starting...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3001
echo.
echo Close this window when done.
pause