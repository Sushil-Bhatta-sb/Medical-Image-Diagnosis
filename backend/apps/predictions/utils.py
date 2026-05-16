"""
Utility functions for the predictions app.
"""

import os
import io
import logging
import requests
from PIL import Image
import numpy as np
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

logger = logging.getLogger(__name__)


def download_image_from_url(url: str) -> Image.Image:
    """
    Download an image from a URL and return as PIL Image.
    
    Args:
        url: The URL of the image to download
        
    Returns:
        PIL Image object
        
    Raises:
        Exception: If the download fails or image is invalid
    """
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content)).convert('RGB')
        return image
    except Exception as e:
        logger.error(f'Failed to download image from {url}: {str(e)}')
        raise


def save_gradcam_overlay(original_image: Image.Image, heatmap: np.ndarray, filename: str) -> str:
    """
    Create a Grad-CAM overlay and save to Django media storage.
    
    Args:
        original_image: Original PIL Image
        heatmap: Grad-CAM heatmap as numpy array (0-1 range)
        filename: Filename to save as (without extension)
        
    Returns:
        URL of the saved overlay image
    """
    try:
        # Normalize heatmap to 0-255
        heatmap = np.uint8(255 * heatmap)
        
        # Convert to PIL Image
        heatmap_img = Image.fromarray(heatmap, mode='L')
        
        # Resize heatmap to match original image size
        heatmap_img = heatmap_img.resize(original_image.size, Image.BILINEAR)
        
        # Apply jet colormap
        heatmap_array = np.array(heatmap_img)
        colored_heatmap = _apply_colormap(heatmap_array)
        
        # Create overlay
        overlay = Image.new('RGBA', original_image.size)
        overlay.paste(Image.fromarray(colored_heatmap), (0, 0))
        
        # Blend with original
        original_rgba = original_image.convert('RGBA')
        blended = Image.blend(original_rgba, overlay, alpha=0.4)
        
        # Save to storage
        buffer = io.BytesIO()
        blended.save(buffer, format='PNG')
        buffer.seek(0)
        
        filepath = f'gradcam/{filename}.png'
        path = default_storage.save(filepath, ContentFile(buffer.getvalue()))
        
        # Return URL
        return default_storage.url(path)
        
    except Exception as e:
        logger.error(f'Failed to save Grad-CAM overlay: {str(e)}')
        raise


def _apply_colormap(gray_array: np.ndarray) -> np.ndarray:
    """
    Apply a jet-like colormap to a grayscale heatmap.
    
    Args:
        gray_array: Grayscale numpy array (0-255)
        
    Returns:
        RGB numpy array with colormap applied
    """
    # Normalize to 0-1
    normalized = gray_array.astype(np.float32) / 255.0
    
    # Jet colormap approximation
    colored = np.zeros((*gray_array.shape, 3), dtype=np.uint8)
    
    # Red channel
    colored[:, :, 0] = np.uint8(255 * np.clip(2 * (1 - normalized), 0, 1))
    
    # Green channel
    green = np.where(normalized < 0.5, 2 * normalized, 2 * (1 - normalized))
    colored[:, :, 1] = np.uint8(255 * np.clip(green, 0, 1))
    
    # Blue channel
    colored[:, :, 2] = np.uint8(255 * np.clip(2 * normalized, 0, 1))
    
    return colored
