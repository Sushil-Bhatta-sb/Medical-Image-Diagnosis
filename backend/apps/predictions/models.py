"""
Prediction models for storing and tracking inference results.
"""

import uuid
from django.db import models
from django.contrib.auth.models import User


class Prediction(models.Model):
    """
    Stores prediction results from the ensemble of ML models.
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
        editable=False
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='predictions'
    )
    image_url = models.URLField(
        help_text='URL of the original medical image from Supabase Storage'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    # CNN Model Results
    cnn_prediction = models.CharField(max_length=255, blank=True, null=True)
    cnn_confidence = models.FloatField(blank=True, null=True)

    # ViT Model Results
    vit_prediction = models.CharField(max_length=255, blank=True, null=True)
    vit_confidence = models.FloatField(blank=True, null=True)

    # Classical ML Model Results
    classical_prediction = models.CharField(max_length=255, blank=True, null=True)
    classical_confidence = models.FloatField(blank=True, null=True)

    # Ensemble Results
    ensemble_prediction = models.CharField(max_length=255, blank=True, null=True)
    ensemble_confidence = models.FloatField(blank=True, null=True)

    # Explainability Outputs
    gradcam_cnn_url = models.CharField(max_length=500, blank=True, null=True)
    gradcam_vit_url = models.CharField(max_length=500, blank=True, null=True)

    # All Class Probabilities
    disease_labels = models.JSONField(blank=True, null=True)

    # Timestamps and Error Handling
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'predictions_prediction'
        ordering = ['-created_at']
        verbose_name = 'Prediction'
        verbose_name_plural = 'Predictions'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'Prediction({self.id}, {self.status})'
