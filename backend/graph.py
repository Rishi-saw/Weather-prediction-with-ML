import pickle
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix
import seaborn as sns

# ===============================
# LOAD DATA (SAME AS TRAINING)
# ===============================

DATA_PATH = "Datasets/Kolkata.csv"  # <-- CHANGE ONLY THIS if needed

df = pd.read_csv(DATA_PATH)

# Create month and day from date (required by trained model)
df['date'] = pd.to_datetime(df['date'])
df['month'] = df['date'].dt.month
df['day'] = df['date'].dt.day

# Rename columns to match training feature names
df = df.rename(columns={
    "relative_humidity_2m": "humidity",
    "pressure_msl": "pressure",
    "wind_speed_10m": "wind_speed",
    "cloud_cover": "clouds",
})

FEATURES = [
    'humidity',
    'pressure',
    'wind_speed',
    'clouds',
    'month',
    'day'
]

X = df[FEATURES]

y_temp = df['temperature_2m']
# Convert rain values to binary labels (same logic as training)
y_rain = (df['rain'] > 0).astype(int)



# ===============================
# LOAD MODELS
# ===============================

with open("models/kolkata_scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

with open("models/kolkata_temperature_model.pkl", "rb") as f:
    temp_model = pickle.load(f)

with open("models/kolkata_rain_model.pkl", "rb") as f:
    rain_model = pickle.load(f)

X_scaled = scaler.transform(X)

# ===============================
# 1️⃣ ACTUAL vs PREDICTED TEMP
# ===============================

temp_pred = temp_model.predict(X_scaled)

plt.figure(figsize=(10, 5))
plt.plot(y_temp.values[:100], label="Actual")
plt.plot(temp_pred[:100], label="Predicted")
plt.title("Actual vs Predicted Temperature")
plt.xlabel("Sample Index")
plt.ylabel("Temperature (°C)")
plt.legend()
plt.tight_layout()
plt.savefig("report_temp_actual_vs_predicted.png")
plt.show()

# ===============================
# 2️⃣ TEMP ERROR HISTOGRAM
# ===============================

errors = temp_pred - y_temp

plt.figure(figsize=(8, 4))
plt.hist(errors, bins=30, edgecolor="black")
plt.title("Temperature Prediction Error Distribution")
plt.xlabel("Error (°C)")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig("report_temp_error_histogram.png")
plt.show()

# ===============================
# 3️⃣ FEATURE IMPORTANCE
# ===============================

temp_model.n_jobs = 1
importances = temp_model.feature_importances_.astype(float)


plt.figure(figsize=(8, 4))
plt.barh(FEATURES, importances)
plt.title("Feature Importance (Temperature Model)")
plt.xlabel("Importance")
plt.tight_layout()
plt.savefig("report_feature_importance.png")
plt.show()

# ===============================
# 4️⃣ RAIN CONFUSION MATRIX
# ===============================

rain_pred = rain_model.predict(X_scaled)

cm = confusion_matrix(y_rain, rain_pred)

plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
plt.title("Rain Prediction Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.tight_layout()
plt.savefig("report_rain_confusion_matrix.png")
plt.show()
