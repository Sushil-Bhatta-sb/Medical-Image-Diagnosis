"""
URL routing for the analytics app.
"""

from django.urls import path
from .views import (
    LeaderboardView,
    UserStatsView,
    ModelComparisonView
)

app_name = 'analytics'

urlpatterns = [
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('user-stats/', UserStatsView.as_view(), name='user_stats'),
    path('model-comparison/', ModelComparisonView.as_view(), name='model_comparison'),
]
