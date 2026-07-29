import logging

import jwt
from jwt import PyJWKClient
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)

# Cached JWKS client (fetches Supabase public signing keys once, then caches).
_jwks_client = None


def _get_jwks_client():
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url)
    return _jwks_client


class SupabaseJWTAuthentication(BaseAuthentication):
    """
    Authenticates requests using a Supabase-issued access token.

    Supports both signing schemes Supabase uses:
      * ES256 / RS256  -> verified against the project's public JWKS keys
      * HS256          -> verified with the legacy shared JWT secret
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ', 1)[1].strip()
        payload = self._decode(token)

        supabase_uid = payload.get('sub')
        email = payload.get('email', '') or ''

        if not supabase_uid:
            raise AuthenticationFailed('Token missing subject (sub).')

        user, _ = User.objects.get_or_create(
            username=supabase_uid,
            defaults={'email': email},
        )

        # Keep the local email in sync with Supabase.
        if email and user.email != email:
            user.email = email
            user.save(update_fields=['email'])

        logger.info(f'Authenticated Supabase user: {email or supabase_uid}')
        return (user, payload)

    def _decode(self, token):
        try:
            header = jwt.get_unverified_header(token)
        except jwt.InvalidTokenError as exc:
            raise AuthenticationFailed(f'Malformed token header: {exc}')

        alg = header.get('alg', '')

        try:
            if alg in ('ES256', 'RS256'):
                signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
                return jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=['ES256', 'RS256'],
                    options={'verify_aud': False},
                )

            if alg == 'HS256':
                if not settings.SUPABASE_JWT_SECRET:
                    raise AuthenticationFailed('HS256 token received but no JWT secret configured.')
                return jwt.decode(
                    token,
                    settings.SUPABASE_JWT_SECRET,
                    algorithms=['HS256'],
                    options={'verify_aud': False},
                )

            raise AuthenticationFailed(f'Unsupported token algorithm: {alg or "none"}')

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired.')
        except jwt.InvalidTokenError as exc:
            raise AuthenticationFailed(f'Invalid token: {exc}')
        except AuthenticationFailed:
            raise
        except Exception as exc:  # JWKS fetch / key errors
            logger.error(f'Token verification error: {exc}')
            raise AuthenticationFailed(f'Token verification failed: {exc}')