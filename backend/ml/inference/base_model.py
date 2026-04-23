"""
Base model class for all ML models
"""
from abc import ABC, abstractmethod

class BaseModel(ABC):
    """Abstract base class for ML models"""

    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None

    @abstractmethod
    def load(self):
        """Load model weights"""
        pass

    @abstractmethod
    def predict(self, image):
        """Run inference"""
        pass

    @abstractmethod
    def get_explanation(self, image):
        """Get model explanation (e.g., Grad-CAM)"""
        pass
