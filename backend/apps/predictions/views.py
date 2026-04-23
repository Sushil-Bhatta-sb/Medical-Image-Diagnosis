from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Prediction
from .serializers import PredictionSerializer

class PredictionViewSet(viewsets.ModelViewSet):
    """
    Prediction API endpoints:
    - /predict/ (POST) - Run prediction
    - /predictions/history/ (GET) - Get user prediction history
    """
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Prediction.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def predict(self, request):
        """Run prediction on uploaded image"""
        # Implementation for image prediction
        return Response({'message': 'Prediction created'}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get user's prediction history"""
        predictions = self.get_queryset()
        serializer = self.get_serializer(predictions, many=True)
        return Response(serializer.data)
