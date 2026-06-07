"""
ViT Training Script for Chest X-Ray Classification
Uses HuggingFace's Vision Transformer (ViT)
Binary Classification: NORMAL vs PNEUMONIA
"""

import os
import sys
import json
import copy
from datetime import datetime

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from PIL import Image
from tqdm import tqdm
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score, classification_report

# HuggingFace imports
from transformers import ViTForImageClassification, ViTImageProcessor

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════
DATASET_PATH = r"E:\archive\chest_xray"
WEIGHTS_PATH = r"D:\Medical-Image-Diagnosis\backend\weights"
MODEL_NAME = "google/vit-base-patch16-224"
BATCH_SIZE = 8  # Smaller batch size for memory
EPOCHS = 5
LEARNING_RATE = 0.00002
NUM_CLASSES = 2
PATIENCE = 2  # Early stopping patience

CLASS_LABELS = ['NORMAL', 'PNEUMONIA']
LABEL2ID = {label: idx for idx, label in enumerate(CLASS_LABELS)}
ID2LABEL = {idx: label for idx, label in enumerate(CLASS_LABELS)}
# ═══════════════════════════════════════════════════════════════════════════════


def print_header():
    """Print script header with configuration."""
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    print("=" * 70)
    print("ViT TRAINING - Chest X-Ray Classification")
    print("=" * 70)
    print(f"Device:       {device}")
    if torch.cuda.is_available():
        print(f"GPU:          {torch.cuda.get_device_name(0)}")
        print(f"CUDA Version: {torch.version.cuda}")
        print(f"GPU Memory:   {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
    print(f"PyTorch:      {torch.__version__}")
    print("-" * 70)
    print(f"Model:        {MODEL_NAME}")
    print(f"Dataset:      {DATASET_PATH}")
    print(f"Weights:      {WEIGHTS_PATH}")
    print(f"Batch Size:   {BATCH_SIZE}")
    print(f"Epochs:       {EPOCHS}")
    print(f"LR:           {LEARNING_RATE}")
    print(f"Classes:      {CLASS_LABELS}")
    print("=" * 70)
    print()
    
    return device


class ChestXRayDatasetViT(Dataset):
    """
    Custom Dataset for Chest X-Ray images with ViT preprocessing.
    """
    
    def __init__(self, root_dir, split='train', processor=None):
        """
        Args:
            root_dir: Path to dataset root
            split: 'train', 'val', or 'test'
            processor: ViTImageProcessor for preprocessing
        """
        self.root_dir = root_dir
        self.split = split
        self.processor = processor
        self.samples = []
        self.labels = []
        
        split_path = os.path.join(root_dir, split)
        
        if not os.path.exists(split_path):
            raise ValueError(f"Split path not found: {split_path}")
        
        # Load all images
        for class_idx, class_name in enumerate(CLASS_LABELS):
            class_path = os.path.join(split_path, class_name)
            
            if not os.path.exists(class_path):
                print(f"WARNING: Class folder not found: {class_path}")
                continue
            
            for img_file in os.listdir(class_path):
                if img_file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    self.samples.append(os.path.join(class_path, img_file))
                    self.labels.append(class_idx)
        
        self.labels = np.array(self.labels)
        print(f"  [{split}] Loaded {len(self.samples)} images")
        print(f"    NORMAL: {np.sum(self.labels == 0)}, PNEUMONIA: {np.sum(self.labels == 1)}")
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        img_path = self.samples[idx]
        label = self.labels[idx]
        
        # Load image
        image = Image.open(img_path).convert('RGB')
        
        # Process with ViT processor
        if self.processor:
            inputs = self.processor(images=image, return_tensors="pt")
            pixel_values = inputs['pixel_values'].squeeze(0)
        else:
            # Fallback: simple tensor conversion
            pixel_values = torch.tensor(np.array(image)).permute(2, 0, 1).float() / 255.0
        
        return pixel_values, label
    
    def get_class_weights(self):
        """Calculate class weights for imbalanced data."""
        class_counts = np.bincount(self.labels)
        weights = 1.0 / class_counts
        sample_weights = weights[self.labels]
        return torch.DoubleTensor(sample_weights)


def create_model(device):
    """
    Create ViT model for image classification.
    """
    print("\nLoading ViT model...")
    print(f"  Model: {MODEL_NAME}")
    
    # Load processor
    processor = ViTImageProcessor.from_pretrained(MODEL_NAME)
    
    # Load model
    model = ViTForImageClassification.from_pretrained(
        MODEL_NAME,
        num_labels=NUM_CLASSES,
        id2label=ID2LABEL,
        label2id=LABEL2ID,
        ignore_mismatched_sizes=True
    )
    
    model = model.to(device)
    
    # Count parameters
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"  Total parameters:     {total_params:,}")
    print(f"  Trainable parameters: {trainable_params:,}")
    
    return model, processor


def train_epoch(model, dataloader, optimizer, device):
    """Train for one epoch."""
    model.train()
    running_loss = 0.0
    all_preds = []
    all_labels = []
    
    pbar = tqdm(dataloader, desc="Training", leave=False)
    for pixel_values, labels in pbar:
        pixel_values = pixel_values.to(device)
        labels = labels.to(device)
        
        optimizer.zero_grad()
        
        outputs = model(pixel_values=pixel_values, labels=labels)
        loss = outputs.loss
        
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item() * pixel_values.size(0)
        preds = outputs.logits.argmax(dim=-1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())
        
        pbar.set_postfix({'loss': f'{loss.item():.4f}'})
    
    epoch_loss = running_loss / len(dataloader.dataset)
    epoch_acc = accuracy_score(all_labels, all_preds)
    
    return epoch_loss, epoch_acc


def validate_epoch(model, dataloader, device):
    """Validate for one epoch."""
    model.eval()
    running_loss = 0.0
    all_preds = []
    all_labels = []
    all_probs = []
    
    with torch.no_grad():
        for pixel_values, labels in tqdm(dataloader, desc="Validating", leave=False):
            pixel_values = pixel_values.to(device)
            labels = labels.to(device)
            
            outputs = model(pixel_values=pixel_values, labels=labels)
            loss = outputs.loss
            
            running_loss += loss.item() * pixel_values.size(0)
            probs = torch.softmax(outputs.logits, dim=1)
            preds = outputs.logits.argmax(dim=-1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            all_probs.extend(probs[:, 1].cpu().numpy())  # Prob of PNEUMONIA
    
    epoch_loss = running_loss / len(dataloader.dataset)
    epoch_acc = accuracy_score(all_labels, all_preds)
    
    return epoch_loss, epoch_acc, all_labels, all_preds, all_probs


def evaluate_test(model, test_loader, device):
    """Evaluate model on test set and return metrics."""
    model.eval()
    all_preds = []
    all_labels = []
    all_probs = []
    
    with torch.no_grad():
        for pixel_values, labels in tqdm(test_loader, desc="Testing"):
            pixel_values = pixel_values.to(device)
            
            outputs = model(pixel_values=pixel_values)
            probs = torch.softmax(outputs.logits, dim=1)
            preds = outputs.logits.argmax(dim=-1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            all_probs.extend(probs[:, 1].cpu().numpy())
    
    # Calculate metrics
    accuracy = accuracy_score(all_labels, all_preds)
    auc_roc = roc_auc_score(all_labels, all_probs)
    f1 = f1_score(all_labels, all_preds)
    
    metrics = {
        'accuracy': round(accuracy, 4),
        'auc_roc': round(auc_roc, 4),
        'f1_score': round(f1, 4)
    }
    
    return metrics, all_labels, all_preds


def train():
    """Main training function."""
    device = print_header()
    
    # Create weights directory
    os.makedirs(WEIGHTS_PATH, exist_ok=True)
    
    # Create model and processor
    model, processor = create_model(device)
    
    # Create datasets
    print("\nLoading datasets...")
    train_dataset = ChestXRayDatasetViT(DATASET_PATH, 'train', processor)
    val_dataset = ChestXRayDatasetViT(DATASET_PATH, 'val', processor)
    test_dataset = ChestXRayDatasetViT(DATASET_PATH, 'test', processor)
    
    # Create weighted sampler for imbalanced data
    sample_weights = train_dataset.get_class_weights()
    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True
    )
    
    # Create dataloaders
    train_loader = DataLoader(
        train_dataset, 
        batch_size=BATCH_SIZE, 
        sampler=sampler,
        num_workers=0,  # Windows compatibility
        pin_memory=True if torch.cuda.is_available() else False
    )
    val_loader = DataLoader(
        val_dataset, 
        batch_size=BATCH_SIZE, 
        shuffle=False,
        num_workers=0,
        pin_memory=True if torch.cuda.is_available() else False
    )
    test_loader = DataLoader(
        test_dataset, 
        batch_size=BATCH_SIZE, 
        shuffle=False,
        num_workers=0,
        pin_memory=True if torch.cuda.is_available() else False
    )
    
    # Optimizer and scheduler
    optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=0.01)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='max', factor=0.5, patience=1, verbose=True
    )
    
    # Training loop
    print("\n" + "=" * 70)
    print("TRAINING")
    print("=" * 70)
    
    best_val_acc = 0.0
    best_model_state = None
    epochs_no_improve = 0
    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}
    
    start_time = datetime.now()
    
    for epoch in range(EPOCHS):
        print(f"\nEpoch {epoch + 1}/{EPOCHS}")
        print("-" * 40)
        
        # Train
        train_loss, train_acc = train_epoch(model, train_loader, optimizer, device)
        
        # Validate
        val_loss, val_acc, _, _, _ = validate_epoch(model, val_loader, device)
        
        # Update scheduler
        scheduler.step(val_acc)
        
        # Save history
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        # Print epoch results
        print(f"  Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f}")
        print(f"  Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc:.4f}")
        print(f"  LR: {optimizer.param_groups[0]['lr']:.6f}")
        
        # Check for improvement
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_model_state = copy.deepcopy(model.state_dict())
            epochs_no_improve = 0
            print(f"  ✓ New best model (val_acc: {val_acc:.4f})")
        else:
            epochs_no_improve += 1
            print(f"  No improvement for {epochs_no_improve} epoch(s)")
        
        # Early stopping
        if epochs_no_improve >= PATIENCE:
            print(f"\nEarly stopping triggered after {epoch + 1} epochs")
            break
    
    training_time = datetime.now() - start_time
    
    # Load best model
    if best_model_state:
        model.load_state_dict(best_model_state)
    
    # Evaluate on test set
    print("\n" + "=" * 70)
    print("EVALUATION ON TEST SET")
    print("=" * 70)
    
    metrics, test_labels, test_preds = evaluate_test(model, test_loader, device)
    
    print(f"\nTest Metrics:")
    print(f"  Accuracy: {metrics['accuracy']:.4f}")
    print(f"  AUC-ROC:  {metrics['auc_roc']:.4f}")
    print(f"  F1 Score: {metrics['f1_score']:.4f}")
    
    print(f"\nClassification Report:")
    print(classification_report(test_labels, test_preds, target_names=CLASS_LABELS))
    
    # Save model
    print("\n" + "=" * 70)
    print("SAVING MODEL")
    print("=" * 70)
    
    model_path = os.path.join(WEIGHTS_PATH, 'vit_best.pth')
    torch.save({
        'model_state_dict': best_model_state,
        'class_labels': CLASS_LABELS,
        'num_classes': NUM_CLASSES,
        'model_name': MODEL_NAME,
        'best_val_acc': best_val_acc,
        'id2label': ID2LABEL,
        'label2id': LABEL2ID,
        'trained_at': datetime.now().isoformat()
    }, model_path)
    print(f"Model saved to: {model_path}")
    
    # Save metrics
    metrics_path = os.path.join(WEIGHTS_PATH, 'vit_metrics.json')
    all_metrics = {
        'model': 'ViT-Base-Patch16-224',
        'model_name': MODEL_NAME,
        'test_metrics': metrics,
        'best_val_acc': round(best_val_acc, 4),
        'training_time': str(training_time),
        'history': {k: [round(v, 4) for v in vals] for k, vals in history.items()},
        'config': {
            'batch_size': BATCH_SIZE,
            'epochs_trained': len(history['train_loss']),
            'max_epochs': EPOCHS,
            'learning_rate': LEARNING_RATE,
            'patience': PATIENCE
        },
        'trained_at': datetime.now().isoformat()
    }
    
    with open(metrics_path, 'w') as f:
        json.dump(all_metrics, f, indent=2)
    print(f"Metrics saved to: {metrics_path}")
    
    # Print summary
    print("\n" + "=" * 70)
    print("TRAINING COMPLETE")
    print("=" * 70)
    print(f"Total training time: {training_time}")
    print(f"Best validation accuracy: {best_val_acc:.4f}")
    print(f"Test accuracy: {metrics['accuracy']:.4f}")
    print(f"Test AUC-ROC: {metrics['auc_roc']:.4f}")
    print("\nNOTE: ViT training on CPU is very slow (15+ hours).")
    print("Consider using a GPU or loading pretrained weights only.")


if __name__ == '__main__':
    train()
