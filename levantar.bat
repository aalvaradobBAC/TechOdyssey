@echo off
setlocal

cd /d "%~dp0"

start "TechOdyssey API" cmd /k "dotnet run --project src\backend\TechOdyssey.Api --urls http://localhost:5048"
start "TechOdyssey App" cmd /k "cd /d src\frontend && npm run dev -- --host 0.0.0.0"

echo API: http://localhost:5048
echo App: http://localhost:5173
