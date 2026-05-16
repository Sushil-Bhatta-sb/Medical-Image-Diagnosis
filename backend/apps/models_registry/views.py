"""
Views for the models_registry app.
"""

from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .models import MLModel
from .serializers import MLModelSerializer


class MLModelListView(ListAPIView):
    """
    List all active ML models in the registry.
    
    GET /api/models/ - Returns list of all active models
    """
    queryset = MLModel.objects.filter(is_active=True).prefetch_related('metrics')
    serializer_class = MLModelSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        """Return all active models, ordered by creation date."""
        return MLModel.objects.filter(is_active=True).prefetch_related('metrics').order_by('-created_at')


class MLModelDetailView(RetrieveAPIView):
    """
    Retrieve a single ML model with all its training metrics.
    
    GET /api/models/<id>/ - Returns model details with metrics
    """
    queryset = MLModel.objects.prefetch_related('metrics')
    serializer_class = MLModelSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
