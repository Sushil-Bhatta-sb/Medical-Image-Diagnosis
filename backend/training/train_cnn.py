"""
Training script for CNN (ResNet-50) model.
Trains on medical image dataset with monitoring and checkpointing.
"""

import os
import logging
import yaml
import json
from pathlib import Path
from argparse import ArgumentParser
import numpy as np
from datetime import datetime

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms
from torchvision.datasets import ImageFolder
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class ImageDataset(Dataset):
    """Custom dataset for medical images."""
    
    def __init__(self, image_dir: str, transform=None):
        """
        Initialize dataset.
        
        Args:
            image_dir: Path to image directory
            transform: Image transforms
        """
        self.image_folder = ImageFolder(image_dir, transform=transform)
        self.transform = transform
    
    def __len__(self):
        return len(self.image_folder)
    
    def __getitem__(self, idx):
        return self.image_folder[idx]


def get_transforms():
    """Get training and validation transforms."""
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(p=0.3),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    return train_transform, val_transform


def train_epoch(model, dataloader, criterion, optimizer, device):
    """
    Train for one epoch.
    
    Args:
        model: PyTorch model
        dataloader: Training dataloader
        criterion: Loss function
        optimizer: Optimizer
        device: Device to train on
        
    Returns:
        Average loss and accuracy
    """
    model.train()
    total_loss = 0
    correct = 0
    total = 0
    
    for images, labels in dataloader:
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        correct += (predicted == labels).sum().item()
        total += labels.size(0)
    
    avg_loss = total_loss / len(dataloader)
    accuracy = 100 * correct / total
    
    return avg_loss, accuracy


def validate_epoch(model, dataloader, criterion, device):
    """
    Validate for one epoch.
    
    Args:
        model: PyTorch model
        dataloader: Validation dataloader
        criterion: Loss function
        device: Device to validate on
        
    Returns:
        Validation loss and accuracy
    """
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in dataloader:
            images, labels = images.to(device), labels.to(device)
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            total_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            correct += (predicted == labels).sum().item()
            total += labels.size(0)
    
    avg_loss = total_loss / len(dataloader)
    accuracy = 100 * correct / total
    
    return avg_loss, accuracy


def train_model(config: dict) -> dict:
    """
    Main training loop for CNN.
    
    Args:
        config: Configuration dictionary
        
    Returns:
        Dictionary with training results
    """
    # Setup device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f"Using device: {device}")
    
    # Load config
    learning_rate = config.get('learning_rate', 0.001)
    batch_size = config.get('batch_size', 32)
    epochs = config.get('epochs', 50)
    image_size = config.get('image_size', 224)
    dataset_path = config.get('dataset_path', 'data/chest_xray')
    weights_path = config.get('weights_path', 'backend/weights/resnet50_best.pth')
    
    # Create weights directory
    os.makedirs(os.path.dirname(weights_path), exist_ok=True)
    
    # Load data
    train_transform, val_transform = get_transforms()
    
    train_dataset = ImageDataset(os.path.join(dataset_path, 'train'), train_transform)
    val_dataset = ImageDataset(os.path.join(dataset_path, 'val'), val_transform)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    num_classes = len(train_dataset.image_folder.classes)
    logger.info(f"Number of classes: {num_classes}")
    
    # Setup model
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, num_classes)
    model.to(device)
    
    # Setup training
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=3, verbose=True
    )
    
    best_val_loss = float('inf')
    patience = 5
    patience_counter = 0
    metrics_history = []
    
    logger.info("Starting training...")
    
    for epoch in range(epochs):
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate_epoch(model, val_loader, criterion, device)
        
        scheduler.step(val_loss)
        
        metrics_history.append({
            'epoch': epoch + 1,
            'train_loss': train_loss,
            'val_loss': val_loss,
            'train_accuracy': train_acc,
            'val_accuracy': val_acc
        })
        
        logger.info(
            f"Epoch {epoch+1}/{epochs} | "
            f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}% | "
            f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%"
        )
        
        # Checkpoint best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            torch.save(model.state_dict(), weights_path)
            logger.info(f"Model saved to {weights_path}")
        else:
            patience_counter += 1
            if patience_counter >= patience:
                logger.info(f"Early stopping at epoch {epoch+1}")
                break
    
    logger.info("Training completed!")
    
    return {
        'weights_path': weights_path,
        'metrics_history': metrics_history,
        'best_val_loss': best_val_loss
    }


def main():
    """Main entry point."""
    parser = ArgumentParser()
    parser.add_argument('--config', default='training/configs/cnn_config.yaml')
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
    
    results = train_model(config)
    logger.info(f"Results: {results}")


if __name__ == '__main__':
    main()
