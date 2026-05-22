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
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user statistics."""
        user = request.user
        profile = user.userprofile
        
        # Total predictions
        total_predictions = Prediction.objects.filter(user=user).count()
        
        # Predictions in last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_predictions = Prediction.objects.filter(
            user=user,
            created_at__gte=thirty_days_ago
        ).count()
        
        # Most common prediction
        predictions = Prediction.objects.filter(
            user=user,
            ensemble_prediction__isnull=False
        ).values('ensemble_prediction').annotate(count=Count('id')).order_by('-count')
        
        most_common = None
        if predictions:
            most_common = predictions[0]['ensemble_prediction']
        
        # Model agreement rate
        completed_predictions = Prediction.objects.filter(
            user=user,
            status='COMPLETED'
        )
        
        agreement_rates = []
        for pred in completed_predictions:
            predictions_list = [
                pred.cnn_prediction,
                pred.vit_prediction,
                pred.classical_prediction
            ]
            predictions_list = [p for p in predictions_list if p]
            
            if predictions_list:
                # Check if all agree with ensemble
                agreement = sum(1 for p in predictions_list if p == pred.ensemble_prediction)
                rate = agreement / len(predictions_list) if predictions_list else 0
                agreement_rates.append(rate)
        
        avg_agreement = sum(agreement_rates) / len(agreement_rates) if agreement_rates else 0
        
        return Response({
            'total_predictions': total_predictions,
            'predictions_last_30_days': recent_predictions,
            'most_common_prediction': most_common,
            'model_agreement_rate': round(avg_agreement, 3),
            'profile': {
                'total_predictions_tracked': profile.total_predictions,
                'created_at': profile.created_at
            }
        })


class ModelComparisonView(APIView):
    """
    Side-by-side model comparison.
    GET /api/analytics/model-comparison/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get model comparison data."""
        models = MLModel.objects.filter(is_active=True).order_by('-auc_roc')
        
        comparison = []
        for model in models:
            comparison.append({
                'id': model.id,
                'name': model.name,
                'model_type': model.model_type,
                'version': model.version,
                'accuracy': float(model.accuracy or 0),
                'auc_roc': float(model.auc_roc or 0),
                'f1_score': float(model.f1_score or 0),
                'is_active': model.is_active,
                'created_at': model.created_at
            })
        
        return Response({
            'count': len(comparison),
            'results': comparison
        })
