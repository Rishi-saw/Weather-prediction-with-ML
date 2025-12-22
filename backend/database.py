"""
Database Configuration and Models
SQLAlchemy setup for storing weather predictions
"""

from datetime import datetime
from sqlalchemy import Column, DateTime, Float, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database URL (creates predictions.db file in current directory)
SQLALCHEMY_DATABASE_URL = "sqlite:///./predictions.db"

# Create engine with SQLite-specific configuration
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


class Prediction(Base):
    """
    Database model for storing weather predictions
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    city = Column(String, nullable=True, index=True)  # City name for tracking
    
    # Input features
    humidity = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    clouds = Column(Float, nullable=False)
    month = Column(Integer, nullable=False)
    day = Column(Integer, nullable=False)
    
    # Predictions
    predicted_temperature = Column(Float, nullable=False)
    predicted_rain = Column(String, nullable=False)  # "Yes" or "No"
    rain_probability = Column(Float, nullable=True)  # Store probability for analytics

    def __repr__(self):
        return f"<Prediction(id={self.id}, city={self.city}, temp={self.predicted_temperature}°C, rain={self.predicted_rain})>"


def init_db():
    """
    Initialize database - create all tables
    Call this when starting the application
    """
    Base.metadata.create_all(bind=engine)
    print("[OK] Database initialized successfully")


def get_db():
    """
    Dependency for getting database sessions
    Yields a database session and ensures it's closed after use
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
