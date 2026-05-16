"""
Analytics admin configuration.
"""

from django.contrib import admin
from .models import AnalyticsCache


@admin.register(AnalyticsCache)
class AnalyticsCacheAdmin(admin.ModelAdmin):
    list_display = ['user', 'last_updated']
    search_fields = ['user__username']
    readonly_fields = ['last_updated']
