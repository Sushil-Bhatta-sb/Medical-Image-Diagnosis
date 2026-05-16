"""
App configuration for the models_registry app.
"""

from django.apps import AppConfig


class ModelsRegistryConfig(AppConfig):
    """Configuration class for the models_registry app."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.models_registry'
    verbose_name = 'Models Registry'
