"""
URL routing for the accounts app.
"""

from django.urls import path
from .views import ProfileView

app_name = 'accounts'

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
]
