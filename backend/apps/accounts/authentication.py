"""
Supabase JWT Authentication for Django REST Framework.
"""

import jwt
import logging
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)


class SupabaseJWTAuthentication(BaseAuthentication):
    """
    JWT authentication for Supabase.
    
    Validates JWT tokens from Supabase and creates/retrieves Django User.
    """

    def authenticate(self, request):
        """
        Authenticate request using Supabase JWT token from Authorization header.
        
        Args:
            request: Django HTTP request
            
        Returns:
            Tuple of (user, payload) or None if no token
            
        Raises:
            AuthenticationFailed: If token is invalid or expired
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return None
        
        try:
            # Extract Bearer token
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                raise AuthenticationFailed('Invalid Authorization header format')
            
            token = parts[1]
            
            # Decode JWT
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256']
            )
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
        
        # Extract Supabase UID from payload
        supabase_uid = payload.get('sub')
        if not supabase_uid:
            raise AuthenticationFailed('Invalid token payload: missing sub')
        
        # Get or create Django User
        user, created = User.objects.get_or_create(
            username=supabase_uid,
            defaults={
                'email': payload.get('email', ''),
                'first_name': payload.get('name', '').split()[0] if payload.get('name') else '',
            }
        )
        
        # Create or update UserProfile with Supabase UID
        from .models import UserProfile
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={'supabase_uid': supabase_uid}
        )
        
        return (user, payload)
