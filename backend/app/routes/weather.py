from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional, List
from app.models import WeatherData, ForecastData, User
from app.auth import get_current_user
from app.weather_service import weather_service

router = APIRouter(prefix="/api/weather", tags=["weather"])

@router.get("/current", response_model=WeatherData)
async def get_current_weather(
    city: Optional[str] = Query(None, description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    current_user: User = Depends(get_current_user)
):
    """
    Get current weather data for a location
    
    Provide either:
    - city: City name (e.g., "London", "New York")
    - lat & lon: Geographic coordinates
    
    If neither is provided, defaults to London
    """
    weather = await weather_service.get_current_weather(city=city, lat=lat, lon=lon)
    
    if not weather:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Weather data unavailable. Please try again later."
        )
    
    return weather

@router.get("/forecast", response_model=List[ForecastData])
async def get_weather_forecast(
    city: Optional[str] = Query(None, description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    current_user: User = Depends(get_current_user)
):
    """
    Get 6-hour weather forecast for a location
    
    Provide either:
    - city: City name
    - lat & lon: Geographic coordinates
    """
    forecast = await weather_service.get_forecast(city=city, lat=lat, lon=lon)
    
    if not forecast:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Weather forecast unavailable. Please check your API key or try again later."
        )
    
    return forecast
