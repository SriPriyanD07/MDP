# Quick Start Guide - Smart Irrigation Dashboard

## ✅ Installation Status

### Completed:
- ✅ Python 3.13 detected
- ✅ Node.js 22.21 detected  
- ✅ Virtual environment created
- ✅ Backend dependencies installing...
- ✅ Frontend dependencies installed (197 packages)
- ✅ Environment files created
- ✅ JWT secret key generated
- ✅ Startup scripts created

### Required Before Running:
- ⏳ **MongoDB Setup** (Choose one):
  - **Option A**: MongoDB Atlas (Cloud - Free) - 5 minutes
  - **Option B**: Local MongoDB installation

- ⏳ **OpenWeatherMap API Key** (Optional but recommended):
  - Sign up: https://openweathermap.org/api
  - Free tier: 1000 calls/day
  - Add to `backend\.env`

---

## 🚀 How to Start (Once MongoDB is Ready)

### Method 1: Using Startup Scripts (Easiest)

**Terminal 1 - Backend:**
```bash
cd D:\MDP\backend
start.bat
```

**Terminal 2 - Frontend:**
```bash
cd D:\MDP\frontend
start.bat
```

### Method 2: Manual Commands

**Terminal 1 - Backend:**
```bash
cd D:\MDP\backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd D:\MDP\frontend
npm run dev
```

---

## 📝 MongoDB Setup Options

### Option A: MongoDB Atlas (Recommended)

1. **Sign up** (2 min):
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Use Google/GitHub sign-in for fastest setup

2. **Create Free Cluster** (5 min deployment):
   - Click "Build a Database"
   - Choose "Shared" (FREE)
   - Select region closest to you
   - Click "Create"

3. **Database Access**:
   - Left menu: "Database Access"
   - "Add New Database User"
   - Username: `irrigation_user`
   - Password: (auto-generate and SAVE IT!)
   - Database User Privileges: "Read and write to any database"
   - Add User

4. **Network Access**:
   - Left menu: "Network Access"
   - "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String**:
   - Go back to "Database" (left menu)
   - Click "Connect" on your cluster
   - Choose "Drivers"
   - Copy the connection string
   - It looks like: `mongodb+srv://irrigation_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Update backend\.env**:
   - Open: `D:\MDP\backend\.env`
   - Replace the MONGODB_URI line with your connection string
   - Replace `<password>` with your actual password
   ```
   MONGODB_URI=mongodb+srv://irrigation_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/irrigation?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

1. **Download**:
   - Visit: https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server (MSI)

2. **Install**:
   - Run installer
   - Choose "Complete" installation
   - Install as Windows Service (recommended)
   - Install MongoDB Compass (optional GUI tool)

3. **Start Service**:
   - Should auto-start as Windows Service
   - Or manually: `net start MongoDB`

4. **Verify**:
   - The `.env` is already configured for local MongoDB
   - Connection string: `mongodb://localhost:27017/irrigation`

---

## 🧪 Test MongoDB Connection

Before starting the server, test your MongoDB connection:

```bash
cd D:\MDP\backend
venv\Scripts\activate
python test_mongodb.py
```

You should see: `✅ MongoDB connection successful!`

---

## 🌐 Accessing the Application

Once both servers are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Alternative API Docs**: http://localhost:8000/redoc (ReDoc)

---

## 📋 First Time Setup

1. **Open Browser**: http://localhost:5173
2. **Sign Up**: Create your account
3. **Login**: Use your credentials
4. **Add Device**: Go to "Devices" page → Click "Add Device"
5. **Submit Sensor Data**: Use API docs at http://localhost:8000/docs
6. **View Dashboard**: See real-time data and controls

---

## ⚙️ Environment Variables

### Backend (.env)
```
MONGODB_URI=<your-mongodb-connection-string>
DATABASE_NAME=irrigation
SECRET_KEY=757bd66bb4ef16e77d520edf295f1f3ac494890000660575fdb1be5975f
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
OPENWEATHER_API_KEY=<your-api-key-optional>
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
MODEL_PATH=models/irrigation_ai_model.pkl
SCALER_PATH=models/scaler.pkl
DEFAULT_RAIN_THRESHOLD=30
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

---

## 🔧 Troubleshooting

### Backend won't start
- ✅ Check MongoDB connection: `python test_mongodb.py`
- ✅ Verify virtual environment is activated
- ✅ Check `.env` file exists and has correct values

### Frontend won't start
- ✅ Ensure `npm install` completed successfully
- ✅ Check port 5173 is not in use
- ✅ Verify `.env` file exists

### Can't login
- ✅ Check backend is running (http://localhost:8000)
- ✅ Check browser console for errors
- ✅ Verify MongoDB is connected

### No weather data
- ✅ Add OpenWeatherMap API key to backend `.env`
- ✅ System will use fallback values if API key is missing

---

## 📞 Next Steps

1. ✅ Complete MongoDB setup (choose Atlas or local)
2. ✅ (Optional) Get OpenWeatherMap API key
3. ✅ Run `test_mongodb.py` to verify connection
4. ✅ Start backend server
5. ✅ Start frontend server
6. ✅ Open http://localhost:5173 and sign up!

---

**You're almost there! Just set up MongoDB and you'll be ready to go! 🚀**
