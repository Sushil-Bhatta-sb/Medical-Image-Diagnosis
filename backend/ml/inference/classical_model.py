"""
Classical ML models (SVM, XGBoost) wrapper
"""
from .base_model import BaseModel

class ClassicalModel(BaseModel):
    """SVM/XGBoost inference wrapper"""

    def load(self):
        """Load classical ML model"""
        # Implementation
        pass

    def predict(self, image):
        """Run inference on image"""
        # Implementation
        pass

    def get_explanation(self, image):
        """Get SHAP explanation"""
        # Implementation
        pass
