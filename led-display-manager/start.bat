@echo off
echo Starting LED Display Manager...
echo.

echo Starting Backend Server...
start cmd /k "cd backend && npx ts-node src/index.ts"

echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo.
echo Press any key to exit...
pause >nul