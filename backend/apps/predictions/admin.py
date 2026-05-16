"""
Django admin configuration for predictions app.
"""

from django.contrib import admin
from .models import Prediction


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    """Admin interface for Prediction model."""
    list_display = ['id', 'user', 'status', 'ensemble_prediction', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'ensemble_prediction']
    readonly_fields = ['id', 'created_at', 'completed_at']
    fieldsets = (
        ('Basic Info', {'fields': ['id', 'user', 'image_url', 'status']}),
        ('CNN Results', {'fields': ['cnn_prediction', 'cnn_confidence'], 'classes': ['collapse']}),
        ('ViT Results', {'fields': ['vit_prediction', 'vit_confidence'], 'classes': ['collapse']}),
        ('Classical Results', {'fields': ['classical_prediction', 'classical_confidence'], 'classes': ['collapse']}),
        ('Ensemble Results', {'fields': ['ensemble_prediction', 'ensemble_confidence', 'disease_labels']}),
        ('Explainability', {'fields': ['gradcam_cnn_url', 'gradcam_vit_url'], 'classes': ['collapse']}),
        ('Timestamps', {'fields': ['created_at', 'completed_at'], 'classes': ['collapse']}),
        ('Errors', {'fields': ['error_message'], 'classes': ['collapse']}),
    )
