from rest_framework import serializers
from .models import Prediction

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = ['id', 'image', 'model_name', 'confidence', 'prediction', 'gradcam_data', 'created_at']
