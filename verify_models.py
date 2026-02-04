import pickle
import os
import sys

def check_models():
    print("Checking ML models...")
    models_dir = os.path.join(os.getcwd(), 'backend', 'models')
    model_path = os.path.join(models_dir, 'irrigation_ai_model.pkl')
    scaler_path = os.path.join(models_dir, 'scaler.pkl')
    
    if not os.path.exists(model_path):
        print(f"❌ Model file missing: {model_path}")
        return
    
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        print(f"✅ Model loaded successfully: {type(model)}")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")

    try:
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
        print(f"✅ Scaler loaded successfully: {type(scaler)}")
    except Exception as e:
        print(f"❌ Failed to load scaler: {e}")

if __name__ == "__main__":
    check_models()
