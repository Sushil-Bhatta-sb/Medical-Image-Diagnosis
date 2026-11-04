"""
URL routing for the predictions app.
"""

from django.urls import path
from .views import (
    ImageUploadView,
    PredictionCreateView,
    PredictionDetailView,
    PredictionHistoryView
)

app_name = 'predictions'

urlpatterns = [
    path('', PredictionCreateView.as_view(), name='create'),
    path('upload/', ImageUploadView.as_view(), name='upload'),
    path('<uuid:id>/', PredictionDetailView.as_view(), name='detail'),
    path('history/', PredictionHistoryView.as_view(), name='history'),
]
