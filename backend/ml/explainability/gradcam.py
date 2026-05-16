"""
Grad-CAM (Gradient-weighted Class Activation Mapping) for model explainability.
Generates heatmaps showing regions important for predictions.
"""

import logging
import torch
import torch.nn.functional as F
from PIL import Image
from typing import Union, Dict, Any
import numpy as np
from abc import ABC

logger = logging.getLogger(__name__)


class GradCAM:
    """
    Grad-CAM implementation for CNN and Vision Transformer models.
    
    Generates Class Activation Maps by using gradients of model outputs
    with respect to feature maps.
    """

    def __init__(self):
        """Initialize Grad-CAM."""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.gradients = None
        self.activations = None

    def _register_hooks(self, model: torch.nn.Module, target_layer: str) -> torch.utils.hooks.RemovableHandle:
        """
        Register hooks to capture gradients and activations.
        
        Args:
            model: PyTorch model
            target_layer: Name of layer to hook
            
        Returns:
            Removable hook handle
        """
        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()

        # Find the layer
        for name, module in model.named_modules():
            if name == target_layer:
                module.register_forward_hook(forward_hook)
                return module.register_full_backward_hook(backward_hook)
        
        logger.warning(f"Layer {target_layer} not found in model")
        return None

    def generate_cnn(
        self,
        model: torch.nn.Module,
        image_tensor: torch.Tensor,
        target_class: Union[int, str]
    ) -> np.ndarray:
        """
        Generate Grad-CAM for CNN models (ResNet).
        
        Args:
            model: Trained CNN model
            image_tensor: Input image tensor (preprocessed)
            target_class: Target class index or label
            
        Returns:
            Grad-CAM heatmap as numpy array (0-1)
        """
        model.eval()
        
        # Register hooks on layer4
        handle = self._register_hooks(model, 'layer4')
        
        # Forward pass
        image_tensor.requires_grad_(True)
        output = model(image_tensor)
        
        # Get target class index
        if isinstance(target_class, str):
            class_idx = model.module.class_labels.index(target_class) if hasattr(model, 'class_labels') else output.argmax().item()
        else:
            class_idx = target_class
        
        # Backward pass
        model.zero_grad()
        target_score = output[0, class_idx]
        target_score.backward()
        
        # Compute Grad-CAM
        if self.gradients is None or self.activations is None:
            logger.warning("Could not capture gradients/activations")
            return np.ones((224, 224))
        
        pooled_gradients = torch.mean(self.gradients, dim=[0, 2, 3])
        activations = self.activations[0]
        
        for i in range(activations.shape[0]):
            activations[i, :, :] *= pooled_gradients[i]
        
        heatmap = torch.mean(activations, dim=0).cpu().numpy()
        heatmap = np.maximum(heatmap, 0)
        
        # Normalize
        if heatmap.max() > 0:
            heatmap /= heatmap.max()
        
        if handle is not None:
            handle.remove()
        
        return heatmap

    def generate_vit(
        self,
        model: torch.nn.Module,
        inputs: Dict[str, torch.Tensor],
        target_class: Union[int, str]
    ) -> np.ndarray:
        """
        Generate Grad-CAM for Vision Transformer models.
        
        Args:
            model: Trained ViT model
            inputs: Input dict from processor
            target_class: Target class label
            
        Returns:
            Grad-CAM heatmap as numpy array (0-1)
        """
        model.eval()
        
        # Forward pass with attention output
        with torch.enable_grad():
            outputs = model(**inputs, output_attentions=True)
            logits = outputs.logits
            
            # Get target class
            if isinstance(target_class, str):
                class_idx = 0  # Default to first class
            else:
                class_idx = target_class
            
            # Backward pass
            model.zero_grad()
            target_score = logits[0, class_idx]
            target_score.backward()
        
        # Use last layer attention as heatmap
        attentions = outputs.attentions[-1]
        attention_map = attentions[0, 0].mean(dim=0).cpu().detach().numpy()
        
        # Remove class token and reshape
        attention_map = attention_map[1:, 1:]  # Remove class token
        
        # Get spatial dimensions
        num_patches = attention_map.shape[0]
        patch_size = int(np.sqrt(num_patches))
        
        heatmap = attention_map.reshape(patch_size, patch_size)
        
        # Normalize
        if heatmap.max() > 0:
            heatmap /= heatmap.max()
        
        return heatmap

    def generate(
        self,
        model: torch.nn.Module,
        image: Union[Image.Image, torch.Tensor],
        target_class: str
    ) -> np.ndarray:
        """
        Generate Grad-CAM heatmap (unified interface).
        
        Args:
            model: Trained model (CNN or ViT)
            image: Input image
            target_class: Target class label
            
        Returns:
            Grad-CAM heatmap (0-1)
        """
        try:
            # Determine model type and call appropriate method
            model_type = model.__class__.__name__
            
            if 'CNN' in model_type:
                # Preprocess for CNN
                image_tensor = model.preprocess(image)
                return self.generate_cnn(model.model, image_tensor, target_class)
            
            elif 'ViT' in model_type:
                # Preprocess for ViT
                inputs = model.preprocess(image)
                return self.generate_vit(model.model, inputs, target_class)
            
            else:
                logger.warning(f"Grad-CAM not implemented for {model_type}")
                return np.ones((224, 224))
                
        except Exception as e:
            logger.error(f"Grad-CAM generation failed: {e}")
            return np.ones((224, 224))

    def overlay_heatmap(
        self,
        original_image: Image.Image,
        heatmap: np.ndarray,
        alpha: float = 0.4
    ) -> Image.Image:
        """
        Overlay Grad-CAM heatmap on original image.
        
        Args:
            original_image: Original PIL Image
            heatmap: Grad-CAM heatmap (0-1)
            alpha: Blending alpha
            
        Returns:
            Blended PIL Image with heatmap overlay
        """
        try:
            # Normalize heatmap
            heatmap = np.uint8(255 * heatmap)
            
            # Convert to PIL and resize to match image
            heatmap_img = Image.fromarray(heatmap, mode='L')
            heatmap_img = heatmap_img.resize(original_image.size, Image.BILINEAR)
            
            # Apply colormap
            heatmap_array = np.array(heatmap_img)
            colored = self._apply_jet_colormap(heatmap_array)
            
            # Create RGBA overlay
            overlay = Image.new('RGBA', original_image.size)
            overlay.paste(Image.fromarray(colored), (0, 0))
            
            # Blend
            original_rgba = original_image.convert('RGBA')
            blended = Image.blend(original_rgba, overlay, alpha)
            
            return blended
            
        except Exception as e:
            logger.error(f"Heatmap overlay failed: {e}")
            return original_image

    @staticmethod
    def _apply_jet_colormap(gray_array: np.ndarray) -> np.ndarray:
        """
        Apply jet colormap to grayscale array.
        
        Args:
            gray_array: Grayscale numpy array
            
        Returns:
            RGB numpy array
        """
        normalized = gray_array.astype(np.float32) / 255.0
        colored = np.zeros((*gray_array.shape, 3), dtype=np.uint8)
        
        colored[:, :, 0] = np.uint8(255 * np.clip(2 * (1 - normalized), 0, 1))
        green = np.where(normalized < 0.5, 2 * normalized, 2 * (1 - normalized))
        colored[:, :, 1] = np.uint8(255 * np.clip(green, 0, 1))
        colored[:, :, 2] = np.uint8(255 * np.clip(2 * normalized, 0, 1))
        
        return colored
