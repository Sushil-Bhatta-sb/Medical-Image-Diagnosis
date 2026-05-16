"""
ML model registry models for tracking and versioning models.
Stores model metadata and training metrics.
"""

from django.db import models


class MLModel(models.Model):
    """
    Registry for machine learning models used in predictions.
    Tracks model versions, performance metrics, and deployment status.
    """
    MODEL_TYPES = [
        ('CNN', 'Convolutional Neural Network (ResNet-50)'),
        ('VIT', 'Vision Transformer (Google ViT)'),
        ('CLASSICAL', 'Classical ML (SVM/XGBoost)'),
    ]

    name = models.CharField(
        max_length=255,
        help_text="Model name (e.g., 'ResNet50 v1', 'ViT Base v2')"
    )
    model_type = models.CharField(
        max_length=50,
        choices=MODEL_TYPES,
        help_text="Type of ML model"
    )
    version = models.CharField(
        max_length=50,
        help_text="Version number (e.g., '1.0.0', '2.1.3')"
    )
    description = models.TextField(
        blank=True,
        help_text="Detailed description of the model and training details"
    )
    accuracy = models.FloatField(
        help_text="Classification accuracy on test set"
    )
    auc_roc = models.FloatField(
        help_text="AUC-ROC score on test set"
    )
    f1_score = models.FloatField(
        help_text="F1 score on test set"
    )
    is_active = models.BooleanField(
        default=False,
        help_text="Whether this model is currently in production"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'models_registry_mlmodel'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['model_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.version})"


class ModelMetrics(models.Model):
    """
    Training metrics recorded per epoch for a specific model.
    Tracks convergence and model performance during training.
    """
    model = models.ForeignKey(
        MLModel,
        on_delete=models.CASCADE,
        related_name='metrics'
    )
    epoch = models.IntegerField(
        help_text="Training epoch number"
    )
    train_loss = models.FloatField(
        help_text="Training loss for this epoch"
    )
    val_loss = models.FloatField(
        help_text="Validation loss for this epoch"
    )
    train_accuracy = models.FloatField(
        help_text="Training accuracy for this epoch"
    )
    val_accuracy = models.FloatField(
        help_text="Validation accuracy for this epoch"
    )
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'models_registry_modelmetrics'
        ordering = ['-epoch']
        verbose_name_plural = 'Model Metrics'

    def __str__(self):
        return f"{self.model.name} - Epoch {self.epoch}"
