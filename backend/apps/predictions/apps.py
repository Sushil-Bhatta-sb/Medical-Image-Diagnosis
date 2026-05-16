"""
App configuration for the predictions app.
"""

from django.apps import AppConfig


class PredictionsConfig(AppConfig):
    """Configuration class for the predictions app."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.predictions'
    verbose_name = 'Predictions'
