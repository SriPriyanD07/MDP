import pickle
import os
import sys
import numpy as np

def analyze_pkl():
    models_dir = os.path.join(os.getcwd(), 'backend', 'models')
    model_path = os.path.join(models_dir, 'irrigation_ai_model.pkl')
    scaler_path = os.path.join(models_dir, 'scaler.pkl')
    
    print("🔍 Analyzing Pickle Files...")
    
    # Analyze Model
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            print(f"\n📂 Model File: {model_path}")
            print(f"   Type: {type(model)}")
            print(f"   Content: {model}")
            
            # Check if it has predict method
            if hasattr(model, 'predict'):
                print("   ✅ Valid: Has 'predict' method")
            else:
                print("   ❌ Invalid: Missing 'predict' method (Not a valid sklearn model)")
        except Exception as e:
            print(f"   ❌ Error loading model: {e}")
    else:
        print(f"\n❌ Model file not found: {model_path}")

    # Analyze Scaler
    if os.path.exists(scaler_path):
        try:
            with open(scaler_path, 'rb') as f:
                scaler = pickle.load(f)
            print(f"\n📂 Scaler File: {scaler_path}")
            print(f"   Type: {type(scaler)}")
            
            # Check if it has transform method
            if hasattr(scaler, 'transform'):
                print("   ✅ Valid: Has 'transform' method")
            else:
                print("   ❌ Invalid: Missing 'transform' method")
        except Exception as e:
            print(f"   ❌ Error loading scaler: {e}")
    else:
        print(f"\n❌ Scaler file not found: {scaler_path}")

if __name__ == "__main__":
    analyze_pkl()
