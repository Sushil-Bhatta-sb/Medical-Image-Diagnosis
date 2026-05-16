"""
Serializers for the accounts app.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile with related User information.
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

    def get_email(self, obj):
        """Extract email from related User."""
        return obj.user.email

    def get_username(self, obj):
        """Extract username from related User."""
        return obj.user.username
