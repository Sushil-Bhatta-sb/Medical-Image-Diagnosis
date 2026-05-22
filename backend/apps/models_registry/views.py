from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import MLModel
from .serializers import MLModelSerializer, ModelMetricsSerializer
import logging

logger = logging.getLogger(__name__)


class MLModelListView(APIView):
    """
    Public endpoint - no auth required.
    Returns all active ML models.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        """GET /api/models/ - Returns list of all active models"""
        try:
            models = MLModel.objects.filter(is_active=True).order_by('-auc_roc')
            serializer = MLModelSerializer(models, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching models: {e}")
            return Response({'error': str(e)}, status=500)


class MLModelDetailView(APIView):
    """
    Public endpoint - no auth required.
    Returns single model with its metrics.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, pk):
        """GET /api/models/<id>/ - Returns model + metrics"""
        try:
            model = MLModel.objects.get(pk=pk, is_active=True)
            serializer = MLModelSerializer(model)
            return Response(serializer.data)
        except MLModel.DoesNotExist:
            return Response({'error': 'Model not found'}, status=404)
        except Exception as e:
            logger.error(f"Error fetching model {pk}: {e}")
            return Response({'error': str(e)}, status=500)
