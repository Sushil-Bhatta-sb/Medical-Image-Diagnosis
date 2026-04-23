from rest_framework import serializers
from .models import ModelVersion, ModelMetrics

class ModelVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelVersion
        fields = ['id', 'name', 'version', 'architecture', 'framework', 'created_at', 'is_active']

class ModelMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelMetrics
        fields = ['id', 'model', 'accuracy', 'precision', 'recall', 'f1_score', 'roc_auc', 'confusion_matrix']
