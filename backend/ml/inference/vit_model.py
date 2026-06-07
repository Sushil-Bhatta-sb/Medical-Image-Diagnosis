"""
ViT Inference Module for Chest X-Ray Classification
Uses HuggingFace's Vision Transformer for binary classification: NORMAL vs PNEUMONIA
"""

import os
import logging

import numpy as np
import torch
from PIL import Image

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════
WEIGHTS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    'weights'
)
MODEL_PATH = os.path.join(WEIGHTS_PATH, 'vit_best.pth')
MODEL_NAME = "google/vit-base-patch16-224"
NUM_CLASSES = 2

CLASS_LABELS = ['NORMAL', 'PNEUMONIA']
ID2LABEL = {0: 'NORMAL', 1: 'PNEUMONIA'}
LABEL2ID = {'NORMAL': 0, 'PNEUMONIA': 1}
# ═══════════════════════════════════════════════════════════════════════════════


class ViTModel:
    """Vision Transformer model for chest X-ray classification."""
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.processor = None
        self._load_model()
    
    def _load_model(self):
        """Load ViT model and processor."""
        try:
            from transformers import ViTForImageClassification, ViTImageProcessor
            
            # Load processor
            self.processor = ViTImageProcessor.from_pretrained(MODEL_NAME)
            
            # Check if trained weights exist
            if os.path.exists(MODEL_PATH):
                try:
                    checkpoint = torch.load(MODEL_PATH, map_location=self.device, weights_only=False)
                    model_name = checkpoint.get('model_name', MODEL_NAME)
                    
                    # Load model with same architecture
                    self.model = ViTForImageClassification.from_pretrained(
                        model_name,
                        num_labels=NUM_CLASSES,
                        id2label=ID2LABEL,
                        label2id=LABEL2ID,
                        ignore_mismatched_sizes=True
                    )
                    self.model.load_state_dict(checkpoint['model_state_dict'])
                    logger.info(f"Loaded trained ViT model from {MODEL_PATH}")
                except Exception as e:
                    logger.warning(f"Could not load trained weights: {e}")
                    self._load_pretrained()
            else:
                logger.warning(f"Model weights not found at {MODEL_PATH}")
                self._load_pretrained()
            
            self.model = self.model.to(self.device)
            self.model.eval()
            
        except ImportError:
            logger.error("transformers library not installed. Run: pip install transformers")
            self.model = None
            self.processor = None
    
    def _load_pretrained(self):
        """Load pretrained ViT model (without fine-tuning)."""
        from transformers import ViTForImageClassification
        
        logger.info("Loading pretrained ViT model (run training to get better weights)")
        self.model = ViTForImageClassification.from_pretrained(
            MODEL_NAME,
            num_labels=NUM_CLASSES,
            id2label=ID2LABEL,
            label2id=LABEL2ID,
            ignore_mismatched_sizes=True
        )
    
    def predict(self, image):
        """
        Run prediction on an image.
        
        Args:
            image: PIL Image or path to image file
            
        Returns:
            dict with prediction, confidence, and class_probabilities
        """
        if self.model is None or self.processor is None:
            logger.error("ViT model not loaded")
            return {
                'prediction': 'UNKNOWN',
                'confidence': 0.0,
                'class_probabilities': {label: 0.0 for label in CLASS_LABELS}
            }
        
        # Load image if path
        if isinstance(image, str):
            image = Image.open(image).convert('RGB')
        elif not isinstance(image, Image.Image):
            # Assume numpy array or similar
            image = Image.fromarray(np.uint8(image)).convert('RGB')
        else:
            image = image.convert('RGB')
        
        # Preprocess
        inputs = self.processor(images=image, return_tensors="pt")
        pixel_values = inputs['pixel_values'].to(self.device)
        
        # Inference
        with torch.no_grad():
            outputs = self.model(pixel_values=pixel_values)
            probabilities = torch.softmax(outputs.logits, dim=1).cpu().numpy()[0]
        
        # Get prediction
        predicted_idx = int(np.argmax(probabilities))
        predicted_class = CLASS_LABELS[predicted_idx]
        confidence = float(probabilities[predicted_idx])
        
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


# Singleton instance
_model_instance = None


def get_model():
    """Get or create ViT model instance."""
    global _model_instance
    if _model_instance is None:
        _model_instance = ViTModel()
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
