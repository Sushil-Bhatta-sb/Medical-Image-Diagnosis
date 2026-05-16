"""
ML model registry models for tracking and versioning models.
"""

from django.db import models


class MLModel(models.Model):
    """Registry for machine learning models used in predictions."""
    MODEL_TYPES = [
        ('CNN', 'Convolutional Neural Network (ResNet-50)'),
        ('VIT', 'Vision Transformer'),
        ('CLASSICAL', 'Classical ML (SVM/XGBoost)'),
    ]

    name = models.CharField(max_length=255)
    model_type = models.CharField(max_length=50, choices=MODEL_TYPES)
    version = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    accuracy = models.FloatField(null=True, blank=True)
    auc_roc = models.FloatField(null=True, blank=True)
    f1_score = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'models_registry_mlmodel'
        ordering = ['-created_at']
        verbose_name = 'ML Model'
        verbose_name_plural = 'ML Models'

    def __str__(self):
        return f'{self.name} ({self.version})'


class ModelMetrics(models.Model):
    """Training metrics recorded per epoch for a specific model."""
    model = models.ForeignKey(
        MLModel,
        on_delete=models.CASCADE,
        related_name='metrics'
    )
    epoch = models.IntegerField()
    train_loss = models.FloatField()
    val_loss = models.FloatField()
    train_accuracy = models.FloatField()
    val_accuracy = models.FloatField()
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'models_registry_modelmetrics'
        ordering = ['-epoch']
        verbose_name = 'Model Metrics'
        verbose_name_plural = 'Model Metrics'

    def __str__(self):
        return f'{self.model.name} - Epoch {self.epoch}'
