Below is a **single, unified, professional README** that **merges frontend + backend perfectly** and matches the **final state of your project**.
This is **submission-ready**, **viva-safe**, and **portfolio-quality**.

👉 You can **replace your entire `README.md` with this**.

---

# 🌦️ WeatherAI – ML Powered Weather Prediction System

**WeatherAI** is a full-stack **machine learning–based weather prediction web application** that forecasts **temperature, rain probability, air quality index (AQI), and 7-day weather trends** for Indian cities.
The system integrates **trained ML models**, **real-time weather APIs**, and a **modern interactive frontend**.

---

## ✨ Key Features

### 🤖 Machine Learning

* 🌡️ Temperature Prediction (Regression)
* 🌧️ Rain Prediction (Binary Classification)
* 📊 Feature Importance & Model Evaluation
* 🧠 City-specific trained models

### 🌐 Web Application

* 🎨 Modern, animated UI (Next.js + Tailwind)
* 🌤️ Dynamic background based on weather conditions
* 📅 7-Day weather forecast
* 🌬️ Air Quality Index (AQI) with health categories
* 🔄 Real-time API integration

### ⚙️ Backend System

* ⚡ FastAPI REST backend
* 📄 Automatic API documentation (Swagger & ReDoc)
* 🗄️ SQLite database for prediction history
* 🌍 Trained on real Indian weather datasets (123k+ records)

---

## 🧠 Machine Learning Models

| Task                   | Algorithm                |
| ---------------------- | ------------------------ |
| Temperature Prediction | Random Forest Regressor  |
| Rain Prediction        | Random Forest Classifier |
| Preprocessing          | StandardScaler           |

### 🔢 Input Features

* Humidity (%)
* Atmospheric Pressure (hPa)
* Wind Speed (m/s)
* Cloud Cover (%)
* Month
* Day

---

## 📊 Model Performance

| Model             | Metric   | Value       |
| ----------------- | -------- | ----------- |
| Temperature Model | RMSE     | **1.36 °C** |
| Temperature Model | R² Score | **0.929**   |
| Rain Model        | Accuracy | **~88%**    |

Evaluation graphs generated:

* Actual vs Predicted Temperature
* Temperature Error Distribution
* Feature Importance
* Rain Confusion Matrix

---

## 🖥️ Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Framer Motion
* Lucide Icons

### Backend

* Python
* FastAPI
* Scikit-learn
* Pandas
* SQLite
* Open-Meteo API

---

## 📂 Project Structure

```
Weather-prediction-with-ML/
│
├── backend/
│   ├── main.py            # FastAPI backend
│   ├── database.py        # DB models
│   ├── train_models.py    # Model training
│   ├── graph.py           # Evaluation graphs
│   ├── models/            # Trained ML models
│   ├── Datasets/          # City-wise datasets
│   └── requirements.txt
│
├── frontend/
│   ├── app/               # Next.js routes
│   ├── components/        # UI components
│   ├── lib/               # API utilities
│   └── styles/
│
└── README.md
```

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Rishi-saw/Weather-prediction-with-ML.git
cd Weather-prediction-with-ML
```

---

### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs at:

```
http://localhost:8000
```

API Docs:

* Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
* ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

## 📡 Backend API Overview

### POST `/predict`

Predict temperature & rain.

**Request**

```json
{
  "humidity": 75,
  "pressure": 1010,
  "wind_speed": 15,
  "clouds": 60,
  "month": 7,
  "day": 15,
  "city": "Kolkata"
}
```

**Response**

```json
{
  "predicted_temperature": 30.3,
  "predicted_rain": "Yes",
  "rain_probability": 0.73
}
```

### Other Endpoints

* `GET /air-quality`
* `GET /forecast`
* `GET /history`
* `GET /stats`
* `GET /health`
* `DELETE /history`

---

## 📈 Generate Evaluation Graphs

```bash
cd backend
python graph.py
```

Outputs:

* `report_temp_actual_vs_predicted.png`
* `report_temp_error_histogram.png`
* `report_feature_importance.png`
* `report_rain_confusion_matrix.png`

---

## 🌐 Deployment

### Backend

* Render / Railway supported
* SQLite (default) or PostgreSQL (production)

### Frontend

* Deployable on Vercel

---

## 🔮 Future Enhancements

* 🚨 Extreme weather alerts
* 📍 Map-based weather visualization
* 📱 Mobile-first UI
* 🧪 Advanced models (XGBoost, LSTM)
* ☁️ Cloud-scale deployment

---

## 👨‍💻 Author

**Rishi**
Built using **Machine Learning, FastAPI, and Next.js**

---

## 📜 License

MIT License — free for academic and educational use.

---

## 🎯 Final Note

This project demonstrates:

* End-to-end ML pipeline
* Real-world data handling
* Model evaluation & interpretation
* Modern full-stack integration

Perfect for **final-year projects, portfolios, and demos**.
