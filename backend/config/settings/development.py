"""
Development settings for Medical Image Diagnosis project.
"""

from .base import *

DEBUG = True
ALLOWED_HOSTS = ['*']

# Development database can be SQLite or PostgreSQL
# Uncomment to use SQLite for development:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

# Simplified CORS for development
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]
