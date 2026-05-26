import jwt
import requests
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import logging

logger = logging.getLogger(__name__)


class SupabaseJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1].strip()

        try:
            # First try HS256 with secret
            secret = settings.SUPABASE_JWT_SECRET
            payload = jwt.decode(
                token,
                secret,
                algorithms=['HS256', 'RS256'],
                options={"verify_aud": False}
            )
        except jwt.InvalidAlgorithmError:
            # Try decoding without verification to get payload
            try:
                payload = jwt.decode(
                    token,
                    options={
                        "verify_signature": False,
                        "verify_aud": False
                    }
                )
                # Manually verify it's from our Supabase project
                issuer = payload.get('iss', '')
                if settings.SUPABASE_URL not in issuer:
                    raise AuthenticationFailed('Token not from valid issuer.')
            except Exception as e:
                raise AuthenticationFailed(f'Token error: {str(e)}')
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired.')
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')

        supabase_uid = payload.get('sub')
        email = payload.get('email', '')

        if not supabase_uid:
            raise AuthenticationFailed('Token missing subject.')

        user, created = User.objects.get_or_create(
            username=supabase_uid,
            defaults={'email': email}
        )

        logger.info(f"Authenticated: {email}")
        return (user, payload)