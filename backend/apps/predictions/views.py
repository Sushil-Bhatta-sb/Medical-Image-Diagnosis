from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from .models import Prediction
from .serializers import PredictionSerializer, PredictionCreateSerializer
from .tasks import run_inference


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class PredictionCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PredictionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prediction = Prediction.objects.create(
            user=request.user,
            image_url=serializer.validated_data['image_url'],
            status='PENDING'
        )

        run_inference(str(prediction.id))

        response_serializer = PredictionSerializer(prediction)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class PredictionDetailView(RetrieveAPIView):
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Prediction.objects.filter(user=self.request.user)


class PredictionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            predictions = Prediction.objects.filter(
                user=request.user
            ).order_by('-created_at')
            serializer = PredictionSerializer(predictions, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response([], status=status.HTTP_200_OK)