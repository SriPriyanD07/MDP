from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.models import (
    PumpControlRequest, 
    PumpAutoRequest, 
    PumpLog, 
    PumpStatus,
    User,
    PredictionInput
)
from app.auth import get_current_user
from app.database import get_database
from app.ml_service import ml_service
from app.weather_service import weather_service
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter(prefix="/api/pump", tags=["pump"])

# In-memory pump status cache (in production, use Redis or database)
pump_status_cache = {}

@router.post("/control", response_model=dict)
async def control_pump(
    request: PumpControlRequest,
    current_user: User = Depends(get_current_user)
):
    """Manual pump control (ON/OFF)"""
    db = get_database()
    
    # Verify device belongs to user
    device = await db.devices.find_one({
        "_id": ObjectId(request.device_id),
        "user_id": current_user.id
    })
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    # Update pump status
    pump_status_cache[request.device_id] = {
        "status": request.action,
        "mode": "manual",
        "timestamp": datetime.utcnow()
    }
    
    # Log the pump event
    log_doc = {
        "device_id": request.device_id,
        "pump_status": request.action,
        "reason": f"Manual control by user {current_user.username}",
        "ml_prediction": None,
        "weather_data": None,
        "timestamp": datetime.utcnow()
    }
    
    await db.pump_logs.insert_one(log_doc)
    
    return {
        "message": f"Pump turned {request.action}",
        "device_id": request.device_id,
        "status": request.action
    }

@router.post("/auto", response_model=dict)
async def auto_pump_control(
    request: PumpAutoRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Automated pump control based on ML prediction and weather data
    
    Logic:
    1. Get latest sensor reading for device
    2. Get current weather data
    3. Make ML prediction
    4. Decide: Turn ON if (prediction==1 AND rain_probability < threshold)
    """
    db = get_database()
    
    # Verify device belongs to user
    device = await db.devices.find_one({
        "_id": ObjectId(request.device_id),
        "user_id": current_user.id
    })
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    # Get latest sensor reading
    latest_reading = await db.sensor_readings.find_one(
        {"device_id": request.device_id},
        sort=[("timestamp", -1)]
    )
    
    if not latest_reading:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No sensor data available for this device"
        )
    
    # Get current weather
    weather = await weather_service.get_current_weather(city=device.get("location", "London"))
    
    if not weather:
        # Use default values if weather unavailable
        rain_probability = 20.0
    else:
        rain_probability = weather.rain_probability
    
    # Prepare ML prediction input
    prediction_input = PredictionInput(
        soil_moisture=latest_reading["soil_moisture"],
        temperature=latest_reading["temperature"],
        humidity=latest_reading["humidity"],
        rain_sensor=latest_reading["rain_sensor"],
        rain_probability=rain_probability
    )
    
    # Get ML prediction
    prediction = ml_service.predict_irrigation(prediction_input)
    
    # Determine pump action
    pump_action = "on" if prediction.should_irrigate else "off"
    
    # Update pump status
    pump_status_cache[request.device_id] = {
        "status": pump_action,
        "mode": "auto",
        "timestamp": datetime.utcnow()
    }
    
    # Log the pump event
    log_doc = {
        "device_id": request.device_id,
        "pump_status": pump_action,
        "reason": prediction.reason,
        "ml_prediction": {
            "predicted_class": prediction.predicted_class,
            "recommendation": prediction.recommendation,
            "confidence": prediction.confidence
        },
        "weather_data": {
            "temperature": weather.temperature if weather else None,
            "humidity": weather.humidity if weather else None,
            "rain_probability": rain_probability,
            "description": weather.description if weather else "unavailable"
        },
        "timestamp": datetime.utcnow()
    }
    
    await db.pump_logs.insert_one(log_doc)
    
    return {
        "message": f"Pump turned {pump_action} (automated)",
        "device_id": request.device_id,
        "status": pump_action,
        "prediction": {
            "recommendation": prediction.recommendation,
            "confidence": prediction.confidence,
            "reason": prediction.reason
        },
        "weather": {
            "rain_probability": rain_probability
        }
    }

@router.get("/status/{device_id}", response_model=PumpStatus)
async def get_pump_status(
    device_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get current pump status for a device"""
    db = get_database()
    
    # Verify device belongs to user
    device = await db.devices.find_one({
        "_id": ObjectId(device_id),
        "user_id": current_user.id
    })
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    # Check cache first
    if device_id in pump_status_cache:
        cached = pump_status_cache[device_id]
        return PumpStatus(
            device_id=device_id,
            status=cached["status"],
            last_updated=cached["timestamp"],
            mode=cached["mode"]
        )
    
    # Get from latest log
    latest_log = await db.pump_logs.find_one(
        {"device_id": device_id},
        sort=[("timestamp", -1)]
    )
    
    if latest_log:
        return PumpStatus(
            device_id=device_id,
            status=latest_log["pump_status"],
            last_updated=latest_log["timestamp"],
            mode="auto" if latest_log.get("ml_prediction") else "manual"
        )
    
    # Default status if no logs
    return PumpStatus(
        device_id=device_id,
        status="off",
        last_updated=datetime.utcnow(),
        mode="manual"
    )

@router.get("/logs", response_model=List[PumpLog])
async def get_pump_logs(
    device_id: Optional[str] = Query(None, description="Filter by device ID"),
    days: int = Query(7, ge=1, le=90, description="Number of days of history"),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user)
):
    """Get pump event logs"""
    db = get_database()
    
    # Build query
    query = {}
    
    if device_id:
        # Verify device belongs to user
        device = await db.devices.find_one({
            "_id": ObjectId(device_id),
            "user_id": current_user.id
        })
        
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        
        query["device_id"] = device_id
    else:
        # Get all user's devices
        devices = await db.devices.find({"user_id": current_user.id}).to_list(length=100)
        device_ids = [str(d["_id"]) for d in devices]
        query["device_id"] = {"$in": device_ids}
    
    # Add date filter
    start_date = datetime.utcnow() - timedelta(days=days)
    query["timestamp"] = {"$gte": start_date}
    
    # Get logs
    cursor = db.pump_logs.find(query).sort("timestamp", -1).limit(limit)
    logs = await cursor.to_list(length=limit)
    
    return [
        PumpLog(
            id=str(log["_id"]),
            device_id=log["device_id"],
            pump_status=log["pump_status"],
            reason=log["reason"],
            ml_prediction=log.get("ml_prediction"),
            weather_data=log.get("weather_data"),
            timestamp=log["timestamp"]
        )
        for log in logs
    ]
