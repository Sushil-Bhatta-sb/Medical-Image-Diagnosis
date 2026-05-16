"""
Serializers for the models_registry app.
"""

from rest_framework import serializers
from .models import MLModel, ModelMetrics


class ModelMetricsSerializer(serializers.ModelSerializer):
    """Serializes training metrics for a specific model."""
    class Meta:
        model = ModelMetrics
        fields = [
            'id',
            'epoch',
            'train_loss',
            'val_loss',
            'train_accuracy',
            'val_accuracy',
            'recorded_at'
        ]
        read_only_fields = ['id', 'recorded_at']


class MLModelSerializer(serializers.ModelSerializer):
    """Serializes ML model information with nested metrics."""
    metrics = ModelMetricsSerializer(many=True, read_only=True)
    model_type_display = serializers.CharField(
        source='get_model_type_display',
        read_only=True
    )

    class Meta:
        model = MLModel
        fields = [
            'id',
            'name',
            'model_type',
            'model_type_display',
            'version',
            'description',
            'accuracy',
            'auc_roc',
            'f1_score',
            'is_active',
            'created_at',
            'updated_at',
            'metrics'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'metrics'
        ]
