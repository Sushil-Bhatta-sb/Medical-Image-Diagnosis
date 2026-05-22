from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import UserProfile
from .serializers import UserProfileSerializer
import logging

logger = logging.getLogger(__name__)


class ProfileView(APIView):
    """Protected - requires valid JWT"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """GET /api/auth/profile/"""
        try:
            profile, created = UserProfile.objects.get_or_create(
                user=request.user,
                defaults={
                    'supabase_uid': request.user.username,
                }
            )
            return Response({
                'id': request.user.id,
                'email': request.user.email,
                'supabase_uid': request.user.username,
                'total_predictions': profile.total_predictions,
                'created_at': profile.created_at,
                'is_authenticated': True,
            })
        except Exception as e:
            logger.error(f"Profile error: {e}")
            return Response({'error': str(e)}, status=500)


class HealthCheckView(APIView):
    """Public health check"""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({
            'status': 'ok',
            'message': 'Backend is running'
        })
