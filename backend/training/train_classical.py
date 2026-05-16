"""
Training script for classical ML models (SVM and XGBoost).
Extracts HOG+LBP features and trains both models, selecting the best.
"""

import os
import logging
import yaml
import pickle
from argparse import ArgumentParser
from pathlib import Path
from tqdm import tqdm

import numpy as np
from PIL import Image
from torchvision.datasets import ImageFolder

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score

from ml.preprocessing.feature_extractor import extract_combined_features

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def extract_features_from_dataset(dataset_path: str) -> tuple:
    """
    Extract combined HOG+LBP features from all images in dataset.
    
    Args:
        dataset_path: Path to dataset directory
        
    Returns:
        Tuple of (features_array, labels_array, class_names)
    """
    image_folder = ImageFolder(dataset_path)
    all_features = []
    all_labels = []
    
    logger.info(f"Extracting features from {len(image_folder)} images...")
    
    for image_path, label in tqdm(image_folder.imgs):
        try:
            image = Image.open(image_path).convert('RGB')
            features = extract_combined_features(image)
            all_features.append(features)
            all_labels.append(label)
        except Exception as e:
            logger.warning(f"Failed to process {image_path}: {e}")
            continue
    
    features_array = np.array(all_features)
    labels_array = np.array(all_labels)
    
    logger.info(f"Extracted features shape: {features_array.shape}")
    
    return features_array, labels_array, image_folder.classes


def train_svm(X_train, y_train, X_val, y_val):
    """
    Train SVM model.
    
    Args:
        X_train: Training features
        y_train: Training labels
        X_val: Validation features
        y_val: Validation labels
        
    Returns:
        Trained pipeline and performance metrics
    """
    logger.info("Training SVM model...")
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('svm', SVC(kernel='rbf', C=100, gamma='scale', probability=True))
    ])
    
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = pipeline.predict(X_val)
    accuracy = accuracy_score(y_val, y_pred)
    f1 = f1_score(y_val, y_pred, average='macro')
    
    try:
        y_proba = pipeline.predict_proba(X_val)
        auc_roc = roc_auc_score(y_val, y_proba, multi_class='ovr')
    except:
        auc_roc = 0.0
    
    metrics = {
        'model': 'SVM',
        'accuracy': accuracy,
        'f1_score': f1,
        'auc_roc': auc_roc
    }
    
    logger.info(f"SVM Metrics - Accuracy: {accuracy:.4f}, F1: {f1:.4f}, AUC-ROC: {auc_roc:.4f}")
    
    return pipeline, metrics


def train_xgboost(X_train, y_train, X_val, y_val):
    """
    Train XGBoost model.
    
    Args:
        X_train: Training features
        y_train: Training labels
        X_val: Validation features
        y_val: Validation labels
        
    Returns:
        Trained pipeline and performance metrics
    """
    logger.info("Training XGBoost model...")
    
    num_classes = len(np.unique(y_train))
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('xgboost', XGBClassifier(
            n_estimators=200,
            max_depth=7,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            num_class=num_classes,
            eval_metric='mlogloss',
            random_state=42,
            verbosity=0
        ))
    ])
    
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = pipeline.predict(X_val)
    accuracy = accuracy_score(y_val, y_pred)
    f1 = f1_score(y_val, y_pred, average='macro')
    
    try:
        y_proba = pipeline.predict_proba(X_val)
        auc_roc = roc_auc_score(y_val, y_proba, multi_class='ovr')
    except:
        auc_roc = 0.0
    
    metrics = {
        'model': 'XGBoost',
        'accuracy': accuracy,
        'f1_score': f1,
        'auc_roc': auc_roc
    }
    
    logger.info(f"XGBoost Metrics - Accuracy: {accuracy:.4f}, F1: {f1:.4f}, AUC-ROC: {auc_roc:.4f}")
    
    return pipeline, metrics


def train_classical_models(config: dict) -> dict:
    """
    Main training loop for classical ML models.
    
    Args:
        config: Configuration dictionary
        
    Returns:
        Dictionary with training results
    """
    dataset_path = config.get('dataset_path', 'data/chest_xray')
    weights_path = config.get('weights_path', 'backend/weights/svm_pipeline.pkl')
    
    # Create weights directory
    os.makedirs(os.path.dirname(weights_path), exist_ok=True)
    
    # Load train and validation data
    logger.info("Loading datasets...")
    X_train, y_train, classes = extract_features_from_dataset(
        os.path.join(dataset_path, 'train')
    )
    X_val, y_val, _ = extract_features_from_dataset(
        os.path.join(dataset_path, 'val')
    )
    
    logger.info(f"Classes: {classes}")
    logger.info(f"Training set size: {X_train.shape}")
    logger.info(f"Validation set size: {X_val.shape}")
    
    # Train both models
    svm_pipeline, svm_metrics = train_svm(X_train, y_train, X_val, y_val)
    xgb_pipeline, xgb_metrics = train_xgboost(X_train, y_train, X_val, y_val)
    
    # Compare and select best
    logger.info("\n=== Model Comparison ===")
    logger.info(f"SVM AUC-ROC: {svm_metrics['auc_roc']:.4f}")
    logger.info(f"XGBoost AUC-ROC: {xgb_metrics['auc_roc']:.4f}")
    
    if svm_metrics['auc_roc'] >= xgb_metrics['auc_roc']:
        best_pipeline = svm_pipeline
        best_metrics = svm_metrics
        logger.info("Selected: SVM")
    else:
        best_pipeline = xgb_pipeline
        best_metrics = xgb_metrics
        logger.info("Selected: XGBoost")
    
    # Save best model
    with open(weights_path, 'wb') as f:
        pickle.dump(best_pipeline, f)
    
    logger.info(f"Best model saved to {weights_path}")
    
    return {
        'weights_path': weights_path,
        'best_model': best_metrics['model'],
        'metrics': best_metrics,
        'svm_metrics': svm_metrics,
        'xgb_metrics': xgb_metrics
    }


def main():
    """Main entry point."""
    parser = ArgumentParser()
    parser.add_argument('--config', default='training/configs/classical_config.yaml')
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
    
    results = train_classical_models(config)
    logger.info(f"\n=== Final Results ===")
    logger.info(f"Best Model: {results['best_model']}")
    logger.info(f"Metrics: {results['metrics']}")


if __name__ == '__main__':
    main()
