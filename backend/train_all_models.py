"""
Quick script to train models for all cities
Run this to generate city-specific models
"""

import subprocess
import sys
import os

def main():
    """Train models for all cities"""
    print("=" * 60)
    print("Training Models for All Cities")
    print("=" * 60)
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    datasets_dir = os.path.join(os.path.dirname(script_dir), 'Datasets')
    
    # Check if Datasets directory exists
    if not os.path.exists(datasets_dir):
        print(f"ERROR: Datasets directory not found at {datasets_dir}")
        print("Please ensure the Datasets folder exists in the project root.")
        sys.exit(1)
    
    # Run the training script
    print(f"\nUsing datasets from: {datasets_dir}")
    print("\nStarting training process...\n")
    
    try:
        result = subprocess.run(
            [sys.executable, 'train_models.py', '--all', '--datasets-dir', datasets_dir],
            cwd=script_dir,
            check=True
        )
        print("\n" + "=" * 60)
        print("SUCCESS: Model training completed successfully!")
        print("=" * 60)
        print("\nYou can now restart the backend server to use city-specific models.")
        
    except subprocess.CalledProcessError as e:
        print(f"\nERROR: Error during training: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nERROR: Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

