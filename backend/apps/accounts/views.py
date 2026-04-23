from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from .serializers import UserProfileSerializer

class AuthViewSet(viewsets.ModelViewSet):
    """
    Handles authentication endpoints:
    - /auth/verify/ (POST) - Verify Supabase JWT
    - /auth/profile/ (GET) - Get user profile
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def verify(self, request):
        """Verify Supabase JWT token"""
        # Implementation for JWT verification
        return Response({'message': 'Token verified'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current user profile"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
