"""
Analytics serializers.
"""

from rest_framework import serializers
from apps.models_registry.models import MLModel


class MLModelComparisonSerializer(serializers.ModelSerializer):
    """Serializer for model comparison."""
    
    class Meta:
        model = MLModel
        fields = [
            'id', 'name', 'model_type', 'version',
            'accuracy', 'auc_roc', 'f1_score', 'is_active', 'created_at'
        ]
