"""
Evaluation script for all trained models.
Computes metrics on test set and stores results in database seed file.
"""

import os
import logging
import json
import yaml
from argparse import ArgumentParser
from pathlib import Path

import torch
import numpy as np
from PIL import Image
from torchvision.datasets import ImageFolder
from torchvision import transforms
from sklearn.metrics import (
    accuracy_score, roc_auc_score, f1_score, confusion_matrix,
    precision_score, recall_score
)
from tqdm import tqdm

from ml.inference.cnn_model import CNNModel
from ml.inference.vit_model import ViTModel
from ml.inference.classical_model import ClassicalModel
from ml.inference.ensemble import EnsembleModel

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def evaluate_model(model, test_images, test_labels, model_name: str) -> dict:
    """
    Evaluate a single model on test set.
    
    Args:
        model: Model instance with predict method
        test_images: List of test images
        test_labels: List of test labels
        model_name: Name of model
        
    Returns:
        Dictionary with evaluation metrics
    """
    logger.info(f"Evaluating {model_name}...")
    
    predictions = []
    confidences = []
    
    for image_path in tqdm(test_images):
        try:
            image = Image.open(image_path).convert('RGB')
            result = model.predict(image)
            predictions.append(result['prediction'])
            confidences.append(result['confidence'])
        except Exception as e:
            logger.warning(f"Failed to evaluate {image_path}: {e}")
            predictions.append(None)
            confidences.append(0.0)
    
    # Convert predictions to indices
    class_labels = [
        'Atelectasis', 'Cardiomegaly', 'Effusion', 'Infiltration',
        'Mass', 'Nodule', 'Pneumonia', 'Pneumothorax', 'Normal'
    ]
    
    pred_indices = []
    for pred in predictions:
        try:
            idx = class_labels.index(pred)
            pred_indices.append(idx)
        except:
            pred_indices.append(0)
    
    pred_indices = np.array(pred_indices)
    test_labels = np.array(test_labels)
    
    # Compute metrics
    accuracy = accuracy_score(test_labels, pred_indices)
    precision = precision_score(test_labels, pred_indices, average='macro', zero_division=0)
    recall = recall_score(test_labels, pred_indices, average='macro', zero_division=0)
    f1 = f1_score(test_labels, pred_indices, average='macro', zero_division=0)
    
    try:
        auc_roc = roc_auc_score(
            test_labels,
            confidences,
            multi_class='ovr',
            average='macro'
        )
    except:
        auc_roc = 0.0
    
    confusion = confusion_matrix(test_labels, pred_indices).tolist()
    
    metrics = {
        'model_name': model_name,
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'auc_roc': float(auc_roc),
        'confusion_matrix': confusion
    }
    
    logger.info(
        f"{model_name} Results - "
        f"Accuracy: {accuracy:.4f}, F1: {f1:.4f}, AUC-ROC: {auc_roc:.4f}"
    )
    
    return metrics


def evaluate_all_models(config: dict) -> dict:
    """
    Evaluate all models (CNN, ViT, Classical) and ensemble.
    
    Args:
        config: Configuration dictionary
        
    Returns:
        Dictionary with all model metrics
    """
    dataset_path = config.get('dataset_path', 'data/chest_xray')
    output_file = config.get('output_file', 'training/evaluation_results.json')
    
    # Load test dataset
    logger.info("Loading test dataset...")
    test_dataset = ImageFolder(os.path.join(dataset_path, 'test'))
    test_images = [path for path, _ in test_dataset.imgs]
    test_labels = [label for _, label in test_dataset.imgs]
    
    logger.info(f"Test set size: {len(test_images)}")
    
    # Initialize models
    logger.info("Initializing models...")
    cnn_model = CNNModel()
    vit_model = ViTModel()
    classical_model = ClassicalModel()
    ensemble = EnsembleModel()
    
    # Evaluate individual models
    results = {
        'timestamp': str(np.datetime64('now')),
        'test_set_size': len(test_images),
        'models': {}
    }
    
    cnn_metrics = evaluate_model(cnn_model, test_images, test_labels, 'CNN (ResNet-50)')
    results['models']['cnn'] = cnn_metrics
    
    vit_metrics = evaluate_model(vit_model, test_images, test_labels, 'ViT')
    results['models']['vit'] = vit_metrics
    
    classical_metrics = evaluate_model(classical_model, test_images, test_labels, 'Classical ML')
    results['models']['classical'] = classical_metrics
    
    # Evaluate ensemble
    logger.info("Evaluating ensemble...")
    ensemble_predictions = []
    ensemble_confidences = []
    ensemble_agreements = []
    
    for image_path in tqdm(test_images):
        try:
            image = Image.open(image_path).convert('RGB')
            
            cnn_result = cnn_model.predict(image)
            vit_result = vit_model.predict(image)
            classical_result = classical_model.predict(image)
            
            ensemble_result = ensemble.aggregate_predictions([
                cnn_result, vit_result, classical_result
            ])
            
            ensemble_predictions.append(ensemble_result['prediction'])
            ensemble_confidences.append(ensemble_result['confidence'])
            ensemble_agreements.append(ensemble_result['agreement_score'])
            
        except Exception as e:
            logger.warning(f"Ensemble evaluation failed for {image_path}: {e}")
            ensemble_predictions.append(None)
            ensemble_confidences.append(0.0)
            ensemble_agreements.append(0.0)
    
    # Compute ensemble metrics
    class_labels = [
        'Atelectasis', 'Cardiomegaly', 'Effusion', 'Infiltration',
        'Mass', 'Nodule', 'Pneumonia', 'Pneumothorax', 'Normal'
    ]
    
    ensemble_pred_indices = []
    for pred in ensemble_predictions:
        try:
            idx = class_labels.index(pred)
            ensemble_pred_indices.append(idx)
        except:
            ensemble_pred_indices.append(0)
    
    ensemble_accuracy = accuracy_score(test_labels, ensemble_pred_indices)
    ensemble_f1 = f1_score(test_labels, ensemble_pred_indices, average='macro', zero_division=0)
    ensemble_auc = roc_auc_score(
        test_labels,
        ensemble_confidences,
        multi_class='ovr',
        average='macro'
    )
    
    results['models']['ensemble'] = {
        'model_name': 'Ensemble',
        'accuracy': float(ensemble_accuracy),
        'f1_score': float(ensemble_f1),
        'auc_roc': float(ensemble_auc),
        'avg_agreement': float(np.mean(ensemble_agreements))
    }
    
    logger.info(
        f"Ensemble Results - "
        f"Accuracy: {ensemble_accuracy:.4f}, F1: {ensemble_f1:.4f}, AUC-ROC: {ensemble_auc:.4f}, "
        f"Avg Agreement: {np.mean(ensemble_agreements):.4f}"
    )
    
    # Save results
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Results saved to {output_file}")
    
    return results


def main():
    """Main entry point."""
    parser = ArgumentParser()
    parser.add_argument('--config', default='training/configs/cnn_config.yaml')
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
    
    results = evaluate_all_models(config)
    
    logger.info("\n=== Summary ===")
    for model_name, metrics in results['models'].items():
        logger.info(f"{model_name}: {metrics}")


if __name__ == '__main__':
    main()
