"""
Views for the accounts app.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import UserProfile
from .serializers import UserProfileSerializer


class ProfileView(APIView):
    """
    Get the current authenticated user's profile.
    
    GET /api/auth/profile/ - Returns current user's profile
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve the current authenticated user's profile.
        """
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
