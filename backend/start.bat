@echo off
echo ========================================
echo   Smart Irrigation - Backend Server
echo ========================================
echo.

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Testing MongoDB connection...
python test_mongodb.py

echo.
set /p continue="MongoDB OK? Press Enter to start server (or Ctrl+C to exit)..."

echo.
echo Starting FastAPI server...
echo API will be available at: http://localhost:8000
echo API documentation at: http://localhost:8000/docs
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
