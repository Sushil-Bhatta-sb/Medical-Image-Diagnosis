"""
URL routing for the predictions app.
"""

from django.urls import path
from .views import (
    PredictionCreateView,
    PredictionDetailView,
    PredictionHistoryView
)

app_name = 'predictions'

urlpatterns = [
    path('', PredictionCreateView.as_view(), name='create'),
    path('<uuid:id>/', PredictionDetailView.as_view(), name='detail'),
    path('history/', PredictionHistoryView.as_view(), name='history'),
]
