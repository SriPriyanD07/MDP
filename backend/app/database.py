from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "irrigation")

client = None
database = None

async def connect_to_mongo():
    """Connect to MongoDB"""
    global client, database
    try:
        client = AsyncIOMotorClient(MONGODB_URI, server_api=ServerApi('1'))
        database = client[DATABASE_NAME]
        # Verify connection
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB")
        
        # Create indexes for better performance
        await database.sensor_readings.create_index([("device_id", 1), ("timestamp", -1)])
        await database.pump_logs.create_index([("device_id", 1), ("timestamp", -1)])
        await database.devices.create_index([("user_id", 1)])
        await database.users.create_index([("email", 1)], unique=True)
        
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("✅ MongoDB connection closed")

def get_database():
    """Get database instance"""
    return database
