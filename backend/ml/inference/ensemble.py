"""
Ensemble model combining predictions from CNN, ViT, and Classical ML.
Uses majority voting and confidence averaging.
"""

import logging
from typing import Dict, Any, List
import numpy as np
from collections import Counter

logger = logging.getLogger(__name__)


class EnsembleModel:
    """
    Ensemble model that aggregates predictions from multiple models.
    
    Uses:
    - Majority voting for final label
    - Average confidence from models that voted for winning class
    - Agreement scoring
    """

    def __init__(self):
        """Initialize ensemble model."""
        self.class_labels = [
            'Atelectasis',
            'Cardiomegaly',
            'Effusion',
            'Infiltration',
            'Mass',
            'Nodule',
            'Pneumonia',
            'Pneumothorax',
            'Normal'
        ]

    def aggregate_predictions(
        self,
        predictions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Combine predictions from multiple models using ensemble logic.
        
        Args:
            predictions: List of prediction dicts from individual models.
                        Each dict has 'prediction' (str) and 'confidence' (float)
        
        Returns:
            Ensemble prediction dict with:
            - prediction: final label (majority vote)
            - confidence: averaged confidence
            - agreement_score: how much models agree (0-1)
            - class_probabilities: aggregated probabilities
        """
        if not predictions or len(predictions) == 0:
            logger.error("No predictions provided to ensemble")
            raise ValueError("Ensemble requires at least one prediction")
        
        # Extract predictions and confidences
        pred_labels = [p['prediction'] for p in predictions]
        pred_confidences = [p['confidence'] for p in predictions]
        class_probs_list = [p.get('class_probabilities', {}) for p in predictions]
        
        # Majority vote
        vote_counts = Counter(pred_labels)
        final_prediction, vote_count = vote_counts.most_common(1)[0]
        
        # Calculate agreement score
        agreement_score = vote_count / len(predictions)
        
        # Average confidence of winning predictions
        winning_confidences = [
            conf for label, conf in zip(pred_labels, pred_confidences)
            if label == final_prediction
        ]
        average_confidence = np.mean(winning_confidences) if winning_confidences else 0.0
        
        # Aggregate class probabilities
        aggregated_probs = self._aggregate_class_probabilities(class_probs_list)
        
        return {
            'prediction': final_prediction,
            'confidence': float(average_confidence),
            'agreement_score': float(agreement_score),
            'class_probabilities': aggregated_probs
        }

    def _aggregate_class_probabilities(
        self,
        class_probs_list: List[Dict[str, float]]
    ) -> Dict[str, float]:
        """
        Average class probabilities across all models.
        
        Args:
            class_probs_list: List of class probability dicts from models
            
        Returns:
            Averaged class probabilities
        """
        if not class_probs_list:
            return {}
        
        aggregated = {}
        
        # Get union of all classes
        all_classes = set()
        for probs in class_probs_list:
            all_classes.update(probs.keys())
        
        # Average probabilities for each class
        for class_label in all_classes:
            probs = []
            for class_probs in class_probs_list:
                if class_label in class_probs:
                    probs.append(class_probs[class_label])
            
            if probs:
                aggregated[class_label] = float(np.mean(probs))
        
        return aggregated

    def majority_vote(self, predictions: List[str]) -> str:
        """
        Simple majority voting on predictions.
        
        Args:
            predictions: List of prediction labels
            
        Returns:
            Most common prediction
        """
        if not predictions:
            raise ValueError("Cannot vote on empty predictions")
        
        vote_counts = Counter(predictions)
        most_common, _ = vote_counts.most_common(1)[0]
        return most_common

    def average_confidence(self, confidences: List[float]) -> float:
        """
        Calculate average confidence.
        
        Args:
            confidences: List of confidence scores
            
        Returns:
            Mean confidence
        """
        if not confidences:
            return 0.0
        
        return float(np.mean(confidences))

    def agreement_score(self, predictions: List[str]) -> float:
        """
        Calculate model agreement score (0-1).
        
        1.0 = all models agree
        0.33 = all models differ (for 3 models)
        
        Args:
            predictions: List of prediction labels
            
        Returns:
            Agreement score between 0 and 1
        """
        if not predictions:
            return 0.0
        
        unique_predictions = len(set(predictions))
        max_unique = len(predictions)
        
        # Higher score when fewer unique predictions
        agreement = 1.0 - (unique_predictions - 1) / (max_unique - 1 if max_unique > 1 else 1)
        return float(agreement)
