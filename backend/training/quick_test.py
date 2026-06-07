"""
Quick Test Script for Chest X-Ray Classification
Loads 50 images and trains a simple classical ML model
Used to verify dataset is loading correctly before full training
Should complete in under 2 minutes
"""

import os
import sys
import time
from datetime import datetime

import numpy as np
from PIL import Image
from skimage.feature import hog
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════
DATASET_PATH = r"E:\archive\chest_xray"
IMAGE_SIZE = 128
QUICK_SAMPLES = 50  # Total samples to load (25 per class)

CLASS_LABELS = ['NORMAL', 'PNEUMONIA']
# ═══════════════════════════════════════════════════════════════════════════════


def print_header():
    """Print script header."""
    print("=" * 60)
    print("QUICK TEST - Chest X-Ray Dataset Verification")
    print("=" * 60)
    print(f"Dataset: {DATASET_PATH}")
    print(f"Samples: {QUICK_SAMPLES} (for quick test)")
    print("=" * 60)
    print()


def check_dataset_structure():
    """Verify dataset folder structure exists."""
    print("Checking dataset structure...")
    
    required_paths = [
        os.path.join(DATASET_PATH, 'train'),
        os.path.join(DATASET_PATH, 'train', 'NORMAL'),
        os.path.join(DATASET_PATH, 'train', 'PNEUMONIA'),
        os.path.join(DATASET_PATH, 'test'),
        os.path.join(DATASET_PATH, 'test', 'NORMAL'),
        os.path.join(DATASET_PATH, 'test', 'PNEUMONIA'),
    ]
    
    all_exist = True
    for path in required_paths:
        exists = os.path.exists(path)
        status = "✓" if exists else "✗"
        print(f"  {status} {path}")
        if not exists:
            all_exist = False
    
    if not all_exist:
        print("\nERROR: Dataset structure is incomplete!")
        print("Please ensure dataset is at:", DATASET_PATH)
        return False
    
    print("\n  Dataset structure: OK")
    return True


def count_images():
    """Count images in each split."""
    print("\nCounting images...")
    
    splits = ['train', 'val', 'test']
    counts = {}
    
    for split in splits:
        split_path = os.path.join(DATASET_PATH, split)
        if not os.path.exists(split_path):
            counts[split] = {'NORMAL': 0, 'PNEUMONIA': 0, 'total': 0}
            continue
        
        normal_count = 0
        pneumonia_count = 0
        
        normal_path = os.path.join(split_path, 'NORMAL')
        if os.path.exists(normal_path):
            normal_count = len([f for f in os.listdir(normal_path) 
                               if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        
        pneumonia_path = os.path.join(split_path, 'PNEUMONIA')
        if os.path.exists(pneumonia_path):
            pneumonia_count = len([f for f in os.listdir(pneumonia_path) 
                                  if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        
        counts[split] = {
            'NORMAL': normal_count,
            'PNEUMONIA': pneumonia_count,
            'total': normal_count + pneumonia_count
        }
    
    # Print counts
    print("\n  Image counts:")
    print(f"  {'Split':<8} | {'NORMAL':>8} | {'PNEUMONIA':>10} | {'Total':>8}")
    print("  " + "-" * 45)
    for split, c in counts.items():
        print(f"  {split:<8} | {c['NORMAL']:>8} | {c['PNEUMONIA']:>10} | {c['total']:>8}")
    
    total = sum(c['total'] for c in counts.values())
    print("  " + "-" * 45)
    print(f"  {'TOTAL':<8} | {'':<8} | {'':<10} | {total:>8}")
    
    return counts


def extract_hog_features(image_path):
    """Extract HOG features from image."""
    try:
        img = Image.open(image_path).convert('L')
        img = img.resize((IMAGE_SIZE, IMAGE_SIZE))
        img_array = np.array(img)
        
        features = hog(
            img_array,
            orientations=9,
            pixels_per_cell=(8, 8),
            cells_per_block=(2, 2),
            block_norm='L2-Hys',
            visualize=False,
            feature_vector=True
        )
        return features
    except Exception as e:
        print(f"    Error: {e}")
        return None


def load_quick_samples(split='train'):
    """Load a small number of samples for quick testing."""
    print(f"\nLoading {QUICK_SAMPLES} samples from {split} set...")
    
    features_list = []
    labels_list = []
    samples_per_class = QUICK_SAMPLES // 2
    
    split_path = os.path.join(DATASET_PATH, split)
    
    for class_idx, class_name in enumerate(CLASS_LABELS):
        class_path = os.path.join(split_path, class_name)
        
        if not os.path.exists(class_path):
            print(f"    WARNING: {class_path} not found")
            continue
        
        image_files = [f for f in os.listdir(class_path) 
                       if f.lower().endswith(('.jpg', '.jpeg', '.png'))][:samples_per_class]
        
        print(f"  Loading {len(image_files)} {class_name} images...")
        
        for img_file in image_files:
            img_path = os.path.join(class_path, img_file)
            features = extract_hog_features(img_path)
            
            if features is not None:
                features_list.append(features)
                labels_list.append(class_idx)
    
    features = np.array(features_list)
    labels = np.array(labels_list)
    
    print(f"  Loaded {len(labels)} samples total")
    print(f"    NORMAL: {np.sum(labels == 0)}")
    print(f"    PNEUMONIA: {np.sum(labels == 1)}")
    print(f"    Feature shape: {features.shape}")
    
    return features, labels


def train_quick_model(X_train, y_train, X_test, y_test):
    """Train a simple SVM classifier."""
    print("\nTraining quick SVM classifier...")
    
    # Normalize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train SVM (fast linear kernel for quick test)
    model = SVC(kernel='linear', C=1.0, random_state=42)
    
    start_time = time.time()
    model.fit(X_train_scaled, y_train)
    train_time = time.time() - start_time
    
    print(f"  Training time: {train_time:.2f}s")
    
    # Evaluate
    train_acc = accuracy_score(y_train, model.predict(X_train_scaled))
    test_acc = accuracy_score(y_test, model.predict(X_test_scaled))
    
    print(f"  Train accuracy: {train_acc:.4f}")
    print(f"  Test accuracy:  {test_acc:.4f}")
    
    return model, test_acc


def test_single_prediction(model, scaler, image_path):
    """Test prediction on a single image."""
    print(f"\nTesting single prediction...")
    print(f"  Image: {os.path.basename(image_path)}")
    
    features = extract_hog_features(image_path)
    if features is None:
        print("  ERROR: Could not extract features")
        return
    
    features_scaled = scaler.transform([features])
    prediction = model.predict(features_scaled)[0]
    
    predicted_class = CLASS_LABELS[prediction]
    print(f"  Prediction: {predicted_class}")
    
    return predicted_class


def main():
    """Main test function."""
    print_header()
    
    start_time = datetime.now()
    
    # Check dataset structure
    if not check_dataset_structure():
        sys.exit(1)
    
    # Count images
    counts = count_images()
    
    if counts['train']['total'] == 0:
        print("\nERROR: No training images found!")
        sys.exit(1)
    
    # Load quick samples
    X_train, y_train = load_quick_samples('train')
    X_test, y_test = load_quick_samples('test')
    
    if len(X_train) == 0 or len(X_test) == 0:
        print("\nERROR: Could not load samples!")
        sys.exit(1)
    
    # Train quick model
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    model, test_acc = train_quick_model(X_train, y_train, X_test, y_test)
    
    # Test single prediction
    test_normal_path = os.path.join(DATASET_PATH, 'test', 'NORMAL')
    if os.path.exists(test_normal_path):
        test_images = [f for f in os.listdir(test_normal_path) 
                       if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if test_images:
            sample_path = os.path.join(test_normal_path, test_images[0])
            test_single_prediction(model, scaler, sample_path)
    
    # Summary
    end_time = datetime.now()
    duration = end_time - start_time
    
    print("\n" + "=" * 60)
    print("QUICK TEST RESULTS")
    print("=" * 60)
    print()
    print(f"  Status:        Dataset OK ✓")
    print(f"  Train images:  {counts['train']['total']}")
    print(f"  Test images:   {counts['test']['total']}")
    print(f"  Test accuracy: {test_acc:.4f}")
    print(f"  Total time:    {duration}")
    print()
    print("  Ready to run full training!")
    print()
    print("  Next steps:")
    print("    1. python training/train_classical.py  (15-30 min)")
    print("    2. python training/train_cnn.py        (6-10 hours on CPU)")
    print("    3. python training/evaluate_all.py     (5-10 min)")
    print()
    print("=" * 60)


if __name__ == '__main__':
    main()
