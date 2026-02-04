"""
Test MongoDB Connection
Run this to verify your MongoDB setup before starting the server
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def test_connection():
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    print(f"Testing connection to: {mongodb_uri}")
    
    try:
        client = AsyncIOMotorClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        print(f"   Connected to: {mongodb_uri}")
        
        # List databases
        db_list = await client.list_database_names()
        print(f"   Available databases: {db_list}")
        
        client.close()
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed!")
        print(f"   Error: {str(e)}")
        print("\n📋 Troubleshooting:")
        print("   1. If using MongoDB Atlas, make sure:")
        print("      - Your IP is whitelisted")
        print("      - Username/password are correct in the connection string")
        print("      - Cluster is fully deployed (can take 5-10 min)")
        print("   2. If using local MongoDB:")
        print("      - Make sure MongoDB service is running")
        print("      - Check if port 27017 is accessible")
        return False

if __name__ == "__main__":
    asyncio.run(test_connection())
