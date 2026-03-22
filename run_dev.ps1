# Run Dev Script for AI Game Challenge
Write-Host "Starting AI Game Challenge Project..." -ForegroundColor Green

# Start Backend
Write-Host "Starting FastAPI Backend on port 8001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; .\venv\Scripts\activate; uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload`""

# Start Frontend
Write-Host "Starting Next.js Frontend on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`""

Write-Host "Startup scripts launched."
