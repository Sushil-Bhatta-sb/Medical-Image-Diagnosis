"""
Prediction models for storing and tracking inference results.
Stores image URLs, model predictions, and explainability outputs.
"""

import uuid
from django.db import models
from django.contrib.auth.models import User


class Prediction(models.Model):
    """
    Stores prediction results from the ensemble of ML models.
    Tracks inference status, predictions from each model, and explainability outputs.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Waiting to be processed'),
        ('PROCESSING', 'Currently being processed'),
        ('COMPLETED', 'Inference completed successfully'),
        ('FAILED', 'Inference failed'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique prediction ID"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='predictions',
        help_text="User who requested this prediction"
    )
    image_url = models.URLField(
        help_text="URL of the original medical image from Supabase Storage"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        help_text="Current status of the prediction task"
    )

    # CNN Model Results
    cnn_prediction = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Predicted class from CNN model"
    )
    cnn_confidence = models.FloatField(
        blank=True,
        null=True,
        help_text="Confidence score from CNN model (0-1)"
    )

    # ViT Model Results
    vit_prediction = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Predicted class from ViT model"
    )
    vit_confidence = models.FloatField(
        blank=True,
        null=True,
        help_text="Confidence score from ViT model (0-1)"
    )

    # Classical ML Model Results
    classical_prediction = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Predicted class from Classical ML model"
    )
    classical_confidence = models.FloatField(
        blank=True,
        null=True,
        help_text="Confidence score from Classical ML model (0-1)"
    )

    # Ensemble Results
    ensemble_prediction = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Final ensemble prediction (majority vote)"
    )
    ensemble_confidence = models.FloatField(
        blank=True,
        null=True,
        help_text="Ensemble confidence (average of winning model confidences)"
    )

    # Explainability Outputs
    gradcam_cnn_url = models.URLField(
        blank=True,
        null=True,
        help_text="URL of Grad-CAM heatmap overlay for CNN"
    )
    gradcam_vit_url = models.URLField(
        blank=True,
        null=True,
        help_text="URL of Grad-CAM heatmap overlay for ViT"
    )

    # All Class Probabilities
    disease_labels = models.JSONField(
        blank=True,
        null=True,
        help_text="Dictionary of all class labels and their probabilities"
    )

    # Timestamps and Error Handling
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Timestamp when prediction was completed"
    )
    error_message = models.TextField(
        blank=True,
        null=True,
        help_text="Error message if status is FAILED"
    )

    class Meta:
        db_table = 'predictions_prediction'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Prediction({self.id}, {self.status})"
