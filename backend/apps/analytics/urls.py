"""
Analytics URL routing.
"""

from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),
    path('user-stats/', views.UserStatsView.as_view(), name='user_stats'),
    path('model-comparison/', views.ModelComparisonView.as_view(), name='model_comparison'),
]
