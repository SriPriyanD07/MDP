from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.models import DeviceCreate, DeviceUpdate, Device, User
from app.auth import get_current_user
from app.database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/devices", tags=["devices"])

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_device(
    device_data: DeviceCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new device"""
    db = get_database()
    
    # Create device document
    device_doc = {
        "user_id": current_user.id,
        "device_name": device_data.device_name,
        "location": device_data.location,
        "crop_type": device_data.crop_type,
        "moisture_threshold": device_data.moisture_threshold,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert device
    result = await db.devices.insert_one(device_doc)
    
    return {
        "message": "Device created successfully",
        "device_id": str(result.inserted_id)
    }

@router.get("", response_model=List[Device])
async def get_user_devices(current_user: User = Depends(get_current_user)):
    """Get all devices for the current user"""
    db = get_database()
    
    cursor = db.devices.find({"user_id": current_user.id})
    devices = await cursor.to_list(length=100)
    
    return [
        Device(
            id=str(d["_id"]),
            user_id=d["user_id"],
            device_name=d["device_name"],
            location=d["location"],
            crop_type=d["crop_type"],
            moisture_threshold=d["moisture_threshold"],
            is_active=d.get("is_active", True),
            created_at=d["created_at"],
            updated_at=d.get("updated_at", d["created_at"])
        )
        for d in devices
    ]

@router.get("/{device_id}", response_model=Device)
async def get_device(
    device_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific device by ID"""
    db = get_database()
    
    device = await db.devices.find_one({
        "_id": ObjectId(device_id),
        "user_id": current_user.id
    })
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    return Device(
        id=str(device["_id"]),
        user_id=device["user_id"],
        device_name=device["device_name"],
        location=device["location"],
        crop_type=device["crop_type"],
        moisture_threshold=device["moisture_threshold"],
        is_active=device.get("is_active", True),
        created_at=device["created_at"],
        updated_at=device.get("updated_at", device["created_at"])
    )

@router.put("/{device_id}", response_model=dict)
async def update_device(
    device_id: str,
    device_update: DeviceUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update device settings"""
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
    
    # Build update document (only include provided fields)
    update_data = {}
    if device_update.device_name is not None:
        update_data["device_name"] = device_update.device_name
    if device_update.location is not None:
        update_data["location"] = device_update.location
    if device_update.crop_type is not None:
        update_data["crop_type"] = device_update.crop_type
    if device_update.moisture_threshold is not None:
        update_data["moisture_threshold"] = device_update.moisture_threshold
    if device_update.is_active is not None:
        update_data["is_active"] = device_update.is_active
    
    update_data["updated_at"] = datetime.utcnow()
    
    # Update device
    await db.devices.update_one(
        {"_id": ObjectId(device_id)},
        {"$set": update_data}
    )
    
    return {"message": "Device updated successfully"}

@router.delete("/{device_id}", response_model=dict)
async def delete_device(
    device_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a device"""
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
    
    # Delete device
    await db.devices.delete_one({"_id": ObjectId(device_id)})
    
    # Also delete associated sensor readings and pump logs
    await db.sensor_readings.delete_many({"device_id": device_id})
    await db.pump_logs.delete_many({"device_id": device_id})
    
    return {"message": "Device and associated data deleted successfully"}
