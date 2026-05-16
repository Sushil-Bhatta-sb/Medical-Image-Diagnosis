"""
Django configuration module for Medical Image Diagnosis platform.
"""

try:
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except ImportError:
    __all__ = ()
