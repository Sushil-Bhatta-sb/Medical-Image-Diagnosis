"""
Serializers for the predictions app.
"""

from rest_framework import serializers
from .models import Prediction


class PredictionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new prediction requests.
    Only requires image URL.
    """
    class Meta:
        model = Prediction
        fields = ['image_url']


class PredictionSerializer(serializers.ModelSerializer):
    """
    Full serializer for prediction responses.
    Includes all prediction results and metadata.
    """
    class Meta:
        model = Prediction
        fields = [
            'id',
            'user',
            'image_url',
            'status',
            'cnn_prediction',
            'cnn_confidence',
            'vit_prediction',
            'vit_confidence',
            'classical_prediction',
            'classical_confidence',
            'ensemble_prediction',
            'ensemble_confidence',
            'gradcam_cnn_url',
            'gradcam_vit_url',
            'disease_labels',
            'created_at',
            'completed_at',
            'error_message',
        ]
        read_only_fields = [
            'id',
            'user',
            'status',
            'cnn_prediction',
            'cnn_confidence',
            'vit_prediction',
            'vit_confidence',
            'classical_prediction',
            'classical_confidence',
            'ensemble_prediction',
            'ensemble_confidence',
            'gradcam_cnn_url',
            'gradcam_vit_url',
            'disease_labels',
            'created_at',
            'completed_at',
            'error_message',
        ]
