"""
Feature importance explanation for classical ML models.
Uses SHAP for model-agnostic explanations.
"""

import logging
from typing import Dict, Any, Union
import numpy as np

logger = logging.getLogger(__name__)

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    logger.warning("SHAP not installed. Feature importance explanation disabled.")


class ClassicalFeatureImportance:
    """
    Explains classical ML model predictions using feature importance.
    
    Supports:
    - Model built-in feature importance (tree-based models)
    - SHAP values for model-agnostic explanations
    """

    def __init__(self):
        """Initialize feature importance explainer."""
        self.shap_available = SHAP_AVAILABLE

    def explain(
        self,
        model: Any,
        features: np.ndarray,
        feature_names: list = None
    ) -> Dict[str, Any]:
        """
        Explain model prediction using feature importance.
        
        Args:
            model: Trained sklearn model
            features: Feature vector (1D or 2D array)
            feature_names: Names of features (optional)
            
        Returns:
            Dictionary with explanation data:
            - feature_importance: dict of feature -> importance
            - top_features: list of most important features
            - method: explanation method used
        """
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        # Try model-specific feature importance first
        try:
            return self._get_model_feature_importance(model, features, feature_names)
        except Exception as e:
            logger.warning(f"Model feature importance failed: {e}")
        
        # Fall back to SHAP
        if self.shap_available:
            try:
                return self._get_shap_importance(model, features, feature_names)
            except Exception as e:
                logger.warning(f"SHAP explanation failed: {e}")
        
        # Return default
        return {
            'feature_importance': {},
            'top_features': [],
            'method': 'none',
            'error': 'Could not compute feature importance'
        }

    def _get_model_feature_importance(
        self,
        model: Any,
        features: np.ndarray,
        feature_names: list = None
    ) -> Dict[str, Any]:
        """
        Extract feature importance from model if available.
        
        Args:
            model: Trained model
            features: Feature array
            feature_names: Feature names
            
        Returns:
            Importance dictionary
        """
        # Check if model has feature_importances_ (tree-based models)
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            
            if feature_names is None:
                feature_names = [f"Feature {i}" for i in range(len(importances))]
            
            importance_dict = dict(zip(feature_names, importances))
            sorted_features = sorted(
                importance_dict.items(),
                key=lambda x: x[1],
                reverse=True
            )
            
            return {
                'feature_importance': importance_dict,
                'top_features': [f[0] for f in sorted_features[:5]],
                'method': 'tree_importance'
            }
        
        # Check for coefficients (linear models)
        elif hasattr(model, 'coef_'):
            importances = np.abs(model.coef_[0]) if model.coef_.ndim > 1 else np.abs(model.coef_)
            
            if feature_names is None:
                feature_names = [f"Feature {i}" for i in range(len(importances))]
            
            importance_dict = dict(zip(feature_names, importances))
            sorted_features = sorted(
                importance_dict.items(),
                key=lambda x: x[1],
                reverse=True
            )
            
            return {
                'feature_importance': importance_dict,
                'top_features': [f[0] for f in sorted_features[:5]],
                'method': 'coefficient_magnitude'
            }
        
        raise ValueError("Model does not have extractable feature importance")

    def _get_shap_importance(
        self,
        model: Any,
        features: np.ndarray,
        feature_names: list = None
    ) -> Dict[str, Any]:
        """
        Compute SHAP values for explanation.
        
        Args:
            model: Trained model
            features: Feature array
            feature_names: Feature names
            
        Returns:
            SHAP-based importance
        """
        if not SHAP_AVAILABLE:
            raise RuntimeError("SHAP not available")
        
        try:
            # Create explainer
            explainer = shap.Explainer(model)
            shap_values = explainer(features)
            
            # Get mean absolute SHAP values
            importances = np.abs(shap_values.values).mean(axis=0)
            
            if feature_names is None:
                feature_names = [f"Feature {i}" for i in range(len(importances))]
            
            importance_dict = dict(zip(feature_names, importances))
            sorted_features = sorted(
                importance_dict.items(),
                key=lambda x: x[1],
                reverse=True
            )
            
            return {
                'feature_importance': importance_dict,
                'top_features': [f[0] for f in sorted_features[:5]],
                'shap_values': shap_values.values.tolist(),
                'method': 'shap'
            }
        
        except Exception as e:
            raise Exception(f"SHAP computation failed: {e}")
