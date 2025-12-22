# Multi-City ML Models Integration Guide

## Overview

The backend now supports city-specific ML models! Each city has its own trained models for more accurate predictions based on local weather patterns.

## What Changed

### 1. **Training Script (`train_models.py`)**
- Now supports training models for all cities
- Creates separate models for each city in the `models/` directory
- Maintains backward compatibility with default models

### 2. **Backend API (`main.py`)**
- Automatically loads all available city models
- Uses city-specific models when city name is provided
- Falls back to default model if city-specific model not found

### 3. **Database (`database.py`)**
- Added `city` field to track which city each prediction is for
- Enables city-specific analytics

### 4. **Frontend (`lib/api.ts`)**
- Automatically sends city name in prediction requests
- Uses city-specific models transparently

## How to Train Models for All Cities

### Option 1: Train All Cities at Once (Recommended)

```bash
cd backend
python train_models.py --all --datasets-dir ../Datasets
```

This will:
- Find all CSV files in the Datasets folder
- Train separate models for each city
- Save models in `backend/models/` directory
- Create a default model (using Kolkata) for fallback

### Option 2: Train Specific City

```bash
cd backend
python train_models.py --csv ../Datasets/Delhi.csv --datasets-dir ../Datasets
```

### Option 3: Train Single City (Old Method)

```bash
cd backend
python train_models.py --csv Kolkata.csv
```

## Model File Structure

After training, you'll have:

```
backend/
├── models/
│   ├── kolkata_temperature_model.pkl
│   ├── kolkata_rain_model.pkl
│   ├── kolkata_scaler.pkl
│   ├── delhi_temperature_model.pkl
│   ├── delhi_rain_model.pkl
│   ├── delhi_scaler.pkl
│   ├── mumbai_temperature_model.pkl
│   ├── mumbai_rain_model.pkl
│   ├── mumbai_scaler.pkl
│   └── ... (for each city)
├── temperature_model.pkl  # Default (backward compatibility)
├── rain_model.pkl          # Default
└── scaler.pkl             # Default
```

## Using City-Specific Models

### API Request

The `/predict` endpoint now accepts an optional `city` parameter:

```json
{
  "humidity": 75.0,
  "pressure": 1010.0,
  "wind_speed": 15.0,
  "clouds": 60.0,
  "month": 7,
  "day": 15,
  "city": "Kolkata"  // Optional: uses city-specific model
}
```

### City Name Mapping

The backend automatically normalizes city names:
- "Kolkata" → `kolkata`
- "Delhi" → `delhi`
- "Mumbai" → `mumbai`
- "Bengaluru" or "Bangalore" → `bengaluru`
- "Chennai" → `chennai`
- "Hyderabad" → `hyderabad`

### Fallback Behavior

1. **City-specific model exists**: Uses that city's model
2. **City-specific model not found**: Falls back to default model
3. **No city specified**: Uses default model

## Available Cities

Based on your datasets, the following cities are supported:

- **Kolkata** (Kolkata.csv)
- **Delhi** (Delhi.csv)
- **Mumbai** (mumbai.csv)
- **Bengaluru** (Bengaluru.csv)
- **Chennai** (chennai.csv)
- **Hyderabad** (Hyderabad.csv)

## Testing

### 1. Train Models

```bash
cd backend
python train_models.py --all --datasets-dir ../Datasets
```

### 2. Start Backend

```bash
python main.py
```

### 3. Check Available Models

```bash
curl http://localhost:8000/health
```

Response will show:
```json
{
  "status": "healthy",
  "models_loaded": true,
  "database": "connected",
  "available_cities": ["default", "kolkata", "delhi", "mumbai", ...]
}
```

### 4. Test City-Specific Prediction

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "humidity": 75.0,
    "pressure": 1010.0,
    "wind_speed": 15.0,
    "clouds": 60.0,
    "month": 7,
    "day": 15,
    "city": "Kolkata"
  }'
```

## Benefits

1. **More Accurate Predictions**: Each city's model is trained on that city's specific weather patterns
2. **Better Performance**: Models optimized for local climate conditions
3. **Scalable**: Easy to add new cities by training new models
4. **Backward Compatible**: Still works with default models if city-specific models aren't available

## Troubleshooting

### Models Not Loading

**Problem**: Backend shows "No models available"

**Solution**: 
```bash
cd backend
python train_models.py --all --datasets-dir ../Datasets
```

### City Model Not Found

**Problem**: Using city name but getting default model predictions

**Solution**: 
1. Check if model files exist: `ls backend/models/`
2. Verify city name matches CSV filename
3. Train model for that city: `python train_models.py --csv ../Datasets/CityName.csv`

### Database Migration

**Problem**: Database doesn't have `city` column

**Solution**: Delete `predictions.db` and restart backend (it will recreate with new schema)

## Next Steps

1. Train models for all cities: `python train_models.py --all`
2. Restart backend to load new models
3. Test predictions for different cities
4. Check database to see city-specific predictions

## Example: Training All Cities

```bash
# Navigate to backend directory
cd backend

# Train models for all cities
python train_models.py --all --datasets-dir ../Datasets

# Expected output:
# ============================================================
# Training Models for ALL Cities
# ============================================================
# Found 6 city datasets:
#   - Kolkata (Kolkata.csv)
#   - Delhi (Delhi.csv)
#   - Mumbai (mumbai.csv)
#   - Bengaluru (Bengaluru.csv)
#   - Chennai (chennai.csv)
#   - Hyderabad (Hyderabad.csv)
#
# Training models for: Kolkata
# ...
# ✓ Models loaded for: kolkata
# ...
# TRAINING SUMMARY
# Successfully trained models for 6 cities
```

## API Documentation

Visit `http://localhost:8000/docs` to see the updated API documentation with the new `city` parameter.

