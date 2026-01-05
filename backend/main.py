"""
Weather Prediction API Backend
FastAPI application for predicting temperature and rain using ML models
"""

import pickle
import os
from typing import Literal, Optional, Dict
from datetime import datetime
import json
import urllib.parse
import urllib.request

import pandas as pd
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import Prediction, init_db, get_db

# ============================================================================
# Load ML Models - City-Specific Model Manager
# ============================================================================

class ModelManager:
    """Manages loading and accessing city-specific ML models"""
    
    def __init__(self):
        self.models: Dict[str, Dict] = {}
        self.models_dir = 'models'
        self.default_city = 'default'
        self._load_models()
    
    def _normalize_city_name(self, city: str) -> str:
        """Normalize city name for model file lookup"""
        if not city:
            return self.default_city
        # Convert to lowercase and replace spaces with underscores
        normalized = city.lower().strip().replace(' ', '_')
        # Handle common city name variations
        city_mapping = {
            'bangalore': 'bengaluru',
            'bombay': 'mumbai',
            'madras': 'chennai'
        }
        return city_mapping.get(normalized, normalized)
    
    def _load_models(self):
        """Load all available city models"""
        print("Loading ML models...")
        
        # Try to load default models first (for backward compatibility)
        default_loaded = False
        try:
            if os.path.exists('temperature_model.pkl'):
                with open('temperature_model.pkl', 'rb') as f:
                    temp_model = pickle.load(f)
                with open('rain_model.pkl', 'rb') as f:
                    rain_model = pickle.load(f)
                with open('scaler.pkl', 'rb') as f:
                    scaler = pickle.load(f)
                
                self.models[self.default_city] = {
                    'temperature': temp_model,
                    'rain': rain_model,
                    'scaler': scaler
                }
                print(f"[OK] Default models loaded (backward compatibility)")
                default_loaded = True
        except Exception as e:
            print(f"[WARNING] Could not load default models: {e}")
        
        # Load city-specific models from models directory
        if os.path.exists(self.models_dir):
            model_files = os.listdir(self.models_dir)
            city_models = {}
            
            for file in model_files:
                if file.endswith('_temperature_model.pkl'):
                    city = file.replace('_temperature_model.pkl', '')
                    if city not in city_models:
                        city_models[city] = {}
                    try:
                        with open(os.path.join(self.models_dir, file), 'rb') as f:
                            city_models[city]['temperature'] = pickle.load(f)
                    except Exception as e:
                        print(f"[WARNING] Error loading {file}: {e}")
                
                elif file.endswith('_rain_model.pkl'):
                    city = file.replace('_rain_model.pkl', '')
                    if city not in city_models:
                        city_models[city] = {}
                    try:
                        with open(os.path.join(self.models_dir, file), 'rb') as f:
                            city_models[city]['rain'] = pickle.load(f)
                    except Exception as e:
                        print(f"[WARNING] Error loading {file}: {e}")
                
                elif file.endswith('_scaler.pkl'):
                    city = file.replace('_scaler.pkl', '')
                    if city not in city_models:
                        city_models[city] = {}
                    try:
                        with open(os.path.join(self.models_dir, file), 'rb') as f:
                            city_models[city]['scaler'] = pickle.load(f)
                    except Exception as e:
                        print(f"[WARNING] Error loading {file}: {e}")
            
            # Add complete city models
            for city, models in city_models.items():
                if all(key in models for key in ['temperature', 'rain', 'scaler']):
                    self.models[city] = models
                    print(f"[OK] Models loaded for: {city}")
        
        if not self.models:
            if not default_loaded:
                raise FileNotFoundError(
                    "No model files found. Please run: python train_models.py --all"
                )
        
        print(f"[OK] Total cities with models: {len(self.models)}")
    
    def get_models(self, city: Optional[str] = None) -> Dict:
        """Get models for a specific city, fallback to default if not found"""
        if not city:
            city = self.default_city
        
        normalized_city = self._normalize_city_name(city)
        
        # Try exact match first
        if normalized_city in self.models:
            models = self.models[normalized_city]
            # Validate model components
            if not all(key in models for key in ['temperature', 'rain', 'scaler']):
                print(f"[WARNING] City '{city}' model incomplete, falling back to default")
            else:
                return models
        
        # Try partial match (e.g., 'kolkata' matches 'kolkata')
        for model_city in self.models.keys():
            if normalized_city in model_city or model_city in normalized_city:
                models = self.models[model_city]
                if all(key in models for key in ['temperature', 'rain', 'scaler']):
                    return models
        
        # Fallback to default
        if self.default_city in self.models:
            models = self.models[self.default_city]
            if all(key in models for key in ['temperature', 'rain', 'scaler']):
                print(f"[WARNING] City '{city}' model not found, using default model")
                return models
            else:
                print(f"[ERROR] Default model incomplete! Missing components.")
        
        # Last resort: use first available model
        if self.models:
            for model_city in self.models.keys():
                models = self.models[model_city]
                if all(key in models for key in ['temperature', 'rain', 'scaler']):
                    print(f"[WARNING] Using models from: {model_city}")
                    return models
        
        raise ValueError("No valid models available. Please run: python train_models.py --all")

# Initialize model manager
model_manager = ModelManager()

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
    city: Optional[str] = Field(
        None,
        description="City name for city-specific model (e.g., 'Kolkata', 'Delhi', 'Mumbai')"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "humidity": 75.0,
                "pressure": 1010.0,
                "wind_speed": 15.0,
                "clouds": 60.0,
                "month": 7,
                "day": 15,
                "city": "Kolkata"
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
    city: Optional[str]
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
    try:
        init_db()
        print("[OK] Weather Prediction API is ready!")
    except Exception as e:
        print(f"[ERROR] Failed to initialize database: {e}")
        print("[INFO] If you see schema errors, run: python fix_database.py")
        # Don't raise - let the app start, but predictions will fail


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
        "database": "connected",
        "available_cities": list(model_manager.models.keys())
    }


@app.get("/weather/current", tags=["Weather API"])
def get_current_weather(city: str):
    """
    Fetch current weather for any city using Open-Meteo APIs (no API key required).

    Returns values compatible with the ML /predict input:
    humidity, pressure, wind_speed, clouds, month, day

    Note: This is used as a fallback when a city-specific dataset/model isn't available.
    """
    if not city or not city.strip():
        raise HTTPException(status_code=400, detail="city is required")

    try:
        # 1) Geocode city -> lat/lon (Open-Meteo geocoding)
        geo_qs = urllib.parse.urlencode(
            {"name": city.strip(), "count": 1, "language": "en", "format": "json"}
        )
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?{geo_qs}"
        with urllib.request.urlopen(geo_url, timeout=10) as resp:
            geo_data = json.loads(resp.read().decode("utf-8"))

        results = geo_data.get("results") or []
        if not results:
            raise HTTPException(status_code=404, detail=f"City not found: {city}")

        first = results[0]
        lat = float(first["latitude"])
        lon = float(first["longitude"])
        resolved_name = first.get("name") or city
        country = first.get("country")

        # 2) Current weather (Open-Meteo forecast endpoint)
        # Request the fields we need for the ML input.
        forecast_qs = urllib.parse.urlencode(
            {
                "latitude": lat,
                "longitude": lon,
                "current": ",".join(
                    [
                        "temperature_2m",
                        "relative_humidity_2m",
                        "pressure_msl",
                        "cloud_cover",
                        "wind_speed_10m",
                        "rain",
                    ]
                ),
                "timezone": "UTC",
            }
        )
        forecast_url = f"https://api.open-meteo.com/v1/forecast?{forecast_qs}"
        with urllib.request.urlopen(forecast_url, timeout=10) as resp:
            forecast_data = json.loads(resp.read().decode("utf-8"))

        current = forecast_data.get("current") or {}
        now = datetime.utcnow()

        # Map Open-Meteo keys -> our feature names
        humidity = float(current.get("relative_humidity_2m"))
        pressure = float(current.get("pressure_msl"))
        wind_speed = float(current.get("wind_speed_10m"))
        clouds = float(current.get("cloud_cover"))
        rain_mm = float(current.get("rain", 0.0) or 0.0)
        temperature = current.get("temperature_2m")

        return {
            "city": resolved_name,
            "country": country,
            "latitude": lat,
            "longitude": lon,
            "temperature": float(temperature) if temperature is not None else None,
            "rain_mm": rain_mm,
            "humidity": humidity,
            "pressure": pressure,
            "wind_speed": wind_speed,
            "clouds": clouds,
            "month": now.month,
            "day": now.day,
            "source": "open-meteo",
            "timestamp": now.isoformat() + "Z",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather API error: {str(e)}")


@app.post("/predict", response_model=WeatherPrediction, tags=["Prediction"])
def predict_weather(
    input_data: WeatherInput,
    db: Session = Depends(get_db)
):
    """
    Predict temperature and rain based on weather parameters
    
    This endpoint:
    1. Accepts weather input parameters and optional city name
    2. Uses city-specific ML models (or default if city not specified)
    3. Predicts temperature and rain
    4. Stores the prediction in the database
    5. Returns the prediction results
    """
    try:
        # Get city-specific models (or default)
        city = input_data.city
        models = model_manager.get_models(city)
        
        temperature_model = models['temperature']
        rain_model = models['rain']
        scaler = models['scaler']
        
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
            city=city,
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
        
    except ValueError as e:
        # Model not found or unavailable
        raise HTTPException(status_code=404, detail=f"Model error: {str(e)}. Please train models first.")
    except KeyError as e:
        # Missing model components
        raise HTTPException(status_code=500, detail=f"Model configuration error: Missing {str(e)}. Please retrain models.")
    except Exception as e:
        # Log the full error for debugging
        import traceback
        error_details = traceback.format_exc()
        error_message = str(e)
        print(f"[ERROR] Prediction error: {error_message}")
        print(f"Full traceback:\n{error_details}")
        
        # Check if it's a database schema issue
        if "no such column" in error_message.lower() or "city" in error_message.lower():
            print("[INFO] Database schema may be outdated. Try deleting predictions.db and restarting.")
            raise HTTPException(
                status_code=500, 
                detail=f"Database schema error. Please delete predictions.db and restart the server. Error: {error_message}"
            )
        
        raise HTTPException(status_code=500, detail=f"Prediction error: {error_message}")


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
# ============================================================================
# AQI CALCULATION (NEW FEATURE)
# ============================================================================

def calculate_aqi(pm25: float, pm10: float) -> dict:
    """
    Simple AQI calculation based on PM2.5 (primary) and PM10.
    """
    if pm25 is not None:
        if pm25 <= 12:
            return {"aqi": pm25, "category": "Good"}
        elif pm25 <= 35.4:
            return {"aqi": pm25, "category": "Moderate"}
        elif pm25 <= 55.4:
            return {"aqi": pm25, "category": "Unhealthy for Sensitive Groups"}
        elif pm25 <= 150.4:
            return {"aqi": pm25, "category": "Unhealthy"}
        else:
            return {"aqi": pm25, "category": "Very Unhealthy"}

    if pm10 is not None:
        return {"aqi": pm10, "category": "Moderate"}

    return {"aqi": None, "category": "Unknown"}


# ============================================================================
# AIR QUALITY INDEX (OPEN-METEO – STABLE)
# ============================================================================

@app.get("/air-quality", tags=["Air Quality"])
def get_city_aqi(city: str):
    """
    Get AQI using Open-Meteo Air Quality API (reliable for India)
    """
    try:
        if not city or not city.strip():
            raise HTTPException(status_code=400, detail="City is required")

        # 1. Geocode city
        geo_url = (
            f"https://geocoding-api.open-meteo.com/v1/search?"
            f"name={urllib.parse.quote(city)}&count=1"
        )

        with urllib.request.urlopen(geo_url, timeout=10) as resp:
            geo_data = json.loads(resp.read().decode("utf-8"))

        if not geo_data.get("results"):
            raise HTTPException(status_code=404, detail="City not found")

        lat = geo_data["results"][0]["latitude"]
        lon = geo_data["results"][0]["longitude"]

        # 2. Air quality request
        aqi_url = (
            f"https://air-quality-api.open-meteo.com/v1/air-quality?"
            f"latitude={lat}&longitude={lon}"
            f"&hourly=us_aqi,pm2_5,pm10"
            f"&timezone=auto"
        )

        with urllib.request.urlopen(aqi_url, timeout=10) as resp:
            aqi_data = json.loads(resp.read().decode("utf-8"))

        hourly = aqi_data.get("hourly", {})
        if not hourly or "us_aqi" not in hourly:
            raise HTTPException(status_code=404, detail="AQI data not available")

        # Latest AQI value
        aqi_value = hourly["us_aqi"][-1]
        pm25 = hourly.get("pm2_5", [None])[-1]
        pm10 = hourly.get("pm10", [None])[-1]

        # AQI category
        if aqi_value <= 50:
            category = "Good"
        elif aqi_value <= 100:
            category = "Moderate"
        elif aqi_value <= 150:
            category = "Unhealthy for Sensitive Groups"
        elif aqi_value <= 200:
            category = "Unhealthy"
        elif aqi_value <= 300:
            category = "Very Unhealthy"
        else:
            category = "Hazardous"

        return {
            "city": city,
            "aqi": aqi_value,
            "category": category,
            "pm25": pm25,
            "pm10": pm10,
            "source": "open-meteo"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AQI lookup failed: {str(e)}")


# ============================================================================
# 7-DAY WEATHER FORECAST (FOR CHARTS)
# ============================================================================

@app.get("/weather/forecast/7days", tags=["Weather Forecast"])
def get_7_day_forecast(city: str):
    """
    Retrieve 7-day forecast including max/min temps and rain probability for charts.
    """
    try:
        # Geocode the city
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(city)}&count=1"
        with urllib.request.urlopen(geo_url, timeout=10) as resp:
            geo_data = json.loads(resp.read().decode("utf-8"))

        results = geo_data.get("results")
        if not results:
            raise HTTPException(status_code=404, detail="City not found")

        lat = float(results[0]["latitude"])
        lon = float(results[0]["longitude"])

        # Request daily forecast for 7 days
        forecast_url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max"
            f"&timezone=auto"
        )

        with urllib.request.urlopen(forecast_url, timeout=10) as resp:
            forecast = json.loads(resp.read().decode("utf-8"))

        daily = forecast.get("daily", {})

        forecast_list = []
        for i in range(min(len(daily.get("time", [])), 7)):
            forecast_list.append({
                "date": daily["time"][i],
                "temp_max": daily["temperature_2m_max"][i],
                "temp_min": daily["temperature_2m_min"][i],
                "rain_probability": daily["precipitation_probability_max"][i]
            })

        return {
            "city": city,
            "forecast": forecast_list
        }

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Forecast lookup failed: {str(e)}")
