from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId

# Custom ObjectId type for MongoDB
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# User Models
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class User(UserBase):
    id: str
    created_at: datetime

# Authentication Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Device Models
class DeviceBase(BaseModel):
    device_name: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    crop_type: str = Field(..., min_length=1, max_length=50)
    moisture_threshold: float = Field(..., ge=0, le=100)

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    device_name: Optional[str] = None
    location: Optional[str] = None
    crop_type: Optional[str] = None
    moisture_threshold: Optional[float] = Field(None, ge=0, le=100)
    is_active: Optional[bool] = None

class Device(DeviceBase):
    id: str
    user_id: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

# Sensor Reading Models
class SensorReadingBase(BaseModel):
    soil_moisture: float = Field(..., ge=0, le=100, description="Soil moisture percentage")
    temperature: float = Field(..., ge=-50, le=60, description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage")
    rain_sensor: int = Field(..., ge=0, le=1, description="Rain sensor (0=no rain, 1=rain)")

class SensorReadingCreate(BaseModel):
    device_id: str
    soil_moisture: float = Field(..., ge=0, le=100, description="Soil moisture percentage")
    temperature: Optional[float] = Field(None, ge=-50, le=60, description="Temperature in Celsius")
    humidity: Optional[float] = Field(None, ge=0, le=100, description="Humidity percentage")
    rain_sensor: Optional[int] = Field(None, ge=0, le=1, description="Rain sensor (0=no rain, 1=rain)")

class SensorReading(SensorReadingBase):
    id: str
    device_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ML Prediction Models
class PredictionInput(BaseModel):
    soil_moisture: float = Field(..., ge=0, le=100)
    temperature: float = Field(..., ge=-50, le=60)
    humidity: float = Field(..., ge=0, le=100)
    rain_sensor: int = Field(..., ge=0, le=1)
    rain_probability: Optional[float] = Field(None, ge=0, le=100)

class PredictionResponse(BaseModel):
    predicted_class: int  # 0 or 1
    recommendation: str
    confidence: float
    should_irrigate: bool
    reason: str

# Weather Models
class WeatherData(BaseModel):
    temperature: float
    feels_like: Optional[float] = None
    humidity: float
    rain_probability: float
    description: str
    location: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ForecastData(BaseModel):
    time: datetime
    temperature: float
    rain_probability: float
    description: str

# Pump Control Models
class PumpControlRequest(BaseModel):
    device_id: str
    action: Literal["on", "off"]
    manual: bool = True

class PumpAutoRequest(BaseModel):
    device_id: str

class PumpLog(BaseModel):
    id: str
    device_id: str
    pump_status: Literal["on", "off"]
    reason: str
    ml_prediction: Optional[dict] = None
    weather_data: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PumpStatus(BaseModel):
    device_id: str
    status: Literal["on", "off"]
    last_updated: datetime
    mode: Literal["manual", "auto"]
