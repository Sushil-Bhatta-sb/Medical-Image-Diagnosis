import jwt
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import logging

logger = logging.getLogger(__name__)


class SupabaseJWTAuthentication(BaseAuthentication):
    """
    Authenticates requests using Supabase-issued JWT tokens.
    Token must be passed as: Authorization: Bearer <token>
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
            
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1].strip()
        
        if not token:
            return None

        secret = settings.SUPABASE_JWT_SECRET
        
        if not secret:
            logger.error("SUPABASE_JWT_SECRET not configured")
            raise AuthenticationFailed('Server misconfigured.')

        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=['HS256'],
                options={
                    "verify_aud": False,
                    "verify_exp": True,
                }
            )
            logger.info(f"JWT valid for user: {payload.get('email')}")
            
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired")
            raise AuthenticationFailed('Token has expired.')
            
        except jwt.InvalidSignatureError:
            logger.error("JWT signature invalid - check SUPABASE_JWT_SECRET")
            raise AuthenticationFailed('Invalid token signature.')
            
        except jwt.DecodeError as e:
            logger.error(f"JWT decode error: {e}")
            raise AuthenticationFailed('Token decode failed.')
            
        except jwt.InvalidTokenError as e:
            logger.error(f"JWT invalid: {e}")
            raise AuthenticationFailed(f'Invalid token.')

        supabase_uid = payload.get('sub')
        email = payload.get('email', '')

        if not supabase_uid:
            raise AuthenticationFailed('Token missing subject claim.')

        user, created = User.objects.get_or_create(
            username=supabase_uid,
            defaults={
                'email': email,
                'first_name': payload.get('user_metadata', {}).get('full_name', ''),
            }
        )
        
        if created:
            logger.info(f"Created new Django user for: {email}")

        return (user, payload)

    def authenticate_header(self, request):
        return 'Bearer realm="api"'
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
