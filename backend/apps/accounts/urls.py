from django.urls import path
from .views import ProfileView, HealthCheckView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('health/', HealthCheckView.as_view(), name='health'),
]
