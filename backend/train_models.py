"""
Weather Prediction ML Model Training
Train regression model for temperature prediction and classification model for rain prediction
Supports training models for multiple cities
"""

import argparse
import os
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report
import pickle
import warnings
warnings.filterwarnings('ignore')

# City name mapping (CSV filename -> normalized city name)
CITY_MAPPING = {
    'Kolkata.csv': 'Kolkata',
    'Delhi.csv': 'Delhi',
    'Mumbai.csv': 'Mumbai',
    'mumbai.csv': 'Mumbai',
    'Bengaluru.csv': 'Bengaluru',
    'chennai.csv': 'Chennai',
    'Hyderabad.csv': 'Hyderabad'
}

# Load and prepare real weather dataset
def load_dataset(csv_path, city_name=None):
    """
    Load weather data from CSV for any city
    Handles two CSV formats:
    1. Full format: date, temperature_2m, relative_humidity_2m, pressure_msl, cloud_cover, wind_speed_10m, rain
    2. Simple format: Date, Rain, Temp Max, Temp Min (uses averages/estimates for missing features)
    """
    if city_name:
        print(f"\nLoading {city_name} data from: {csv_path}")
    else:
        print(f"\nLoading data from: {csv_path}")
    
    # Read CSV
    df = pd.read_csv(csv_path)
    
    print(f"Original dataset shape: {df.shape}")
    print(f"Columns found: {list(df.columns)}")
    
    # Normalize column names (handle case differences)
    df.columns = df.columns.str.strip().str.lower()
    
    # Detect CSV format and process accordingly
    if 'date' in df.columns and 'temperature_2m' in df.columns:
        # Format 1: Full format (Kolkata-style)
        print("Detected: Full format dataset")
        df['date'] = pd.to_datetime(df['date'])
        df['month'] = df['date'].dt.month
        df['day'] = df['date'].dt.day
        
        # Rename columns
        column_mapping = {
            'temperature_2m': 'temperature',
            'relative_humidity_2m': 'humidity',
            'pressure_msl': 'pressure',
            'cloud_cover': 'clouds',
            'wind_speed_10m': 'wind_speed'
        }
        df = df.rename(columns=column_mapping)
        
    elif 'date' in df.columns and ('temp max' in df.columns or 'temp_max' in df.columns):
        # Format 2: Simple format (Bengaluru-style)
        print("Detected: Simple format dataset")
        # Normalize temp column names
        temp_max_col = 'temp max' if 'temp max' in df.columns else 'temp_max'
        temp_min_col = 'temp min' if 'temp min' in df.columns else 'temp_min'
        
        # Parse date
        date_col = 'date' if 'date' in df.columns else 'Date'
        df['date'] = pd.to_datetime(df[date_col], errors='coerce')
        df['month'] = df['date'].dt.month
        df['day'] = df['date'].dt.day
        
        # Convert temperature columns to numeric (handle any string values)
        df[temp_max_col] = pd.to_numeric(df[temp_max_col], errors='coerce')
        df[temp_min_col] = pd.to_numeric(df[temp_min_col], errors='coerce')
        
        # Use average of max and min as temperature
        df['temperature'] = (df[temp_max_col] + df[temp_min_col]) / 2
        
        # Normalize/ensure rain column exists early (some files use 'rain', others 'rain' derived from 'rain'/'precipitation')
        # Many of these "simple" datasets have 'rain' as a string, so coerce before any comparisons.
        if 'rain' not in df.columns:
            if 'precipitation' in df.columns:
                df['rain'] = df['precipitation']
            else:
                # If no rain column at all, default to 0 (will be handled later if required)
                df['rain'] = 0
        df['rain'] = pd.to_numeric(df['rain'], errors='coerce').fillna(0)

        # Estimate missing features with reasonable defaults based on temperature
        # These are approximations - not ideal but allows training
        df['humidity'] = 60 + (df['temperature'] - 25) * 2  # Higher temp = lower humidity (rough estimate)
        df['humidity'] = df['humidity'].clip(30, 95)  # Keep in reasonable range
        
        df['pressure'] = 1013 - (df['temperature'] - 25) * 0.5  # Slight pressure variation
        df['pressure'] = df['pressure'].clip(990, 1030)
        
        df['wind_speed'] = 10 + np.random.normal(0, 3, len(df))  # Random around 10 m/s
        df['wind_speed'] = df['wind_speed'].clip(0, 30)
        
        df['clouds'] = 50  # Default cloud cover
        # If rain > 0, increase cloud cover
        df.loc[df['rain'] > 0, 'clouds'] = 70
        
        print("Note: Using estimated values for humidity, pressure, wind_speed, and clouds")
        
    else:
        raise ValueError(f"Unsupported CSV format. Columns: {list(df.columns)}")
    
    # Ensure rain column exists
    if 'rain' not in df.columns:
        raise ValueError("Rain column not found in dataset")
    # Convert rain to numeric early
    df['rain'] = pd.to_numeric(df['rain'], errors='coerce').fillna(0)
    
    # Ensure numeric types for core features
    numeric_cols = ['humidity', 'pressure', 'wind_speed', 'clouds', 'temperature']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Select only the columns we need
    required_columns = ['humidity', 'pressure', 'wind_speed', 'clouds', 'month', 'day', 'temperature', 'rain']
    
    # Check if all required columns exist
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in dataset: {missing}")
    
    df = df[required_columns]
    
    # Handle missing values
    print(f"\nMissing values before cleaning:")
    print(df.isnull().sum())
    
    # Drop rows with missing values
    df = df.dropna()
    
    # Convert rain to binary (0 or 1) if not already
    df['rain'] = (df['rain'] > 0).astype(int)
    
    print(f"\nDataset shape after cleaning: {df.shape}")
    print(f"Rain distribution: {df['rain'].value_counts()}")
    
    return df

def train_city_models(csv_path, city_name, datasets_dir='../Datasets'):
    """
    Train models for a specific city
    """
    # Construct full path
    if not os.path.isabs(csv_path):
        csv_path = os.path.join(datasets_dir, csv_path)
    
    print("\n" + "=" * 60)
    print(f"Training models for: {city_name}")
    print("=" * 60)
    
    # Load dataset
    df = load_dataset(csv_path, city_name)
    
    if len(df) < 100:
        print(f"[WARNING] {city_name} dataset has only {len(df)} records. Skipping...")
        return None
    
    # Prepare features and targets
    feature_columns = ['humidity', 'pressure', 'wind_speed', 'clouds', 'month', 'day']
    X = df[feature_columns]
    y_temperature = df['temperature']
    y_rain = df['rain']
    
    # Split ONCE so X/temp/rain all align (previous code split twice -> mismatched targets)
    X_train, X_test, y_temp_train, y_temp_test, y_rain_train, y_rain_test = train_test_split(
        X,
        y_temperature,
        y_rain,
        test_size=0.2,
        random_state=42,
        stratify=y_rain if len(np.unique(y_rain)) > 1 else None,
    )
    
    # Feature scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train temperature model
    print(f"\nTraining temperature model for {city_name}...")
    temperature_model = RandomForestRegressor(
        n_estimators=500,
        max_depth=None,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    temperature_model.fit(X_train_scaled, y_temp_train)
    
    # Evaluate temperature model
    y_temp_pred = temperature_model.predict(X_test_scaled)
    temp_rmse = np.sqrt(mean_squared_error(y_temp_test, y_temp_pred))
    temp_r2 = r2_score(y_temp_test, y_temp_pred)
    
    print(f"  Temperature Model Performance:")
    print(f"    RMSE: {temp_rmse:.2f}°C")
    print(f"    R² Score: {temp_r2:.4f}")
    
    # Train rain model
    print(f"\nTraining rain model for {city_name}...")
    rain_model = RandomForestClassifier(
        n_estimators=500,
        max_depth=None,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    rain_model.fit(X_train_scaled, y_rain_train)
    
    # Evaluate rain model
    y_rain_pred = rain_model.predict(X_test_scaled)
    rain_accuracy = accuracy_score(y_rain_test, y_rain_pred)
    
    print(f"  Rain Model Performance:")
    print(f"    Accuracy: {rain_accuracy:.4f}")
    try:
        print("    Classification report:")
        print(classification_report(y_rain_test, y_rain_pred, digits=4))
    except Exception:
        pass
    
    # Save models with city name
    models_dir = 'models'
    os.makedirs(models_dir, exist_ok=True)
    
    city_normalized = city_name.lower().replace(' ', '_')
    
    # Save temperature model
    temp_model_path = os.path.join(models_dir, f'{city_normalized}_temperature_model.pkl')
    with open(temp_model_path, 'wb') as f:
        pickle.dump(temperature_model, f)
    print(f"\n[OK] Temperature model saved: {temp_model_path}")
    
    # Save rain model
    rain_model_path = os.path.join(models_dir, f'{city_normalized}_rain_model.pkl')
    with open(rain_model_path, 'wb') as f:
        pickle.dump(rain_model, f)
    print(f"[OK] Rain model saved: {rain_model_path}")
    
    # Save scaler
    scaler_path = os.path.join(models_dir, f'{city_normalized}_scaler.pkl')
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"[OK] Scaler saved: {scaler_path}")
    
    return {
        'city': city_name,
        'temp_rmse': temp_rmse,
        'temp_r2': temp_r2,
        'rain_accuracy': rain_accuracy,
        'samples': len(df)
    }

# Parse command line arguments
parser = argparse.ArgumentParser(description='Train weather prediction models for cities')
parser.add_argument('--csv', type=str, default=None, help='Path to specific city CSV file')
parser.add_argument('--all', action='store_true', help='Train models for all cities in Datasets folder')
parser.add_argument('--datasets-dir', type=str, default='../Datasets', help='Directory containing CSV datasets')
args = parser.parse_args()

# Train models
if args.all:
    # Train models for all cities
    print("=" * 60)
    print("Training Models for ALL Cities")
    print("=" * 60)
    
    datasets_dir = args.datasets_dir
    if not os.path.exists(datasets_dir):
        datasets_dir = 'Datasets'  # Try current directory
    
    results = []
    
    # Find all CSV files
    csv_files = [f for f in os.listdir(datasets_dir) if f.endswith('.csv')]
    
    if not csv_files:
        print(f"[ERROR] No CSV files found in {datasets_dir}")
        exit(1)
    
    print(f"\nFound {len(csv_files)} city datasets:")
    for csv_file in csv_files:
        city_name = CITY_MAPPING.get(csv_file, csv_file.replace('.csv', '').title())
        print(f"  - {city_name} ({csv_file})")
    
    print("\n" + "=" * 60)
    
    for csv_file in csv_files:
        city_name = CITY_MAPPING.get(csv_file, csv_file.replace('.csv', '').title())
        try:
            result = train_city_models(csv_file, city_name, datasets_dir)
            if result:
                results.append(result)
        except Exception as e:
            print(f"ERROR: Error training {city_name}: {str(e)}")
            import traceback
            traceback.print_exc()
            continue
    
    # Summary
    print("\n" + "=" * 60)
    print("TRAINING SUMMARY")
    print("=" * 60)
    print(f"\nSuccessfully trained models for {len(results)} cities:\n")
    for result in results:
        print(f"  {result['city']}:")
        print(f"    Samples: {result['samples']}")
        print(f"    Temp RMSE: {result['temp_rmse']:.2f}°C, R²: {result['temp_r2']:.4f}")
        print(f"    Rain Accuracy: {result['rain_accuracy']:.4f}")
    
    # Also create a default/combined model (using Kolkata as fallback)
    print("\n" + "=" * 60)
    print("Creating default model (Kolkata as fallback)")
    print("=" * 60)
    kolkata_csv = os.path.join(datasets_dir, 'Kolkata.csv')
    if os.path.exists(kolkata_csv):
        train_city_models('Kolkata.csv', 'default', datasets_dir)
    
elif args.csv:
    # Train model for single city
    csv_path = args.csv
    city_name = CITY_MAPPING.get(os.path.basename(csv_path), 
                                  os.path.basename(csv_path).replace('.csv', '').title())
    
    print("=" * 60)
    print(f"Training Models for: {city_name}")
    print("=" * 60)
    
    train_city_models(csv_path, city_name, args.datasets_dir)
    
else:
    # Default: Train Kolkata model (backward compatibility)
    print("=" * 60)
    print("Training Default Model (Kolkata)")
    print("=" * 60)
    print("Use --all to train for all cities or --csv <file> for specific city")
    
    datasets_dir = args.datasets_dir
    if not os.path.exists(datasets_dir):
        datasets_dir = 'Datasets'
    
    kolkata_csv = os.path.join(datasets_dir, 'Kolkata.csv')
    if os.path.exists(kolkata_csv):
        train_city_models('Kolkata.csv', 'default', datasets_dir)
    else:
        # Fallback to old behavior
        print("\n[WARNING] Kolkata.csv not found. Using old training method...")
        df = load_dataset('Kolkata.csv')
        print(f"\nFirst 5 rows:")
        print(df.head())
        print(f"\nBasic statistics:")
        print(df.describe())
        
        # Prepare features and targets
        feature_columns = ['humidity', 'pressure', 'wind_speed', 'clouds', 'month', 'day']
        X = df[feature_columns]
        y_temperature = df['temperature']
        y_rain = df['rain']
        
        # Split data
        X_train, X_test, y_temp_train, y_temp_test = train_test_split(
            X, y_temperature, test_size=0.2, random_state=42
        )
        _, _, y_rain_train, y_rain_test = train_test_split(
            X, y_rain, test_size=0.2, random_state=42
        )
        
        # Feature scaling
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train models
        temperature_model = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
        rain_model = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
        
        temperature_model.fit(X_train_scaled, y_temp_train)
        rain_model.fit(X_train_scaled, y_rain_train)
        
        # Save as default models
        with open('temperature_model.pkl', 'wb') as f:
            pickle.dump(temperature_model, f)
        with open('rain_model.pkl', 'wb') as f:
            pickle.dump(rain_model, f)
        with open('scaler.pkl', 'wb') as f:
            pickle.dump(scaler, f)
        
        print("\n[OK] Default models saved (backward compatibility)")
