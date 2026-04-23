from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ModelVersion, ModelMetrics
from .serializers import ModelVersionSerializer, ModelMetricsSerializer

class ModelViewSet(viewsets.ModelViewSet):
    """
    Model Registry API:
    - /models/ (GET, POST) - List/create models
    - /models/{id}/metrics/ (GET) - Get model metrics
    """
    queryset = ModelVersion.objects.filter(is_active=True)
    serializer_class = ModelVersionSerializer

    @action(detail=True, methods=['get'])
    def metrics(self, request, pk=None):
        """Get metrics for a specific model"""
        try:
            metrics = ModelMetrics.objects.get(model_id=pk)
            serializer = ModelMetricsSerializer(metrics)
            return Response(serializer.data)
        except ModelMetrics.DoesNotExist:
            return Response({'error': 'Metrics not found'}, status=404)
