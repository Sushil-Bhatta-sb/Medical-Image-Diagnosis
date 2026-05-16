"""
Django configuration module for Medical Image Diagnosis platform.
"""

from .celery import app as celery_app

__all__ = ('celery_app',)
