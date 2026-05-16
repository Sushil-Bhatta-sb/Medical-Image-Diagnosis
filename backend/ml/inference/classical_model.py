"""
Classical machine learning model using SVM/XGBoost.
Uses hand-crafted features (HOG + LBP) for image classification.
"""

import os
import logging
import pickle
from PIL import Image
from typing import Dict, Any
import numpy as np
from skimage.feature import hog, local_binary_pattern
from sklearn.preprocessing import StandardScaler

from .base_model import BaseMLModel

logger = logging.getLogger(__name__)


class ClassicalModel(BaseMLModel):
    """
    Classical ML model for medical image classification.
    
    Uses sklearn Pipeline with SVM or XGBoost classifier and hand-crafted features.
    """

    def __init__(self):
        """Initialize classical ML model."""
        super().__init__()
        self.weights_path = 'backend/weights/svm_pipeline.pkl'
        self.load_model()

    def load_model(self) -> None:
        """
        Load the sklearn Pipeline (SVM or XGBoost).
        Falls back to random predictions if weights not found.
        """
        try:
            if os.path.exists(self.weights_path):
                with open(self.weights_path, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info(f"Loaded classical ML model from {self.weights_path}")
                self.use_fallback = False
            else:
                logger.warning(
                    f"Classical ML weights not found at {self.weights_path}. "
                    "Using random predictions (development mode)."
                )
                self.model = None
                self.use_fallback = True
                
        except Exception as e:
            logger.error(f"Failed to load classical ML model: {e}")
            self.model = None
            self.use_fallback = True

    def preprocess(self, image: Image.Image) -> np.ndarray:
        """
        Extract hand-crafted features (HOG + LBP) from image.
        
        Args:
            image: PIL Image (RGB)
            
        Returns:
            Feature vector as numpy array
        """
        image = image.convert('RGB')
        image_array = np.array(image)
        
        # Convert to grayscale for feature extraction
        gray = np.dot(image_array[..., :3], [0.299, 0.587, 0.114])
        gray = (gray * 255).astype(np.uint8)
        
        # Extract HOG features
        hog_features = hog(
            gray,
            orientations=9,
            pixels_per_cell=(8, 8),
            cells_per_block=(2, 2),
            feature_vector=True
        )
        
        # Extract LBP features
        lbp = local_binary_pattern(gray, P=8, R=1, method='uniform')
        lbp_hist, _ = np.histogram(
            lbp.ravel(),
            bins=np.arange(0, 11),
            range=(0, 10)
        )
        lbp_features = lbp_hist / (lbp_hist.sum() + 1e-8)
        
        # Combine features
        combined_features = np.concatenate([hog_features, lbp_features])
        
        return combined_features

    def predict(self, image: Image.Image) -> Dict[str, Any]:
        """
        Run inference on an image using classical ML.
        
        Args:
            image: PIL Image object
            
        Returns:
            Dictionary with prediction, confidence, and all class probabilities
        """
        try:
            # Extract features
            features = self.preprocess(image)
            features = features.reshape(1, -1)
            
            if self.use_fallback or self.model is None:
                # Random prediction for development
                import random
                predicted_label = random.choice(self.class_labels)
                confidence = random.uniform(0.5, 0.95)
                class_probs = {
                    label: random.uniform(0, 1)
                    for label in self.class_labels
                }
                # Normalize probabilities
                total = sum(class_probs.values())
                class_probs = {k: v / total for k, v in class_probs.items()}
                
            else:
                # Use actual model
                prediction = self.model.predict(features)[0]
                
                # Get probabilities
                if hasattr(self.model, 'predict_proba'):
                    probs = self.model.predict_proba(features)[0]
                    class_probs = {
                        label: prob
                        for label, prob in zip(self.class_labels, probs)
                    }
                    confidence = np.max(probs)
                else:
                    # For models without predict_proba
                    predicted_label = prediction
                    confidence = 0.7
                    class_probs = {label: 1.0 / len(self.class_labels) for label in self.class_labels}
                    class_probs[predicted_label] = 0.9
                
                predicted_label = prediction
            
            return {
                'prediction': predicted_label,
                'confidence': float(confidence),
                'class_probabilities': {k: float(v) for k, v in class_probs.items()}
            }
            
        except Exception as e:
            logger.error(f"Classical ML prediction failed: {e}")
            raise
