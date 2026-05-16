"""
Django admin configuration for models_registry app.
"""

from django.contrib import admin
from .models import MLModel, ModelMetrics


class ModelMetricsInline(admin.TabularInline):
    """Inline admin for ModelMetrics."""
    model = ModelMetrics
    extra = 0
    readonly_fields = ['recorded_at']


@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    """Admin interface for MLModel."""
    list_display = ['name', 'model_type', 'version', 'auc_roc', 'is_active', 'created_at']
    list_filter = ['model_type', 'is_active', 'created_at']
    search_fields = ['name', 'version']
    inlines = [ModelMetricsInline]
    fieldsets = (
        ('Model Info', {'fields': ['name', 'model_type', 'version', 'description']}),
        ('Metrics', {'fields': ['accuracy', 'auc_roc', 'f1_score']}),
        ('Status', {'fields': ['is_active']}),
        ('Timestamps', {'fields': ['created_at', 'updated_at'], 'classes': ['collapse']}),
    )


@admin.register(ModelMetrics)
class ModelMetricsAdmin(admin.ModelAdmin):
    """Admin interface for ModelMetrics."""
    list_display = ['model', 'epoch', 'train_loss', 'val_loss', 'val_accuracy']
    list_filter = ['model', 'epoch']
    search_fields = ['model__name']
    readonly_fields = ['recorded_at']
