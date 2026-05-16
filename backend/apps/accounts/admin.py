"""
Django admin configuration for accounts app.
"""

from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin interface for UserProfile model."""
    list_display = ['user', 'supabase_uid', 'total_predictions', 'created_at']
    search_fields = ['user__email', 'supabase_uid']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User Info', {'fields': ['user', 'supabase_uid']}),
        ('Statistics', {'fields': ['total_predictions']}),
        ('Timestamps', {'fields': ['created_at', 'updated_at'], 'classes': ['collapse']}),
    )
