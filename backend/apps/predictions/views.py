"""
API views for the predictions app.
Handles prediction creation, status checking, and history retrieval.
"""

from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

from .models import Prediction
from .serializers import PredictionSerializer, PredictionCreateSerializer
from .tasks import run_inference


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for prediction history."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class PredictionCreateView(APIView):
    """
    Create a new prediction request and trigger async inference.
    
    POST /api/predictions/ - Create new prediction
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Create a new prediction and start async inference.
        
        Args:
            request: HTTP request with image_url in body
            
        Returns:
            Response with created prediction (PENDING status)
        """
        serializer = PredictionCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create prediction instance
        prediction = Prediction.objects.create(
            user=request.user,
            image_url=serializer.validated_data['image_url'],
            status='PENDING'
        )
        
        # Trigger async inference task
        run_inference.delay(str(prediction.id))
        
        # Return created prediction
        response_serializer = PredictionSerializer(prediction)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )


class PredictionDetailView(RetrieveAPIView):
    """
    Retrieve a specific prediction by ID.
    
    GET /api/predictions/<uuid>/ - Get prediction status and results
    """
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        """
        Return predictions for the current user.
        
        Returns:
            QuerySet of user's predictions
        """
        return Prediction.objects.filter(user=self.request.user)


class PredictionHistoryView(ListAPIView):
    """
    Retrieve paginated history of user's predictions.
    
    GET /api/predictions/history/ - Get all user predictions (paginated)
    """
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """
        Return all predictions for the current user, newest first.
        
        Returns:
            QuerySet of user's predictions ordered by creation date
        """
        return Prediction.objects.filter(
            user=self.request.user
        ).order_by('-created_at')
