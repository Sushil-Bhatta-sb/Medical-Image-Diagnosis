"""
Classical ML Inference Module for Chest X-Ray Classification
Uses HOG features with SVM/Random Forest for binary classification: NORMAL vs PNEUMONIA
"""

import os
import logging
import pickle
import random

import numpy as np
from PIL import Image
from skimage.feature import hog

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════
WEIGHTS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    'weights'
)
MODEL_PATH = os.path.join(WEIGHTS_PATH, 'classical_model.pkl')
IMAGE_SIZE = 128
NUM_CLASSES = 2

# HOG Parameters (must match training)
HOG_ORIENTATIONS = 9
HOG_PIXELS_PER_CELL = (8, 8)
HOG_CELLS_PER_BLOCK = (2, 2)

CLASS_LABELS = ['NORMAL', 'PNEUMONIA']
# ═══════════════════════════════════════════════════════════════════════════════


class ClassicalModel:
    """Classical ML model (SVM/RF) for chest X-ray classification."""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_name = None
        self._load_model()
    
    def _load_model(self):
        """Load trained model and scaler."""
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, 'rb') as f:
                    model_data = pickle.load(f)
                
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                self.model_name = model_data.get('model_name', 'Unknown')
                
                logger.info(f"Loaded {self.model_name} model from {MODEL_PATH}")
            except Exception as e:
                logger.warning(f"Could not load model: {e}")
                self.model = None
                self.scaler = None
        else:
            logger.warning(f"Model not found at {MODEL_PATH}")
            logger.info("Classical model will return random predictions until trained")
            self.model = None
            self.scaler = None
    
    def _extract_hog_features(self, image):
        """
        Extract HOG features from an image.
        
        Args:
            image: PIL Image (grayscale or RGB)
            
        Returns:
            HOG feature vector
        """
        # Convert to grayscale and resize
        if image.mode != 'L':
            image = image.convert('L')
        image = image.resize((IMAGE_SIZE, IMAGE_SIZE))
        img_array = np.array(image)
        
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
    
    def _random_prediction(self):
        """Generate random prediction when model is not available."""
        predicted_idx = random.randint(0, NUM_CLASSES - 1)
        predicted_class = CLASS_LABELS[predicted_idx]
        
        # Generate random probabilities
        prob = random.uniform(0.5, 0.9)
        probabilities = [0.0] * NUM_CLASSES
        probabilities[predicted_idx] = prob
        probabilities[1 - predicted_idx] = 1.0 - prob
        
        class_probabilities = {
            CLASS_LABELS[i]: round(probabilities[i], 4)
            for i in range(NUM_CLASSES)
        }
        
        return {
            'prediction': predicted_class,
            'confidence': round(prob, 4),
            'class_probabilities': class_probabilities
        }
    
    def predict(self, image):
        """
        Run prediction on an image.
        
        Args:
            image: PIL Image or path to image file
            
        Returns:
            dict with prediction, confidence, and class_probabilities
        """
        # Fallback to random if model not loaded
        if self.model is None or self.scaler is None:
            logger.warning("Model not loaded, returning random prediction")
            return self._random_prediction()
        
        # Load image if path
        if isinstance(image, str):
            image = Image.open(image)
        elif not isinstance(image, Image.Image):
            # Assume numpy array or similar
            image = Image.fromarray(np.uint8(image))
        
        try:
            # Extract features
            features = self._extract_hog_features(image)
            
            # Scale features
            features_scaled = self.scaler.transform([features])
            
            # Predict
            prediction = self.model.predict(features_scaled)[0]
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            # Get prediction
            predicted_class = CLASS_LABELS[prediction]
            confidence = float(probabilities[prediction])
            
            # Build class probabilities dict
            class_probabilities = {
                CLASS_LABELS[i]: round(float(probabilities[i]), 4)
                for i in range(NUM_CLASSES)
            }
            
            return {
                'prediction': predicted_class,
                'confidence': round(confidence, 4),
                'class_probabilities': class_probabilities
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return self._random_prediction()


# Singleton instance
_model_instance = None


def get_model():
    """Get or create Classical model instance."""
    global _model_instance
    if _model_instance is None:
        _model_instance = ClassicalModel()
    return _model_instance


def predict(image):
    """
    Convenience function to run prediction.
    
    Args:
        image: PIL Image, path, or numpy array
        
    Returns:
        dict with prediction results
    """
    model = get_model()
    return model.predict(image)
