"""
CNN Inference Module for Chest X-Ray Classification
Uses ResNet-50 for binary classification: NORMAL vs PNEUMONIA
"""

import os
import logging

import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════
WEIGHTS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    'weights'
)
MODEL_PATH = os.path.join(WEIGHTS_PATH, 'resnet50_best.pth')
IMAGE_SIZE = 224
NUM_CLASSES = 2

CLASS_LABELS = ['NORMAL', 'PNEUMONIA']
# ═══════════════════════════════════════════════════════════════════════════════


class CNNModel:
    """ResNet-50 based CNN model for chest X-ray classification."""
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.transform = None
        self._load_model()
        self._setup_transforms()
    
    def _create_model_architecture(self):
        """Create ResNet-50 with custom classifier."""
        model = models.resnet50(weights=None)
        num_features = model.fc.in_features  # 2048
        model.fc = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, NUM_CLASSES)
        )
        return model
    
    def _load_model(self):
        """Load trained model weights or use pretrained."""
        self.model = self._create_model_architecture()
        
        if os.path.exists(MODEL_PATH):
            try:
                checkpoint = torch.load(MODEL_PATH, map_location=self.device, weights_only=False)
                self.model.load_state_dict(checkpoint['model_state_dict'])
                logger.info(f"Loaded trained CNN model from {MODEL_PATH}")
            except Exception as e:
                logger.warning(f"Could not load trained weights: {e}")
                logger.info("Using random initialization (for development)")
        else:
            logger.warning(f"Model weights not found at {MODEL_PATH}")
            logger.info("Using pretrained ResNet-50 (run training to get better weights)")
            # Load pretrained ImageNet weights at least
            pretrained = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
            # Copy weights except final layer
            state_dict = pretrained.state_dict()
            # Remove fc layer weights
            state_dict = {k: v for k, v in state_dict.items() if not k.startswith('fc')}
            self.model.load_state_dict(state_dict, strict=False)
        
        self.model = self.model.to(self.device)
        self.model.eval()
    
    def _setup_transforms(self):
        """Setup image preprocessing transforms."""
        self.transform = transforms.Compose([
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def predict(self, image):
        """
        Run prediction on an image.
        
        Args:
            image: PIL Image or path to image file
            
        Returns:
            dict with prediction, confidence, and class_probabilities
        """
        # Load image if path
        if isinstance(image, str):
            image = Image.open(image).convert('RGB')
        elif not isinstance(image, Image.Image):
            # Assume numpy array or similar
            image = Image.fromarray(np.uint8(image)).convert('RGB')
        else:
            image = image.convert('RGB')
        
        # Preprocess
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Inference
        with torch.no_grad():
            outputs = self.model(img_tensor)
            probabilities = torch.softmax(outputs, dim=1).cpu().numpy()[0]
        
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
    """Get or create CNN model instance."""
    global _model_instance
    if _model_instance is None:
        _model_instance = CNNModel()
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
