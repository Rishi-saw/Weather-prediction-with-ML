  `"""
Weather Prediction API Backend
FastAPI application for predicting temperature and rain using ML models
"""

import pickle
from typing import Literal
from datetime import datetime

import pandas as pd
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import Prediction, init_db, get_db

# ============================================================================
# Load ML Models
# ============================================================================

print("Loading ML models...")

try:
    with open('temperature_model.pkl', 'rb') as f:
        temperature_model = pickle.load(f)
    print("✓ Temperature model loaded")
    
    with open('rain_model.pkl', 'rb') as f:
        rain_model = pickle.load(f)
    print("✓ Rain model loaded")
    
    with open('scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    print("✓ Scaler loaded")
    
except FileNotFoundError as e:
    print(f"❌ Error: Model files not found - {e.filename}")
    print("Please run train_models.py first to generate model files")
    raise

# Feature columns (must match training order)
FEATURE_COLUMNS = ['humidity', 'pressure', 'wind_speed', 'clouds', 'month', 'day']

# ============================================================================
# FastAPI Application Setup
# ============================================================================

app = FastAPI(
    title="Weather Prediction API",
    description="ML-powered weather prediction API for temperature and rain forecasting",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration - allows frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Pydantic Models (Request/Response schemas)
# ============================================================================

class WeatherInput(BaseModel):
    """
    Input schema for weather prediction
    """
    humidity: float = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Relative humidity in percentage (0-100)"
    )
    pressure: float = Field(
        ..., 
        ge=900, 
        le=1100, 
        description="Atmospheric pressure in hPa (900-1100)"
    )
    wind_speed: float = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Wind speed in m/s (0-100)"
    )
    clouds: float = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Cloud cover in percentage (0-100)"
    )
    month: int = Field(
        ..., 
        ge=1, 
        le=12, 
        description="Month number (1-12)"
    )
    day: int = Field(
        ..., 
        ge=1, 
        le=31, 
        description="Day of month (1-31)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "humidity": 75.0,
                "pressure": 1010.0,
                "wind_speed": 15.0,
                "clouds": 60.0,
                "month": 7,
                "day": 15
            }
        }


class WeatherPrediction(BaseModel):
    """
    Output schema for weather prediction
    """
    predicted_temperature: float = Field(..., description="Predicted temperature in °C")
    predicted_rain: Literal["Yes", "No"] = Field(..., description="Rain prediction (Yes/No)")
    rain_probability: float = Field(..., description="Probability of rain (0-1)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "predicted_temperature": 30.5,
                "predicted_rain": "Yes",
                "rain_probability": 0.73
            }
        }


class PredictionRecord(BaseModel):
    """
    Database record schema (for history endpoint)
    """
    id: int
    timestamp: datetime
    humidity: float
    pressure: float
    wind_speed: float
    clouds: float
    month: int
    day: int
    predicted_temperature: float
    predicted_rain: str
    rain_probability: float

    class Config:
        from_attributes = True


# ============================================================================
# API Endpoints
# ============================================================================

@app.on_event("startup")
def startup_event():
    """
    Initialize database on application startup
    """
    init_db()
    print("✓ Weather Prediction API is ready!")


@app.get("/", tags=["Health"])
def root():
    """
    Root endpoint - API health check
    """
    return {
        "message": "Weather Prediction API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/predict",
            "history": "/history",
            "docs": "/docs"
        }
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "models_loaded": True,
        "database": "connected"
    }


@app.post("/predict", response_model=WeatherPrediction, tags=["Prediction"])
def predict_weather(
    input_data: WeatherInput,
    db: Session = Depends(get_db)
):
    """
    Predict temperature and rain based on weather parameters
    
    This endpoint:
    1. Accepts weather input parameters
    2. Uses ML models to predict temperature and rain
    3. Stores the prediction in the database
    4. Returns the prediction results
    """
    try:
        # Create DataFrame with input data (in correct order)
        data_dict = {
            'humidity': [input_data.humidity],
            'pressure': [input_data.pressure],
            'wind_speed': [input_data.wind_speed],
            'clouds': [input_data.clouds],
            'month': [input_data.month],
            'day': [input_data.day]
        }
        df = pd.DataFrame(data_dict)[FEATURE_COLUMNS]
        
        # Scale the features
        df_scaled = scaler.transform(df)
        
        # Make predictions
        temp_prediction = float(temperature_model.predict(df_scaled)[0])
        rain_class = int(rain_model.predict(df_scaled)[0])
        rain_proba = float(rain_model.predict_proba(df_scaled)[0][1])
        
        predicted_rain = "Yes" if rain_class == 1 else "No"
        
        # Save to database
        prediction_record = Prediction(
            humidity=input_data.humidity,
            pressure=input_data.pressure,
            wind_speed=input_data.wind_speed,
            clouds=input_data.clouds,
            month=input_data.month,
            day=input_data.day,
            predicted_temperature=temp_prediction,
            predicted_rain=predicted_rain,
            rain_probability=rain_proba
        )
        
        db.add(prediction_record)
        db.commit()
        db.refresh(prediction_record)
        
        # Return prediction
        return WeatherPrediction(
            predicted_temperature=round(temp_prediction, 2),
            predicted_rain=predicted_rain,
            rain_probability=round(rain_proba, 4)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/history", response_model=list[PredictionRecord], tags=["History"])
def get_prediction_history(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get recent prediction history from database
    
    Args:
        limit: Maximum number of records to return (default: 50)
    """
    try:
        predictions = db.query(Prediction)\
            .order_by(Prediction.timestamp.desc())\
            .limit(limit)\
            .all()
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/stats", tags=["Analytics"])
def get_statistics(db: Session = Depends(get_db)):
    """
    Get basic statistics about predictions
    """
    try:
        total_predictions = db.query(Prediction).count()
        rain_predictions = db.query(Prediction).filter(Prediction.predicted_rain == "Yes").count()
        no_rain_predictions = db.query(Prediction).filter(Prediction.predicted_rain == "No").count()
        
        # Get average temperature
        avg_temp = db.query(Prediction).with_entities(
            Prediction.predicted_temperature
        ).all()
        
        avg_temperature = sum([t[0] for t in avg_temp]) / len(avg_temp) if avg_temp else 0
        
        return {
            "total_predictions": total_predictions,
            "rain_predictions": rain_predictions,
            "no_rain_predictions": no_rain_predictions,
            "rain_percentage": round(rain_predictions / total_predictions * 100, 2) if total_predictions > 0 else 0,
            "average_predicted_temperature": round(avg_temperature, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats error: {str(e)}")


@app.delete("/history", tags=["History"])
def clear_history(db: Session = Depends(get_db)):
    """
    Clear all prediction history (use with caution!)
    """
    try:
        deleted = db.query(Prediction).delete()
        db.commit()
        return {
            "message": "History cleared successfully",
            "records_deleted": deleted
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Delete error: {str(e)}")


# ============================================================================
# Run the application
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
