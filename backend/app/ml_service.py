import pickle
import numpy as np
import os
from typing import Dict, Optional
from app.models import PredictionInput, PredictionResponse
from dotenv import load_dotenv

load_dotenv()

class MLService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_path = os.getenv("MODEL_PATH", "models/irrigation_ai_model.pkl")
        self.scaler_path = os.getenv("SCALER_PATH", "models/scaler.pkl")
        self.rain_threshold = float(os.getenv("DEFAULT_RAIN_THRESHOLD", 30))
        
    def load_models(self):
        """Load the ML model and scaler from pickle files"""
        try:
            # Get absolute paths
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_full_path = os.path.join(base_dir, self.model_path)
            scaler_full_path = os.path.join(base_dir, self.scaler_path)
            
            if not os.path.exists(model_full_path):
                print(f"⚠️  Warning: ML model not found at {model_full_path}")
                print("   Creating a simple rule-based predictor as fallback")
                return False
            
            if not os.path.exists(scaler_full_path):
                print(f"⚠️  Warning: Scaler not found at {scaler_full_path}")
                print("   Creating a simple rule-based predictor as fallback")
                return False
            
            with open(model_full_path, 'rb') as f:
                self.model = pickle.load(f)
            
            with open(scaler_full_path, 'rb') as f:
                self.scaler = pickle.load(f)
            
            print("✅ ML model and scaler loaded successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error loading ML models: {e}")
            print("   Falling back to rule-based prediction")
            return False
    
    def predict_irrigation(self, input_data: PredictionInput) -> PredictionResponse:
        """
        Make irrigation prediction based on sensor data
        
        Features: soil_moisture, temperature, humidity, rain_sensor, rain_probability
        Output: predicted_class (0=don't irrigate, 1=irrigate)
        """
        try:
            # Prepare features
            features = np.array([[
                input_data.soil_moisture,
                input_data.temperature,
                input_data.humidity,
                input_data.rain_sensor,
                input_data.rain_probability or 0
            ]])
            
            # Use ML model if available
            if self.model is not None and self.scaler is not None:
                try:
                    # Scale features
                    features_scaled = self.scaler.transform(features)
                    
                    # Make prediction
                    prediction = self.model.predict(features_scaled)[0]
                    
                    # Get prediction probability if available
                    try:
                        probabilities = self.model.predict_proba(features_scaled)[0]
                        confidence = float(max(probabilities))
                    except:
                        confidence = 0.85  # Default confidence
                    
                    predicted_class = int(prediction)
                except Exception as model_err:
                    print(f"⚠️ ML Prediction error: {model_err}, falling back to rule-based")
                    predicted_class, confidence = self._rule_based_prediction(input_data)
            else:
                # Rule-based fallback prediction
                predicted_class, confidence = self._rule_based_prediction(input_data)
            
            # Determine final recommendation considering weather
            rain_probability = input_data.rain_probability or 0
            should_irrigate = (
                predicted_class == 1 and 
                rain_probability < self.rain_threshold and
                input_data.rain_sensor == 0
            )
            
            # Generate recommendation text
            if predicted_class == 1:
                if should_irrigate:
                    recommendation = "Irrigation recommended"
                    reason = f"Low soil moisture ({input_data.soil_moisture:.1f}%) and low rain probability ({rain_probability:.1f}%)"
                else:
                    if rain_probability >= self.rain_threshold:
                        recommendation = "Hold irrigation - rain expected"
                        reason = f"High rain probability ({rain_probability:.1f}%) - natural watering expected"
                    else:
                        recommendation = "Hold irrigation - currently raining"
                        reason = "Rain sensor detected precipitation"
            else:
                recommendation = "No irrigation needed"
                reason = f"Soil moisture adequate ({input_data.soil_moisture:.1f}%)"
            
            return PredictionResponse(
                predicted_class=predicted_class,
                recommendation=recommendation,
                confidence=confidence,
                should_irrigate=should_irrigate,
                reason=reason
            )
            
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            # Return safe default
            return PredictionResponse(
                predicted_class=0,
                recommendation="Error in prediction - no irrigation",
                confidence=0.0,
                should_irrigate=False,
                reason=f"Prediction error: {str(e)}"
            )
    
    def _rule_based_prediction(self, input_data: PredictionInput) -> tuple:
        """
        Simple rule-based prediction fallback
        Returns: (predicted_class, confidence)
        """
        soil_moisture = input_data.soil_moisture
        temperature = input_data.temperature
        humidity = input_data.humidity
        
        # Rule: Irrigate if soil moisture < 40% and temperature > 20°C
        if soil_moisture < 30:
            confidence = 0.9
            predicted_class = 1
        elif soil_moisture < 40 and temperature > 25:
            confidence = 0.75
            predicted_class = 1
        elif soil_moisture < 50 and temperature > 30 and humidity < 40:
            confidence = 0.7
            predicted_class = 1
        else:
            confidence = 0.85
            predicted_class = 0
        
        return predicted_class, confidence

# Global ML service instance
ml_service = MLService()
