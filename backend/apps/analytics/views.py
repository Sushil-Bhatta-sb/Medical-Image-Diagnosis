from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from apps.models_registry.models import MLModel
from apps.predictions.models import Prediction
import logging

logger = logging.getLogger(__name__)


class LeaderboardView(APIView):
    """Public - shows model rankings"""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        """GET /api/analytics/leaderboard/"""
        try:
            models = MLModel.objects.filter(
                is_active=True
            ).order_by('-auc_roc')
            
            data = []
            for i, model in enumerate(models, 1):
                data.append({
                    'rank': i,
                    'id': model.id,
                    'name': model.name,
                    'model_type': model.model_type,
                    'accuracy': model.accuracy,
                    'auc_roc': model.auc_roc,
                    'f1_score': model.f1_score,
                    'version': model.version,
                })
            return Response(data)
        except Exception as e:
            logger.error(f"Leaderboard error: {e}")
            return Response({'error': str(e)}, status=500)


class ModelComparisonView(APIView):
    """Public - shows model metrics side by side"""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        """GET /api/analytics/model-comparison/"""
        try:
            models = MLModel.objects.filter(is_active=True)
            data = []
            for model in models:
                data.append({
                    'id': model.id,
                    'name': model.name,
                    'model_type': model.model_type,
                    'description': model.description,
                    'accuracy': model.accuracy,
                    'auc_roc': model.auc_roc,
                    'f1_score': model.f1_score,
                })
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class UserStatsView(APIView):
    """Protected - user must be logged in"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """GET /api/analytics/user-stats/"""
        try:
            user = request.user
            total = Prediction.objects.filter(user=user).count()
            
            last_30_days = []
            for i in range(30):
                date = timezone.now().date() - timedelta(days=i)
                count = Prediction.objects.filter(
                    user=user,
                    created_at__date=date
                ).count()
                last_30_days.append({
                    'date': str(date),
                    'count': count
                })

            most_common = Prediction.objects.filter(
                user=user,
                status='COMPLETED'
            ).values('ensemble_prediction').annotate(
                count=Count('ensemble_prediction')
            ).order_by('-count').first()

            return Response({
                'total_predictions': total,
                'most_common_prediction': most_common['ensemble_prediction'] if most_common else None,
                'predictions_over_time': last_30_days,
            })
        except Exception as e:
            logger.error(f"UserStats error: {e}")
            return Response({'error': str(e)}, status=500)
