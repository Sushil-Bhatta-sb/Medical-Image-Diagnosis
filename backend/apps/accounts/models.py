"""
User profile model for the Medical Image Diagnosis platform.
Stores user information linked to Supabase authentication.
"""

from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    Extended user profile storing Supabase-specific information and prediction stats.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    supabase_uid = models.CharField(
        max_length=255,
        unique=True,
        help_text="Supabase user ID from JWT token"
    )
    total_predictions = models.IntegerField(
        default=0,
        help_text="Total number of predictions made by this user"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'accounts_userprofile'
        ordering = ['-created_at']

    def __str__(self):
        return f"UserProfile({self.user.email})"
