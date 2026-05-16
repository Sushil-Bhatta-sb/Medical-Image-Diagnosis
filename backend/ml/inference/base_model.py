"""
Abstract base class for ML models.
Defines the interface and common functionality for all model types.
"""

from abc import ABC, abstractmethod
from PIL import Image
import numpy as np
from typing import Dict, Any


class BaseMLModel(ABC):
    """
    Abstract base class for all machine learning models.
    
    Defines the interface for:
    - Loading model weights
    - Preprocessing images
    - Making predictions
    - Returning standardized prediction format
    """

    def __init__(self):
        """Initialize the model."""
        self.model = None
        self.device = None
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

    @abstractmethod
    def load_model(self) -> None:
        """
        Load model weights from disk or download from pretrained.
        
        Must be implemented by subclasses.
        """
        pass

    @abstractmethod
    def preprocess(self, image: Image.Image) -> Any:
        """
        Preprocess image for model inference.
        
        Args:
            image: PIL Image object
            
        Returns:
            Preprocessed image suitable for model input
        """
        pass

    @abstractmethod
    def predict(self, image: Image.Image) -> Dict[str, Any]:
        """
        Run inference on an image.
        
        Args:
            image: PIL Image object (RGB)
            
        Returns:
            Dictionary with keys:
            - prediction: str (class label)
            - confidence: float (0-1)
            - class_probabilities: dict (all classes and scores)
        """
        pass
