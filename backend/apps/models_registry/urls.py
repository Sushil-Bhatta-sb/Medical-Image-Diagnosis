"""
URL routing for the models_registry app.
"""

from django.urls import path
from .views import MLModelListView, MLModelDetailView

app_name = 'models_registry'

urlpatterns = [
    path('', MLModelListView.as_view(), name='list'),
    path('<int:id>/', MLModelDetailView.as_view(), name='detail'),
]
