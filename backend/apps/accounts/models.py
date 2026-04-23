from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """User profile linked to Supabase UID"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    supabase_uid = models.CharField(max_length=255, unique=True)
    organization = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=50, default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'accounts'

    def __str__(self):
        return f"{self.user.username} - {self.supabase_uid}"
