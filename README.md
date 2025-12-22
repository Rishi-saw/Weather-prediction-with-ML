# Weather Prediction Web App Backend

Complete ML-powered weather prediction system with FastAPI backend, trained on real Kolkata weather data.

## 🌟 Features

- **ML Models**: Temperature prediction (Regression) + Rain prediction (Classification)
- **FastAPI Backend**: RESTful API with automatic documentation
- **Database**: SQLite database storing all prediction history
- **Real Data**: Trained on 123,000+ Kolkata weather records
- **CORS Enabled**: Ready for frontend integration

## 📊 Model Performance

- **Temperature Model**: RMSE 1.36°C, R² 0.929
- **Rain Model**: 88% accuracy

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Train Models (if needed)

```bash
python train_models.py --csv Kolkata.csv
```

This generates:
- `temperature_model.pkl`
- `rain_model.pkl`
- `scaler.pkl`

### 3. Run API Server

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:

```bash
python main.py
```

### 4. Access API

- **API Root**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📡 API Endpoints

### POST `/predict`

Predict temperature and rain based on weather parameters.

**Request Body:**
```json
{
  "humidity": 75.0,
  "pressure": 1010.0,
  "wind_speed": 15.0,
  "clouds": 60.0,
  "month": 7,
  "day": 15
}
```

**Response:**
```json
{
  "predicted_temperature": 30.31,
  "predicted_rain": "Yes",
  "rain_probability": 0.7333
}
```

### GET `/history?limit=50`

Get recent prediction history from database.

### GET `/stats`

Get statistics about all predictions:
- Total predictions
- Rain vs No Rain count
- Average temperature

### GET `/health`

Health check endpoint.

### DELETE `/history`

Clear all prediction history.

## 🧪 Testing

### Test Models Locally

```bash
python test_model.py
```

Interactive CLI for testing ML models directly.

### Test API Endpoints

```bash
python test_api.py
```

Runs comprehensive API tests on all endpoints.

## 📁 Project Structure

```
weather predict app/
├── main.py                      # FastAPI application
├── database.py                  # SQLAlchemy database models
├── train_models.py              # Model training script
├── test_model.py                # Interactive model tester
├── test_api.py                  # API endpoint tester
├── requirements.txt             # Python dependencies
├── Kolkata.csv                  # Training dataset
├── temperature_model.pkl        # Trained regression model
├── rain_model.pkl               # Trained classification model
├── scaler.pkl                   # Feature scaler
├── predictions.db               # SQLite database (auto-created)
└── README.md                    # This file
```

## 🌐 Deployment

### Deploy to Render

1. **Create `render.yaml`** (see below)
2. Push code to GitHub
3. Connect repository to Render
4. Deploy automatically

### Deploy to Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and deploy:
   ```bash
   railway login
   railway init
   railway up
   ```

### Environment Variables

No environment variables required for basic deployment. The app uses SQLite by default.

For PostgreSQL in production, set:
```
DATABASE_URL=postgresql://user:pass@host:port/db
```

And update `database.py` to use `DATABA SE_URL`.

## 🔧 Configuration

### Change Port

Edit `main.py`:
```python
uvicorn.run("main:app", host="0.0.0.0", port=YOUR_PORT)
```

### Change Database

Edit `database.py`:
```python
SQLALCHEMY_DATABASE_URL = "postgresql://..."
```

### CORS Origins

For production, edit `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.com"],
    ...
)
```

## 🛠️ Development

### Run in Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Auto-reloads on code changes.

### Run in Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Uses 4 worker processes for better performance.

## 📦 Model Details

### Input Features (6)
1. `humidity` - Relative humidity (0-100%)
2. `pressure` - Atmospheric pressure (hPa)
3. `wind_speed` - Wind speed (m/s)
4. `clouds` - Cloud cover (0-100%)
5. `month` - Month number (1-12)
6. `day` - Day of month (1-31)

### Output
1. `predicted_temperature` - Temperature in °C
2. `predicted_rain` - "Yes" or "No"
3. `rain_probability` - Probability of rain (0-1)

### Models
- **Temperature**: RandomForestRegressor (200 trees)
- **Rain**: RandomForestClassifier (200 trees)
- **Preprocessing**: StandardScaler for feature normalization

## 📝 License

MIT License - Feel free to use for any purpose.

## 🤝 Contributing

Contributions welcome! Please submit pull requests or open issues.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using FastAPI, scikit-learn, and real Kolkata weather data**
