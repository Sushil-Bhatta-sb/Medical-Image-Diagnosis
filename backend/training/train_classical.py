"""
Classical ML Training Script for Chest X-Ray Classification
Trains SVM and Random Forest on HOG features
Binary Classification: NORMAL vs PNEUMONIA
"""

import os
import sys
import json
import pickle
import warnings
from datetime import datetime

import numpy as np
from PIL import Image
from tqdm import tqdm
from skimage.feature import hog
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, roc_auc_score, f1_score,
    classification_report, confusion_matrix
)
from sklearn.utils.class_weight import compute_class_weight

warnings.filterwarnings('ignore')

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════
DATASET_PATH = r"E:\archive\chest_xray"
WEIGHTS_PATH = r"D:\Medical-Image-Diagnosis\backend\weights"
IMAGE_SIZE = 128
MAX_SAMPLES = None  # Set to 500 for quick test, None for full training

# HOG Parameters
HOG_ORIENTATIONS = 9
HOG_PIXELS_PER_CELL = (8, 8)
HOG_CELLS_PER_BLOCK = (2, 2)

# Model Parameters
SVM_C = 1.0
SVM_KERNEL = 'rbf'
RF_N_ESTIMATORS = 100

CLASS_LABELS = ['NORMAL', 'PNEUMONIA']
# ═══════════════════════════════════════════════════════════════════════════════


def print_header():
    """Print script header with configuration."""
    print("=" * 70)
    print("CLASSICAL ML TRAINING - Chest X-Ray Classification")
    print("=" * 70)
    print(f"Dataset:     {DATASET_PATH}")
    print(f"Weights:     {WEIGHTS_PATH}")
    print(f"Image Size:  {IMAGE_SIZE}x{IMAGE_SIZE}")
    print(f"Max Samples: {MAX_SAMPLES if MAX_SAMPLES else 'All'}")
    print(f"Classes:     {CLASS_LABELS}")
    print("=" * 70)
    print()


def extract_hog_features(image_path):
    """
    Extract HOG features from a single image.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        HOG feature vector or None if extraction fails
    """
    try:
        # Load and preprocess image
        img = Image.open(image_path).convert('L')  # Convert to grayscale
        img = img.resize((IMAGE_SIZE, IMAGE_SIZE))
        img_array = np.array(img)
        
        # Extract HOG features
        features = hog(
            img_array,
            orientations=HOG_ORIENTATIONS,
            pixels_per_cell=HOG_PIXELS_PER_CELL,
            cells_per_block=HOG_CELLS_PER_BLOCK,
            block_norm='L2-Hys',
            visualize=False,
            feature_vector=True
        )
        return features
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return None


def load_dataset(split='train'):
    """
    Load images from a dataset split and extract HOG features.
    
    Args:
        split: 'train', 'val', or 'test'
        
    Returns:
        features: numpy array of HOG features
        labels: numpy array of labels (0=NORMAL, 1=PNEUMONIA)
    """
    features_list = []
    labels_list = []
    
    split_path = os.path.join(DATASET_PATH, split)
    
    if not os.path.exists(split_path):
        print(f"ERROR: Split path not found: {split_path}")
        sys.exit(1)
    
    # Count total images for progress bar
    total_images = 0
    for class_idx, class_name in enumerate(CLASS_LABELS):
        class_path = os.path.join(split_path, class_name)
        if os.path.exists(class_path):
            files = [f for f in os.listdir(class_path) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            total_images += len(files)
    
    if MAX_SAMPLES:
        total_images = min(total_images, MAX_SAMPLES)
    
    print(f"\nLoading {split} set ({total_images} images max)...")
    
    sample_count = 0
    pbar = tqdm(total=total_images, desc=f"Extracting HOG [{split}]")
    
    for class_idx, class_name in enumerate(CLASS_LABELS):
        class_path = os.path.join(split_path, class_name)
        
        if not os.path.exists(class_path):
            print(f"WARNING: Class folder not found: {class_path}")
            continue
        
        image_files = [f for f in os.listdir(class_path) 
                       if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        for img_file in image_files:
            if MAX_SAMPLES and sample_count >= MAX_SAMPLES:
                break
                
            img_path = os.path.join(class_path, img_file)
            features = extract_hog_features(img_path)
            
            if features is not None:
                features_list.append(features)
                labels_list.append(class_idx)
                sample_count += 1
                
                # Progress update every 100 images
                if sample_count % 100 == 0:
                    pbar.set_postfix({'processed': sample_count})
            
            pbar.update(1)
        
        if MAX_SAMPLES and sample_count >= MAX_SAMPLES:
            break
    
    pbar.close()
    
    features = np.array(features_list)
    labels = np.array(labels_list)
    
    print(f"  Loaded {len(labels)} samples")
    print(f"  NORMAL: {np.sum(labels == 0)}, PNEUMONIA: {np.sum(labels == 1)}")
    print(f"  Feature shape: {features.shape}")
    
    return features, labels


def train_models(X_train, y_train):
    """
    Train SVM and Random Forest classifiers.
    
    Args:
        X_train: Training features
        y_train: Training labels
        
    Returns:
        Dictionary of trained models and scaler
    """
    print("\n" + "=" * 70)
    print("TRAINING MODELS")
    print("=" * 70)
    
    # Compute class weights for imbalanced data
    class_weights = compute_class_weight(
        class_weight='balanced',
        classes=np.unique(y_train),
        y=y_train
    )
    class_weight_dict = {i: w for i, w in enumerate(class_weights)}
    print(f"\nClass weights: {class_weight_dict}")
    
    # Normalize features
    print("\nNormalizing features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    models = {}
    
    # Train SVM
    print(f"\nTraining SVM (kernel={SVM_KERNEL}, C={SVM_C})...")
    svm_model = SVC(
        kernel=SVM_KERNEL,
        C=SVM_C,
        class_weight='balanced',
        probability=True,
        random_state=42,
        verbose=True
    )
    svm_model.fit(X_train_scaled, y_train)
    models['SVM'] = svm_model
    print("  SVM training complete!")
    
    # Train Random Forest
    print(f"\nTraining Random Forest (n_estimators={RF_N_ESTIMATORS})...")
    rf_model = RandomForestClassifier(
        n_estimators=RF_N_ESTIMATORS,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    rf_model.fit(X_train_scaled, y_train)
    models['RandomForest'] = rf_model
    print("  Random Forest training complete!")
    
    return models, scaler


def evaluate_model(model, X_test, y_test, model_name):
    """
    Evaluate a trained model on the test set.
    
    Args:
        model: Trained classifier
        X_test: Test features (already scaled)
        y_test: Test labels
        model_name: Name of the model for display
        
    Returns:
        Dictionary of metrics
    """
    print(f"\n--- Evaluating {model_name} ---")
    
    # Predictions
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]  # Probability of PNEUMONIA
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    auc_roc = roc_auc_score(y_test, y_prob)
    f1 = f1_score(y_test, y_pred)
    
    metrics = {
        'accuracy': round(accuracy, 4),
        'auc_roc': round(auc_roc, 4),
        'f1_score': round(f1, 4)
    }
    
    print(f"  Accuracy: {accuracy:.4f}")
    print(f"  AUC-ROC:  {auc_roc:.4f}")
    print(f"  F1 Score: {f1:.4f}")
    
    print(f"\n  Classification Report:")
    report = classification_report(y_test, y_pred, target_names=CLASS_LABELS)
    print(report)
    
    print(f"  Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"  {cm}")
    
    return metrics


def save_best_model(models, metrics, scaler):
    """
    Save the best performing model.
    
    Args:
        models: Dictionary of trained models
        metrics: Dictionary of metrics for each model
        scaler: Fitted StandardScaler
    """
    # Create weights directory if it doesn't exist
    os.makedirs(WEIGHTS_PATH, exist_ok=True)
    
    # Find best model based on AUC-ROC
    best_model_name = max(metrics.keys(), key=lambda k: metrics[k]['auc_roc'])
    best_model = models[best_model_name]
    best_metrics = metrics[best_model_name]
    
    print("\n" + "=" * 70)
    print("SAVING BEST MODEL")
    print("=" * 70)
    print(f"Best model: {best_model_name}")
    print(f"AUC-ROC:    {best_metrics['auc_roc']:.4f}")
    
    # Save model and scaler together
    model_path = os.path.join(WEIGHTS_PATH, 'classical_model.pkl')
    model_data = {
        'model': best_model,
        'scaler': scaler,
        'model_name': best_model_name,
        'class_labels': CLASS_LABELS,
        'image_size': IMAGE_SIZE,
        'hog_params': {
            'orientations': HOG_ORIENTATIONS,
            'pixels_per_cell': HOG_PIXELS_PER_CELL,
            'cells_per_block': HOG_CELLS_PER_BLOCK
        },
        'trained_at': datetime.now().isoformat()
    }
    
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)
    print(f"Model saved to: {model_path}")
    
    # Save metrics
    metrics_path = os.path.join(WEIGHTS_PATH, 'classical_metrics.json')
    all_metrics = {
        'best_model': best_model_name,
        'models': metrics,
        'trained_at': datetime.now().isoformat(),
        'config': {
            'image_size': IMAGE_SIZE,
            'max_samples': MAX_SAMPLES,
            'svm_c': SVM_C,
            'svm_kernel': SVM_KERNEL,
            'rf_n_estimators': RF_N_ESTIMATORS
        }
    }
    
    with open(metrics_path, 'w') as f:
        json.dump(all_metrics, f, indent=2)
    print(f"Metrics saved to: {metrics_path}")


def main():
    """Main training function."""
    print_header()
    
    start_time = datetime.now()
    
    # Load training data
    X_train, y_train = load_dataset('train')
    
    # Load test data
    X_test, y_test = load_dataset('test')
    
    # Train models
    models, scaler = train_models(X_train, y_train)
    
    # Scale test features
    X_test_scaled = scaler.transform(X_test)
    
    # Evaluate models
    print("\n" + "=" * 70)
    print("EVALUATION ON TEST SET")
    print("=" * 70)
    
    metrics = {}
    for model_name, model in models.items():
        metrics[model_name] = evaluate_model(model, X_test_scaled, y_test, model_name)
    
    # Save best model
    save_best_model(models, metrics, scaler)
    
    # Print summary
    end_time = datetime.now()
    duration = end_time - start_time
    
    print("\n" + "=" * 70)
    print("TRAINING COMPLETE")
    print("=" * 70)
    print(f"Total time: {duration}")
    print("\nModel Comparison:")
    print("-" * 50)
    print(f"{'Model':<15} | {'Accuracy':>10} | {'AUC-ROC':>10} | {'F1':>10}")
    print("-" * 50)
    for name, m in metrics.items():
        print(f"{name:<15} | {m['accuracy']:>10.4f} | {m['auc_roc']:>10.4f} | {m['f1_score']:>10.4f}")
    print("-" * 50)


if __name__ == '__main__':
    main()
