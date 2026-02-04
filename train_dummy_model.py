import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import os

def create_dummy_models():
    print("Creating dummy ML models...")
    
    # 1. Create dummy training data
    # Features: [soil_moisture, temperature, humidity, rain_sensor, rain_probability]
    X_train = np.array([
        [20, 30, 40, 0, 0],   # Dry -> Irrigate (1)
        [80, 25, 60, 0, 80],  # Wet -> Don't (0)
        [35, 28, 45, 0, 10],  # Semi-dry -> Irrigate (1)
        [90, 20, 90, 1, 100], # Raining -> Don't (0)
        [50, 25, 50, 0, 20],  # Average -> Don't (0)
    ])
    y_train = np.array([1, 0, 1, 0, 0])
    
    # 2. Train Scaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train)
    
    # 3. Train Model
    model = RandomForestClassifier(n_estimators=10, random_state=42)
    model.fit(X_scaled, y_train)
    
    # 4. Save files
    models_dir = os.path.join(os.getcwd(), 'backend', 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, 'irrigation_ai_model.pkl')
    scaler_path = os.path.join(models_dir, 'scaler.pkl')
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"✅ Saved model to: {model_path}")
        
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"✅ Saved scaler to: {scaler_path}")

if __name__ == "__main__":
    create_dummy_models()
