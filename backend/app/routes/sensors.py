from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List
from app.models import SensorReadingCreate, SensorReading, User
from app.auth import get_current_user
from app.database import get_database
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter(prefix="/api/sensors", tags=["sensors"])

@router.post("/readings", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_sensor_reading(
    reading: SensorReadingCreate,
    current_user: User = Depends(get_current_user)
):
    """Submit a new sensor reading"""
    db = get_database()
    
    # Verify device belongs to user
    device = await db.devices.find_one({
        "_id": ObjectId(reading.device_id),
        "user_id": current_user.id
    })
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found or does not belong to user"
        )
    
    # Create reading document
    reading_doc = {
        "device_id": reading.device_id,
        "soil_moisture": reading.soil_moisture,
        "temperature": reading.temperature,
        "humidity": reading.humidity,
        "rain_sensor": reading.rain_sensor,
        "timestamp": datetime.utcnow()
    }
    
    # Insert reading
    result = await db.sensor_readings.insert_one(reading_doc)
    
    return {
        "message": "Sensor reading recorded successfully",
        "reading_id": str(result.inserted_id)
    }

@router.get("/readings/latest", response_model=List[SensorReading])
async def get_latest_readings(
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """Get latest sensor readings across all user devices"""
    db = get_database()
    
    # Get user's devices
    devices = await db.devices.find({"user_id": current_user.id}).to_list(length=100)
    device_ids = [str(d["_id"]) for d in devices]
    
    if not device_ids:
        return []
    
    # Get latest readings
    cursor = db.sensor_readings.find({
        "device_id": {"$in": device_ids}
    }).sort("timestamp", -1).limit(limit)
    
    readings = await cursor.to_list(length=limit)
    
    return [
        SensorReading(
            id=str(r["_id"]),
            device_id=r["device_id"],
            soil_moisture=r["soil_moisture"],
            temperature=r["temperature"],
            humidity=r["humidity"],
            rain_sensor=r["rain_sensor"],
            timestamp=r["timestamp"]
        )
        for r in readings
    ]

@router.get("/readings/device/{device_id}", response_model=List[SensorReading])
async def get_device_readings(
    device_id: str,
    limit: int = Query(50, ge=1, le=1000),
    current_user: User = Depends(get_current_user)
):
    """Get sensor readings for a specific device"""
    db = get_database()
    
    # Verify device belongs to user
    device = await db.devices.find_one({
        "_id": ObjectId(device_id),
        "user_id": current_user.id
    })
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found or does not belong to user"
        )
    
    # Get readings
    cursor = db.sensor_readings.find({
        "device_id": device_id
    }).sort("timestamp", -1).limit(limit)
    
    readings = await cursor.to_list(length=limit)
    
    return [
        SensorReading(
            id=str(r["_id"]),
            device_id=r["device_id"],
            soil_moisture=r["soil_moisture"],
            temperature=r["temperature"],
            humidity=r["humidity"],
            rain_sensor=r["rain_sensor"],
            timestamp=r["timestamp"]
        )
        for r in readings
    ]

@router.get("/readings/history", response_model=List[SensorReading])
async def get_historical_readings(
    device_id: str,
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_current_user)
):
    """Get historical sensor readings for a device within a date range"""
    db = get_database()
    
    # Verify device belongs to user
    device = await db.devices.find_one({
        "_id": ObjectId(device_id),
        "user_id": current_user.id
    })
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found or does not belong to user"
        )
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get readings within date range
    cursor = db.sensor_readings.find({
        "device_id": device_id,
        "timestamp": {"$gte": start_date, "$lte": end_date}
    }).sort("timestamp", 1)
    
    readings = await cursor.to_list(length=10000)
    
    return [
        SensorReading(
            id=str(r["_id"]),
            device_id=r["device_id"],
            soil_moisture=r["soil_moisture"],
            temperature=r["temperature"],
            humidity=r["humidity"],
            rain_sensor=r["rain_sensor"],
            timestamp=r["timestamp"]
        )
        for r in readings
    ]
