"""
Vision Transformer (ViT) inference model.
Uses HuggingFace Transformers library for image classification.
"""

import os
import logging
from PIL import Image
from typing import Dict, Any
import torch
from transformers import ViTImageProcessor, ViTForImageClassification

from .base_model import BaseMLModel

logger = logging.getLogger(__name__)


class ViTModel(BaseMLModel):
    """
    Vision Transformer model for medical image classification.
    
    Uses google/vit-base-patch16-224 as base model with fine-tuned weights.
    """

    def __init__(self):
        """Initialize ViT model."""
        super().__init__()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model_id = 'google/vit-base-patch16-224'
        self.weights_path = 'backend/weights/vit_best.pth'
        self.load_model()

    def load_model(self) -> None:
        """
        Load ViT model with fine-tuned or pretrained weights.
        """
        try:
            # Load processor and model from HuggingFace
            self.processor = ViTImageProcessor.from_pretrained(self.model_id)
            self.model = ViTForImageClassification.from_pretrained(
                self.model_id,
                num_labels=len(self.class_labels),
                ignore_mismatched_sizes=True
            )
            
            # Load fine-tuned weights if available
            if os.path.exists(self.weights_path):
                try:
                    state_dict = torch.load(
                        self.weights_path,
                        map_location=self.device
                    )
                    self.model.load_state_dict(state_dict)
                    logger.info(f"Loaded ViT weights from {self.weights_path}")
                except Exception as e:
                    logger.warning(
                        f"Failed to load ViT weights from {self.weights_path}: {e}. "
                        "Using pretrained HuggingFace weights instead."
                    )
            else:
                logger.warning(
                    f"ViT weights not found at {self.weights_path}. "
                    "Using pretrained HuggingFace weights."
                )
            
            self.model.to(self.device)
            self.model.eval()
            
        except Exception as e:
            logger.error(f"Failed to load ViT model: {e}")
            raise

    def preprocess(self, image: Image.Image) -> Dict[str, torch.Tensor]:
        """
        Preprocess image for ViT using HuggingFace processor.
        
        Args:
            image: PIL Image (RGB)
            
        Returns:
            Preprocessed tensor dict
        """
        image = image.convert('RGB')
        inputs = self.processor(
            image,
            return_tensors='pt'
        )
        return {
            k: v.to(self.device)
            for k, v in inputs.items()
        }

    def predict(self, image: Image.Image) -> Dict[str, Any]:
        """
        Run inference on an image using ViT.
        
        Args:
            image: PIL Image object
            
        Returns:
            Dictionary with prediction, confidence, and all class probabilities
        """
        try:
            inputs = self.preprocess(image)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
            
            # Get probabilities
            probabilities = torch.softmax(logits, dim=1)
            
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
            logger.error(f"ViT prediction failed: {e}")
            raise

    def get_attention_maps(self, image: Image.Image) -> torch.Tensor:
        """
        Extract attention maps from ViT for explainability.
        
        Args:
            image: PIL Image object
            
        Returns:
            Attention map tensor
        """
        inputs = self.preprocess(image)
        
        with torch.no_grad():
            outputs = self.model(**inputs, output_attentions=True)
        
        # Return attention from last layer
        attentions = outputs.attentions[-1]
        return attentions[0, 0]  # First batch, first head
