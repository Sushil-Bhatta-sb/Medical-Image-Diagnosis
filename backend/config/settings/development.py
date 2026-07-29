"""
Development settings for Medical Image Diagnosis project.
"""

import os

from .base import *

DEBUG = True
ALLOWED_HOSTS = ['*']

# Development database.
# By default we use a local SQLite database so the backend can run without a
# reachable remote Postgres instance. Set USE_SQLITE=False in the environment
# to use the PostgreSQL configuration defined in base.py (e.g. Supabase).
USE_SQLITE = os.getenv('USE_SQLITE', 'True') == 'True'

if USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Simplified CORS for development
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]
