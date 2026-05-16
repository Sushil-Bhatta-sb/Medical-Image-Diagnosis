"""
Serializers for the accounts app.
Handles user profile serialization for API responses.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializes UserProfile model with related user information.
    """
    email = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'user',
            'email',
            'username',
            'supabase_uid',
            'total_predictions',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'supabase_uid',
            'total_predictions',
            'created_at',
            'updated_at'
        ]

    def get_email(self, obj: UserProfile) -> str:
        """Extract email from related User."""
        return obj.user.email

    def get_username(self, obj: UserProfile) -> str:
        """Extract username from related User."""
        return obj.user.username
