from fastapi import APIRouter, HTTPException, status, Depends
from app.models import PredictionInput, PredictionResponse, User
from app.auth import get_current_user
from app.ml_service import ml_service

router = APIRouter(prefix="/api/predictions", tags=["predictions"])

@router.post("/predict", response_model=PredictionResponse)
async def predict_irrigation(
    input_data: PredictionInput,
    current_user: User = Depends(get_current_user)
):
    """
    Generate ML prediction for irrigation decision
    
    Input features:
    - soil_moisture: 0-100%
    - temperature: -50 to 60°C
    - humidity: 0-100%
    - rain_sensor: 0 (no rain) or 1 (rain)
    - rain_probability: 0-100% (optional)
    
    Output:
    - predicted_class: 0 (don't irrigate) or 1 (irrigate)
    - recommendation: Human-readable recommendation
    - confidence: Model confidence score (0-1)
    - should_irrigate: Final decision considering weather
    - reason: Explanation for the decision
    """
    try:
        prediction = ml_service.predict_irrigation(input_data)
        return prediction
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@router.get("/health", response_model=dict)
async def check_model_health():
    """Check if ML models are loaded and operational"""
    models_loaded = ml_service.model is not None and ml_service.scaler is not None
    
    return {
        "models_loaded": models_loaded,
        "model_type": "ML-based" if models_loaded else "Rule-based fallback",
        "status": "operational"
    }
