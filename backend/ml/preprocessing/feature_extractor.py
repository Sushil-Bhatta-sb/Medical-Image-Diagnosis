"""
Feature extraction for classical ML models.
Extracts HOG (Histogram of Oriented Gradients) and LBP (Local Binary Pattern) features.
"""

from PIL import Image
import numpy as np
from skimage.feature import hog, local_binary_pattern


def extract_hog_features(image: Image.Image) -> np.ndarray:
    """
    Extract Histogram of Oriented Gradients (HOG) features.
    
    HOG captures edge and gradient information useful for object detection.
    
    Args:
        image: PIL Image (RGB)
        
    Returns:
        HOG feature vector
    """
    # Convert to grayscale
    image = image.convert('RGB')
    image_array = np.array(image)
    gray = np.dot(image_array[..., :3], [0.299, 0.587, 0.114])
    gray = (gray * 255).astype(np.uint8)
    
    # Extract HOG features
    hog_features = hog(
        gray,
        orientations=9,
        pixels_per_cell=(8, 8),
        cells_per_block=(2, 2),
        feature_vector=True
    )
    
    return hog_features


def extract_lbp_features(image: Image.Image) -> np.ndarray:
    """
    Extract Local Binary Pattern (LBP) features.
    
    LBP captures texture information at different scales.
    
    Args:
        image: PIL Image (RGB)
        
    Returns:
        LBP histogram feature vector
    """
    # Convert to grayscale
    image = image.convert('RGB')
    image_array = np.array(image)
    gray = np.dot(image_array[..., :3], [0.299, 0.587, 0.114])
    gray = (gray * 255).astype(np.uint8)
    
    # Extract LBP
    lbp = local_binary_pattern(gray, P=8, R=1, method='uniform')
    
    # Compute histogram (10 bins for uniform LBP)
    lbp_hist, _ = np.histogram(
        lbp.ravel(),
        bins=np.arange(0, 11),
        range=(0, 10)
    )
    
    # Normalize histogram
    lbp_features = lbp_hist / (lbp_hist.sum() + 1e-8)
    
    return lbp_features.astype(np.float32)


def extract_combined_features(image: Image.Image) -> np.ndarray:
    """
    Extract combined HOG + LBP features.
    
    Combines edge information (HOG) with texture information (LBP)
    for more comprehensive feature representation.
    
    Args:
        image: PIL Image (RGB)
        
    Returns:
        Combined feature vector (HOG + LBP concatenated)
    """
    hog_features = extract_hog_features(image)
    lbp_features = extract_lbp_features(image)
    
    combined_features = np.concatenate([hog_features, lbp_features])
    
    return combined_features.astype(np.float32)
