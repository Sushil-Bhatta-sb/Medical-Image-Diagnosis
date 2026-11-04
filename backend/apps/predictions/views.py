import uuid

import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from .models import Prediction
from .serializers import PredictionSerializer, PredictionCreateSerializer
from .tasks import run_inference


STORAGE_BUCKET = 'xray-images'
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ImageUploadView(APIView):
    """
    Receives an image from the authenticated user and uploads it to Supabase
    Storage using the server-side service key. This bypasses storage RLS and
    keeps the secret key out of the browser.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image_file = request.FILES.get('file') or request.FILES.get('image')
        if image_file is None:
            return Response(
                {'detail': 'No image file provided.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        content_type = image_file.content_type or 'application/octet-stream'
        if content_type not in ALLOWED_IMAGE_TYPES:
            return Response(
                {'detail': f'Unsupported file type: {content_type}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file.size and image_file.size > MAX_IMAGE_BYTES:
            return Response(
                {'detail': 'Image exceeds the 10 MB size limit.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            return Response(
                {'detail': 'Storage is not configured on the server.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        extension = (image_file.name.rsplit('.', 1)[-1] if '.' in image_file.name else 'jpg')
        object_path = f'predictions/{uuid.uuid4().hex}.{extension.lower()}'
        upload_url = (
            f'{settings.SUPABASE_URL}/storage/v1/object/'
            f'{STORAGE_BUCKET}/{object_path}'
        )

        try:
            upload_response = requests.post(
                upload_url,
                data=image_file.read(),
                headers={
                    'Authorization': f'Bearer {settings.SUPABASE_SERVICE_KEY}',
                    'apikey': settings.SUPABASE_SERVICE_KEY,
                    'Content-Type': content_type,
                    'x-upsert': 'true',
                },
                timeout=30,
            )
        except requests.RequestException as exc:
            return Response(
                {'detail': f'Failed to reach storage service: {exc}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if upload_response.status_code not in (200, 201):
            return Response(
                {'detail': 'Storage upload failed.', 'error': upload_response.text},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        public_url = (
            f'{settings.SUPABASE_URL}/storage/v1/object/public/'
            f'{STORAGE_BUCKET}/{object_path}'
        )
        return Response({'image_url': public_url}, status=status.HTTP_201_CREATED)


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