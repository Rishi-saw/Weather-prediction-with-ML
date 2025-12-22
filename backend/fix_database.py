"""
Script to fix database schema by recreating it with the city field
Run this if you get database schema errors
"""

import os
from database import Base, engine, Prediction

def fix_database():
    """Recreate database with updated schema"""
    db_file = "predictions.db"
    
    if os.path.exists(db_file):
        print(f"Found existing database: {db_file}")
        print("Deleting old database to recreate with updated schema...")
        try:
            os.remove(db_file)
            print(f"Deleted {db_file}")
        except Exception as e:
            print(f"Error deleting database: {e}")
            return
    
    # Create new database with updated schema
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Database created successfully with updated schema (including city field)")
        print("[OK] You can now restart the backend server")
    except Exception as e:
        print(f"[ERROR] Failed to create database: {e}")

if __name__ == "__main__":
    fix_database()

