"""
Training script for Vision Transformer (ViT) model.
Trains HuggingFace ViTForImageClassification on medical images.
"""

import os
import logging
import yaml
from argparse import ArgumentParser
from pathlib import Path

import torch
from torch.utils.data import DataLoader, Dataset
from torchvision.datasets import ImageFolder
from torchvision import transforms
from transformers import ViTImageProcessor, ViTForImageClassification
from torch.optim import Adam
from torch.optim.lr_scheduler import ReduceLROnPlateau
from tqdm import tqdm

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class ImageDataset(Dataset):
    """Custom dataset wrapper for ViT."""
    
    def __init__(self, image_dir: str, processor):
        """
        Initialize dataset.
        
        Args:
            image_dir: Path to image directory
            processor: ViTImageProcessor
        """
        self.image_folder = ImageFolder(image_dir)
        self.processor = processor
    
    def __len__(self):
        return len(self.image_folder)
    
    def __getitem__(self, idx):
        image, label = self.image_folder[idx]
        
        # Process image with ViT processor
        inputs = self.processor(image, return_tensors='pt')
        
        return {
            'pixel_values': inputs['pixel_values'].squeeze(0),
            'labels': torch.tensor(label)
        }


def train_epoch(model, dataloader, optimizer, device):
    """
    Train for one epoch.
    
    Args:
        model: ViT model
        dataloader: Training dataloader
        optimizer: Optimizer
        device: Device to train on
        
    Returns:
        Average loss
    """
    model.train()
    total_loss = 0
    
    for batch in tqdm(dataloader, desc='Training'):
        pixel_values = batch['pixel_values'].to(device)
        labels = batch['labels'].to(device)
        
        optimizer.zero_grad()
        
        outputs = model(pixel_values=pixel_values, labels=labels)
        loss = outputs.loss
        
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
    
    avg_loss = total_loss / len(dataloader)
    return avg_loss


def validate_epoch(model, dataloader, device):
    """
    Validate for one epoch.
    
    Args:
        model: ViT model
        dataloader: Validation dataloader
        device: Device to validate on
        
    Returns:
        Validation loss and accuracy
    """
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for batch in tqdm(dataloader, desc='Validating'):
            pixel_values = batch['pixel_values'].to(device)
            labels = batch['labels'].to(device)
            
            outputs = model(pixel_values=pixel_values, labels=labels)
            loss = outputs.loss
            logits = outputs.logits
            
            total_loss += loss.item()
            
            predictions = torch.argmax(logits, dim=1)
            correct += (predictions == labels).sum().item()
            total += labels.size(0)
    
    avg_loss = total_loss / len(dataloader)
    accuracy = 100 * correct / total
    
    return avg_loss, accuracy


def train_model(config: dict) -> dict:
    """
    Main training loop for ViT.
    
    Args:
        config: Configuration dictionary
        
    Returns:
        Dictionary with training results
    """
    # Setup device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f"Using device: {device}")
    
    # Load config
    learning_rate = config.get('learning_rate', 0.00005)
    batch_size = config.get('batch_size', 16)
    epochs = config.get('epochs', 30)
    dataset_path = config.get('dataset_path', 'data/chest_xray')
    weights_path = config.get('weights_path', 'backend/weights/vit_best.pth')
    model_id = config.get('model_id', 'google/vit-base-patch16-224')
    
    # Create weights directory
    os.makedirs(os.path.dirname(weights_path), exist_ok=True)
    
    # Load processor and model
    processor = ViTImageProcessor.from_pretrained(model_id)
    
    # Create datasets to get number of classes
    train_image_folder = ImageFolder(os.path.join(dataset_path, 'train'))
    num_classes = len(train_image_folder.classes)
    
    model = ViTForImageClassification.from_pretrained(
        model_id,
        num_labels=num_classes,
        ignore_mismatched_sizes=True
    )
    model.to(device)
    
    logger.info(f"Number of classes: {num_classes}")
    
    # Load data
    train_dataset = ImageDataset(os.path.join(dataset_path, 'train'), processor)
    val_dataset = ImageDataset(os.path.join(dataset_path, 'val'), processor)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    # Setup training
    optimizer = Adam(model.parameters(), lr=learning_rate)
    scheduler = ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=2, verbose=True
    )
    
    best_val_loss = float('inf')
    patience = 5
    patience_counter = 0
    metrics_history = []
    
    logger.info("Starting ViT training...")
    
    for epoch in range(epochs):
        train_loss = train_epoch(model, train_loader, optimizer, device)
        val_loss, val_acc = validate_epoch(model, val_loader, device)
        
        scheduler.step(val_loss)
        
        metrics_history.append({
            'epoch': epoch + 1,
            'train_loss': train_loss,
            'val_loss': val_loss,
            'val_accuracy': val_acc
        })
        
        logger.info(
            f"Epoch {epoch+1}/{epochs} | "
            f"Train Loss: {train_loss:.4f} | "
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
    
    logger.info("ViT training completed!")
    
    return {
        'weights_path': weights_path,
        'metrics_history': metrics_history,
        'best_val_loss': best_val_loss
    }


def main():
    """Main entry point."""
    parser = ArgumentParser()
    parser.add_argument('--config', default='training/configs/vit_config.yaml')
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
    
    results = train_model(config)
    logger.info(f"Results: {results}")


if __name__ == '__main__':
    main()
