"""
CNN-based inference model using ResNet-50.
Uses PyTorch and torchvision for image classification.
"""

import os
import logging
from pathlib import Path
from PIL import Image
from typing import Dict, Any, Tuple
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms

from .base_model import BaseMLModel

logger = logging.getLogger(__name__)


class CNNModel(BaseMLModel):
    """
    ResNet-50 based CNN for medical image classification.
    
    Loads fine-tuned weights or uses pretrained ImageNet weights.
    """

    def __init__(self):
        """Initialize CNN model."""
        super().__init__()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.weights_path = 'backend/weights/resnet50_best.pth'
        self.load_model()
        self.setup_transforms()

    def load_model(self) -> None:
        """
        Load ResNet-50 model with pretrained or fine-tuned weights.
        """
        try:
            # Load base ResNet-50
            self.model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
            
            # Replace final layer for 9 classes
            num_features = self.model.fc.in_features
            self.model.fc = nn.Linear(num_features, len(self.class_labels))
            
            # Load fine-tuned weights if available
            if os.path.exists(self.weights_path):
                try:
                    state_dict = torch.load(
                        self.weights_path,
                        map_location=self.device
                    )
                    self.model.load_state_dict(state_dict)
                    logger.info(f"Loaded CNN weights from {self.weights_path}")
                except Exception as e:
                    logger.warning(
                        f"Failed to load CNN weights from {self.weights_path}: {e}. "
                        "Using pretrained ImageNet weights instead."
                    )
            else:
                logger.warning(
                    f"CNN weights not found at {self.weights_path}. "
                    "Using pretrained ImageNet weights."
                )
            
            self.model.to(self.device)
            self.model.eval()
            
        except Exception as e:
            logger.error(f"Failed to load CNN model: {e}")
            raise

    def setup_transforms(self) -> None:
        """Setup image preprocessing transforms."""
        self.transforms = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def preprocess(self, image: Image.Image) -> torch.Tensor:
        """
        Preprocess image for ResNet-50.
        
        Args:
            image: PIL Image (RGB)
            
        Returns:
            Preprocessed tensor
        """
        image = image.convert('RGB')
        image_tensor = self.transforms(image)
        return image_tensor.unsqueeze(0).to(self.device)

    def predict(self, image: Image.Image) -> Dict[str, Any]:
        """
        Run inference on an image.
        
        Args:
            image: PIL Image object
            
        Returns:
            Dictionary with prediction, confidence, and all class probabilities
        """
        try:
            image_tensor = self.preprocess(image)
            
            with torch.no_grad():
                logits = self.model(image_tensor)
                probabilities = F.softmax(logits, dim=1)
            
            # Get top prediction
            confidence, predicted_idx = torch.max(probabilities[0], dim=0)
            predicted_label = self.class_labels[predicted_idx.item()]
            confidence_value = confidence.item()
            
            # Get all class probabilities
            class_probs = {
                label: prob.item()
                for label, prob in zip(self.class_labels, probabilities[0])
            }
            
            return {
                'prediction': predicted_label,
                'confidence': confidence_value,
                'class_probabilities': class_probs
            }
            
        except Exception as e:
            logger.error(f"CNN prediction failed: {e}")
            raise

    def get_feature_maps(self, image: Image.Image) -> Dict[str, torch.Tensor]:
        """
        Extract intermediate feature maps for Grad-CAM.
        
        Args:
            image: PIL Image object
            
        Returns:
            Dictionary of layer name -> feature maps
        """
        image_tensor = self.preprocess(image)
        features = {}
        
        def hook_fn(module, input, output):
            features['layer4'] = output.detach()
        
        hook = self.model.layer4.register_forward_hook(hook_fn)
        
        with torch.no_grad():
            _ = self.model(image_tensor)
        
        hook.remove()
        return features
