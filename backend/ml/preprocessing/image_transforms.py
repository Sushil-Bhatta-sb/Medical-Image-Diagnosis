"""
Image preprocessing transforms for CNN, ViT, and classical ML models.
Handles image resizing, normalization, and augmentation.
"""

from torchvision import transforms
import numpy as np
from PIL import Image


def get_cnn_transforms() -> transforms.Compose:
    """
    Get preprocessing transforms for CNN (ResNet-50).
    
    Returns:
        Composed transforms for CNN inference
    """
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])


def get_vit_transforms() -> dict:
    """
    Get preprocessing configuration for ViT.
    
    Note: Actual preprocessing is done by ViTImageProcessor from HuggingFace.
    This returns ImageNet normalization stats for reference.
    
    Returns:
        Dict with normalization parameters
    """
    return {
        'size': 224,
        'mean': [0.5, 0.5, 0.5],
        'std': [0.5, 0.5, 0.5],
        'resample': Image.BILINEAR
    }


def get_classical_transforms() -> transforms.Compose:
    """
    Get preprocessing transforms for classical ML models.
    
    Resizes image for feature extraction (HOG, LBP).
    
    Returns:
        Composed transforms
    """
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])


def augmentation_transforms() -> transforms.Compose:
    """
    Get data augmentation transforms for training.
    
    Used during model training to increase dataset variety.
    
    Returns:
        Composed augmentation transforms
    """
    return transforms.Compose([
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.3),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
        transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 1.0)),
        transforms.RandomResizedCrop((224, 224), scale=(0.8, 1.0)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
