"""
Evaluate All Models Script for Chest X-Ray Classification
Loads and evaluates CNN, ViT, and Classical ML models on test set
Produces comparison table and combined metrics
"""

import os
import sys
import json
import pickle
from datetime import datetime

import numpy as np
import torch
from PIL import Image
from tqdm import tqdm
from skimage.feature import hog
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score, classification_report
from torchvision import transforms, models
import torch.nn as nn

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════
DATASET_PATH = r"E:\archive\chest_xray"
WEIGHTS_PATH = r"D:\Medical-Image-Diagnosis\backend\weights"
IMAGE_SIZE_CLASSICAL = 128
IMAGE_SIZE_CNN = 224
NUM_CLASSES = 2

CLASS_LABELS = ['NORMAL', 'PNEUMONIA']
# ═══════════════════════════════════════════════════════════════════════════════


def print_header():
    """Print script header."""
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    print("=" * 70)
    print("MODEL EVALUATION - Chest X-Ray Classification")
    print("=" * 70)
    print(f"Device:   {device}")
    print(f"Dataset:  {DATASET_PATH}")
    print(f"Weights:  {WEIGHTS_PATH}")
    print(f"Classes:  {CLASS_LABELS}")
    print("=" * 70)
    print()
    
    return device


def load_test_images():
    """Load test images and labels."""
    test_path = os.path.join(DATASET_PATH, 'test')
    images = []
    labels = []
    paths = []
    
    print("Loading test images...")
    for class_idx, class_name in enumerate(CLASS_LABELS):
        class_path = os.path.join(test_path, class_name)
        
        if not os.path.exists(class_path):
            print(f"WARNING: Class folder not found: {class_path}")
            continue
        
        for img_file in os.listdir(class_path):
            if img_file.lower().endswith(('.jpg', '.jpeg', '.png')):
                img_path = os.path.join(class_path, img_file)
                paths.append(img_path)
                labels.append(class_idx)
    
    labels = np.array(labels)
    print(f"  Total: {len(paths)} images")
    print(f"  NORMAL: {np.sum(labels == 0)}, PNEUMONIA: {np.sum(labels == 1)}")
    
    return paths, labels


# ═══════════════════════════════════════════════════════════════════════════════
# CLASSICAL MODEL EVALUATION
# ═══════════════════════════════════════════════════════════════════════════════

def load_classical_model():
    """Load trained classical model."""
    model_path = os.path.join(WEIGHTS_PATH, 'classical_model.pkl')
    
    if not os.path.exists(model_path):
        print(f"  Classical model not found: {model_path}")
        return None, None
    
    with open(model_path, 'rb') as f:
        model_data = pickle.load(f)
    
    print(f"  Loaded {model_data['model_name']} model")
    return model_data['model'], model_data['scaler']


def extract_hog_features(image_path):
    """Extract HOG features from image."""
    try:
        img = Image.open(image_path).convert('L')
        img = img.resize((IMAGE_SIZE_CLASSICAL, IMAGE_SIZE_CLASSICAL))
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
    except Exception:
        return None


def evaluate_classical(paths, labels):
    """Evaluate classical model."""
    print("\n--- Evaluating Classical Model ---")
    
    model, scaler = load_classical_model()
    if model is None:
        return None
    
    # Extract features
    features_list = []
    valid_labels = []
    
    for path, label in tqdm(zip(paths, labels), total=len(paths), desc="Extracting HOG"):
        feat = extract_hog_features(path)
        if feat is not None:
            features_list.append(feat)
            valid_labels.append(label)
    
    X_test = np.array(features_list)
    y_test = np.array(valid_labels)
    
    # Scale features
    X_test_scaled = scaler.transform(X_test)
    
    # Predict
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    
    # Calculate metrics
    metrics = {
        'accuracy': round(accuracy_score(y_test, y_pred), 4),
        'auc_roc': round(roc_auc_score(y_test, y_prob), 4),
        'f1_score': round(f1_score(y_test, y_pred), 4)
    }
    
    print(f"  Accuracy: {metrics['accuracy']:.4f}")
    print(f"  AUC-ROC:  {metrics['auc_roc']:.4f}")
    print(f"  F1 Score: {metrics['f1_score']:.4f}")
    
    return metrics


# ═══════════════════════════════════════════════════════════════════════════════
# CNN MODEL EVALUATION
# ═══════════════════════════════════════════════════════════════════════════════

def load_cnn_model(device):
    """Load trained CNN model."""
    model_path = os.path.join(WEIGHTS_PATH, 'resnet50_best.pth')
    
    if not os.path.exists(model_path):
        print(f"  CNN model not found: {model_path}")
        return None
    
    # Create model architecture
    model = models.resnet50(weights=None)
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_features, 512),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(512, NUM_CLASSES)
    )
    
    # Load weights
    checkpoint = torch.load(model_path, map_location=device, weights_only=False)
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(device)
    model.eval()
    
    print(f"  Loaded ResNet-50 model")
    return model


def evaluate_cnn(paths, labels, device):
    """Evaluate CNN model."""
    print("\n--- Evaluating CNN (ResNet-50) ---")
    
    model = load_cnn_model(device)
    if model is None:
        return None
    
    # Transform
    transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE_CNN, IMAGE_SIZE_CNN)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    all_preds = []
    all_probs = []
    
    with torch.no_grad():
        for path in tqdm(paths, desc="CNN Inference"):
            img = Image.open(path).convert('RGB')
            img_tensor = transform(img).unsqueeze(0).to(device)
            
            outputs = model(img_tensor)
            probs = torch.softmax(outputs, dim=1)
            pred = outputs.argmax(dim=1).item()
            
            all_preds.append(pred)
            all_probs.append(probs[0, 1].cpu().item())
    
    # Calculate metrics
    metrics = {
        'accuracy': round(accuracy_score(labels, all_preds), 4),
        'auc_roc': round(roc_auc_score(labels, all_probs), 4),
        'f1_score': round(f1_score(labels, all_preds), 4)
    }
    
    print(f"  Accuracy: {metrics['accuracy']:.4f}")
    print(f"  AUC-ROC:  {metrics['auc_roc']:.4f}")
    print(f"  F1 Score: {metrics['f1_score']:.4f}")
    
    return metrics


# ═══════════════════════════════════════════════════════════════════════════════
# VIT MODEL EVALUATION
# ═══════════════════════════════════════════════════════════════════════════════

def load_vit_model(device):
    """Load trained ViT model."""
    model_path = os.path.join(WEIGHTS_PATH, 'vit_best.pth')
    
    if not os.path.exists(model_path):
        print(f"  ViT model not found: {model_path}")
        return None, None
    
    try:
        from transformers import ViTForImageClassification, ViTImageProcessor
        
        # Load checkpoint
        checkpoint = torch.load(model_path, map_location=device, weights_only=False)
        model_name = checkpoint.get('model_name', 'google/vit-base-patch16-224')
        
        # Load processor
        processor = ViTImageProcessor.from_pretrained(model_name)
        
        # Load model
        model = ViTForImageClassification.from_pretrained(
            model_name,
            num_labels=NUM_CLASSES,
            ignore_mismatched_sizes=True
        )
        model.load_state_dict(checkpoint['model_state_dict'])
        model = model.to(device)
        model.eval()
        
        print(f"  Loaded ViT model")
        return model, processor
    except Exception as e:
        print(f"  Error loading ViT model: {e}")
        return None, None


def evaluate_vit(paths, labels, device):
    """Evaluate ViT model."""
    print("\n--- Evaluating ViT ---")
    
    model, processor = load_vit_model(device)
    if model is None:
        return None
    
    all_preds = []
    all_probs = []
    
    with torch.no_grad():
        for path in tqdm(paths, desc="ViT Inference"):
            img = Image.open(path).convert('RGB')
            inputs = processor(images=img, return_tensors="pt")
            pixel_values = inputs['pixel_values'].to(device)
            
            outputs = model(pixel_values=pixel_values)
            probs = torch.softmax(outputs.logits, dim=1)
            pred = outputs.logits.argmax(dim=1).item()
            
            all_preds.append(pred)
            all_probs.append(probs[0, 1].cpu().item())
    
    # Calculate metrics
    metrics = {
        'accuracy': round(accuracy_score(labels, all_preds), 4),
        'auc_roc': round(roc_auc_score(labels, all_probs), 4),
        'f1_score': round(f1_score(labels, all_preds), 4)
    }
    
    print(f"  Accuracy: {metrics['accuracy']:.4f}")
    print(f"  AUC-ROC:  {metrics['auc_roc']:.4f}")
    print(f"  F1 Score: {metrics['f1_score']:.4f}")
    
    return metrics


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    """Main evaluation function."""
    device = print_header()
    
    # Load test data
    paths, labels = load_test_images()
    
    # Evaluate all models
    results = {}
    
    # CNN
    cnn_metrics = evaluate_cnn(paths, labels, device)
    if cnn_metrics:
        results['CNN'] = cnn_metrics
    
    # ViT
    vit_metrics = evaluate_vit(paths, labels, device)
    if vit_metrics:
        results['ViT'] = vit_metrics
    
    # Classical
    classical_metrics = evaluate_classical(paths, labels)
    if classical_metrics:
        results['Classical'] = classical_metrics
    
    # Print comparison table
    print("\n" + "=" * 70)
    print("MODEL COMPARISON")
    print("=" * 70)
    print()
    print(f"{'Model':<12} | {'Accuracy':>10} | {'AUC-ROC':>10} | {'F1':>10}")
    print("-" * 50)
    
    for model_name, metrics in results.items():
        print(f"{model_name:<12} | {metrics['accuracy']:>10.4f} | {metrics['auc_roc']:>10.4f} | {metrics['f1_score']:>10.4f}")
    
    print("-" * 50)
    
    # Find best model
    if results:
        best_model = max(results.keys(), key=lambda k: results[k]['auc_roc'])
        print(f"\nBest Model (by AUC-ROC): {best_model}")
    
    # Save combined metrics
    os.makedirs(WEIGHTS_PATH, exist_ok=True)
    metrics_path = os.path.join(WEIGHTS_PATH, 'all_metrics.json')
    
    combined_metrics = {
        'models': results,
        'best_model': best_model if results else None,
        'evaluated_at': datetime.now().isoformat(),
        'test_samples': len(labels),
        'class_distribution': {
            'NORMAL': int(np.sum(labels == 0)),
            'PNEUMONIA': int(np.sum(labels == 1))
        }
    }
    
    with open(metrics_path, 'w') as f:
        json.dump(combined_metrics, f, indent=2)
    
    print(f"\nCombined metrics saved to: {metrics_path}")
    
    print("\n" + "=" * 70)
    print("EVALUATION COMPLETE")
    print("=" * 70)


if __name__ == '__main__':
    main()
