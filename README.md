# Smart Irrigation AI Dashboard

A production-ready full-stack web application for smart irrigation management that integrates real-time sensor data, weather forecasts, and machine learning predictions to automate irrigation decisions.

## 🌟 Features

- **Real-time Monitoring**: Live sensor data visualization (soil moisture, temperature, humidity, rain)
- **ML Predictions**: AI-powered irrigation recommendations based on environmental conditions
- **Weather Integration**: Current weather and 6-hour forecast from OpenWeatherMap API
- **Automated Control**: Smart pump control combining ML predictions and weather data
- **Historical Analytics**: Interactive charts showing sensor trends and pump activity
- **Device Management**: Add, edit, and manage multiple irrigation devices
- **User Authentication**: Secure JWT-based authentication
- **Dark/Light Theme**: Fully responsive UI with theme toggle
- **RESTful API**: Complete backend API with 10+ endpoints

## 🏗️ Architecture

```
MDP/
├── frontend/                 # React + TailwindCSS frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # 8 application pages
│   │   ├──context/         # React Context (Auth)
│   │   ├── utils/          # API client & helpers
│   │   ├── App.jsx         # Main application
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── .env.example
│
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── main.py         # FastAPI app
│   │   ├── database.py     # MongoDB connection
│   │   ├── models.py       # Pydantic models
│   │   ├── auth.py         # JWT authentication
│   │   ├── ml_service.py   # ML prediction service
│   │   └── weather_service.py  # Weather API integration
│   ├── models/             # ML model files
│   ├── requirements.txt
│   └── .env.example
│
└── README.md               # This file
```

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ and npm
- **Python** 3.10+
- **MongoDB** (Local installation or MongoDB Atlas account)
- **OpenWeatherMap API Key** (Free tier available)

### Optional
- **Git** for version control
- **VS Code** or preferred IDE

## 🚀 Local Setup

### 1. Clone the Repository

```bash
cd MDP
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env file with your configuration
# - Set MongoDB URI
# - Generate JWT SECRET_KEY (use: python -c "import secrets; print(secrets.token_hex(32))")
# - Add OpenWeatherMap API key
```

#### MongoDB Setup Options

**Option A: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string and add to `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/irrigation?retryWrites=true&w=majority
   ```

**Option B: Local MongoDB**
1. Install [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use local connection string in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/irrigation
   ```

#### OpenWeatherMap API Key

1. Register at [OpenWeatherMap](https://openweathermap.org/api)
2. Go to API keys section
3. Generate a new key (free tier: 1000 calls/day)
4. Add to `.env`:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```

#### Start Backend Server

```bash
# From backend directory
uvicorn app.main:app --reload

# Server will start at: http://localhost:8000
# API documentation: http://localhost:8000/docs
```

### 3. Frontend Setup

```bash
# Open new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Start development server
npm run dev

# Application will open at: http://localhost:5173
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (protected)

### Devices
- `POST /api/devices` - Create device
- `GET /api/devices` - Get user's devices
- `GET /api/devices/{id}` - Get device by ID
- `PUT /api/devices/{id}` - Update device
- `DELETE /api/devices/{id}` - Delete device

### Sensor Data
- `POST /api/sensors/readings` - Submit sensor reading
- `GET /api/sensors/readings/latest` - Get latest readings
- `GET /api/sensors/readings/device/{device_id}` - Get device readings
- `GET /api/sensors/readings/history` - Get historical data

### ML Predictions
- `POST /api/predictions/predict` - Generate irrigation prediction
- `GET /api/predictions/health` - Check model status

### Weather
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/forecast` - Get forecast

### Pump Control
- `POST /api/pump/control` - Manual pump control
- `POST /api/pump/auto` - Automated pump decision
- `GET /api/pump/status/{device_id}` - Get pump status
- `GET /api/pump/logs` - Get pump event logs

## 🤖 Machine Learning Models

The application uses two ML model files:
- `irrigation_ai_model.pkl` - Trained prediction model
- `scaler.pkl` - Feature scaler

### Model Input Features
1. Soil Moisture (0-100%)
2. Temperature (-50 to 60°C)
3. Humidity (0-100%)
4. Rain Sensor (0 or 1)
5. Rain Probability (0-100%)

### Model Output
- **Predicted Class**: 0 (don't irrigate) or 1 (irrigate)
- **Confidence Score**: 0-1
- **Recommendation**: Human-readable text
- **Final Decision**: Considers weather conditions

### Using Your Own Models

1. Train your model using scikit-learn
2. Save models:
   ```python
   import pickle
   pickle.dump(model, open('backend/models/irrigation_ai_model.pkl', 'wb'))
   pickle.dump(scaler, open('backend/models/scaler.pkl', 'wb'))
   ```
3. Restart backend server

### Fallback Behavior

If models are not found, the system uses a rule-based predictor:
- Irrigate if soil moisture < 30%
- Or soil moisture < 40% AND temperature > 25°C
- Or soil moisture < 50% AND temperature > 30% AND humidity < 40%

## 🎨 Frontend Pages

1. **Login** - User authentication
2. **Signup** - User registration
3. **Dashboard** - Real-time sensor data and pump control
4. **Predictions** - Manual ML prediction generation
5. **Weather** - Current weather and forecast
6. **History** - Historical data visualization with charts
7. **Devices** - Device management (CRUD operations)
8. **Settings** - User profile, theme toggle, password change

## 🌐 Deployment

### Frontend (Vercel - Recommended)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import repository
4. Set environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
5. Deploy

### Backend (Railway/Render - Recommended)

**Option A: Railway**
1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Add MongoDB plugin or connect to Atlas
4. Set environment variables (from `.env.example`)
5. Deploy

**Option B: Render**
1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables
7. Deploy

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error**
```
Solution: Check your MongoDB URI and ensure IP is whitelisted in Atlas
```

**ML Models Not Loading**
```
Solution: Check model file paths in .env or let system use rule-based fallback
```

**Weather API Failing**
```
Solution: Verify OpenWeatherMap API key is valid and has available quota
```

### Frontend Issues

**API Request Failing**
```
Solution: Ensure backend is running and VITE_API_URL is correct in .env
```

**404 on Refresh**
```
Solution: Configure your web server to redirect all routes to index.html
```

**Theme Not Persisting**
```
Solution: Check browser's LocalStorage is enabled
```

## 📊 Database Schema

### Collections

#### users
```javascript
{
  _id: ObjectId,
  username: String,
  email: String (unique),
  hashed_password: String,
  created_at: DateTime
}
```

#### devices
```javascript
{
  _id: ObjectId,
  user_id: String,
  device_name: String,
  location: String,
  crop_type: String,
  moisture_threshold: Number,
  is_active: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

#### sensor_readings
```javascript
{
  _id: ObjectId,
  device_id: String,
  soil_moisture: Number,
  temperature: Number,
  humidity: Number,
  rain_sensor: Number,
  timestamp: DateTime
}
```

#### pump_logs
```javascript
{
  _id: ObjectId,
  device_id: String,
  pump_status: String ('on'|'off'),
  reason: String,
  ml_prediction: Object,
  weather_data: Object,
  timestamp: DateTime
}
```

## 🔒 Security

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt with salt
- **CORS**: Configured for specific origins
- **Input Validation**: Pyd antic models validate all inputs
- **SQL Injection**: MongoDB with parameterized queries
- **XSS Protection**: React auto-escapes output

## 📝 Development

### Running Tests

```bash
# Backend (add tests to /tests directory)
pytest

# Frontend
npm run test
```

### Building for Production

```bash
# Frontend
npm run build

# Backend
# Use uvicorn with --workers flag
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation at `/docs`
- Open an issue on GitHub

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Email/SMS notifications
- [ ] Advanced ML models (deep learning)
- [ ] Multi-language support
- [ ] Soil sensor integration (hardware)
- [ ] Automated testing suite
- [ ] Docker containerization

---

**Built with ❤️ using React, FastAPI, MongoDB, and Machine Learning**
