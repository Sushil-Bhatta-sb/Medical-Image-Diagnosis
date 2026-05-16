"""
Analytics models (typically use existing Prediction and MLModel models).
"""
from django.db import models


class AnalyticsCache(models.Model):
    """Cache for computed analytics."""
    
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, null=True)
    cached_data = models.JSONField(default=dict)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Analytics Cache'
    
    def __str__(self):
        return f"Analytics cache for {self.user or 'global'}"
