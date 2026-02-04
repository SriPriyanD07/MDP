from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Import database connection
from app.database import connect_to_mongo, close_mongo_connection

# Import ML service
from app.ml_service import ml_service

# Import routes
from app.routes import auth, sensors, predictions, weather, devices, pump

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 Starting Smart Irrigation API...")
    await connect_to_mongo()
    ml_service.load_models()
    yield
    # Shutdown
    print("👋 Shutting down Smart Irrigation API...")
    await close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title="Smart Irrigation AI Dashboard API",
    description="Production-ready API for smart irrigation management with ML predictions",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
# Allow all origins for development to prevent CORS issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router)
app.include_router(sensors.router)
app.include_router(predictions.router)
app.include_router(weather.router)
app.include_router(devices.router)
app.include_router(pump.router)

@app.get("/")
async def root():
    """API health check"""
    return {
        "message": "Smart Irrigation AI Dashboard API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "ml_service": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
