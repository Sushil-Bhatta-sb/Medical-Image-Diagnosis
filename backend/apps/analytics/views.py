"""
API views for the analytics app.
Provides leaderboards, user statistics, and model comparison endpoints.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta

from apps.models_registry.models import MLModel
from apps.models_registry.serializers import MLModelSerializer
from apps.predictions.models import Prediction


class LeaderboardView(APIView):
    """
    Retrieve ML models ranked by performance metrics.
    
    GET /api/analytics/leaderboard/ - Returns models ranked by AUC-ROC
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get all ML models ranked by AUC-ROC score.
        
        Args:
            request: HTTP request
            
        Returns:
            Response with ranked MLModels
        """
        models = MLModel.objects.all().order_by('-auc_roc')
        serializer = MLModelSerializer(models, many=True)
        
        return Response({
            'count': len(models),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class UserStatsView(APIView):
    """
    Retrieve statistics about the current user's prediction activity.
    
    GET /api/analytics/user-stats/ - Returns user's prediction statistics
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get aggregated statistics for the current user.
        
        Args:
            request: HTTP request
            
        Returns:
            Response with user statistics
        """
        user = request.user
        completed_predictions = Prediction.objects.filter(
            user=user,
            status='COMPLETED'
        )
        
        # Total predictions
        total_predictions = user.profile.total_predictions
        
        # Model agreement rate
        agreement_count = 0
        for pred in completed_predictions:
            predictions = [
                pred.cnn_prediction,
                pred.vit_prediction,
                pred.classical_prediction
            ]
            if len(set(predictions)) == 1:
                agreement_count += 1
        
        agreement_rate = (
            agreement_count / len(completed_predictions)
            if completed_predictions.exists()
            else 0.0
        )
        
        # Most common prediction
        most_common = None
        if completed_predictions.exists():
            ensemble_preds = completed_predictions.values_list(
                'ensemble_prediction',
                flat=True
            ).exclude(ensemble_prediction__isnull=True)
            if ensemble_preds:
                most_common = max(
                    set(ensemble_preds),
                    key=list(ensemble_preds).count
                )
        
        # Predictions over last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_count = completed_predictions.filter(
            created_at__gte=thirty_days_ago
        ).count()
        
        return Response({
            'total_predictions': total_predictions,
            'model_agreement_rate': round(agreement_rate, 3),
            'most_common_prediction': most_common,
            'predictions_last_30_days': recent_count,
        }, status=status.HTTP_200_OK)


class ModelComparisonView(APIView):
    """
    Compare performance metrics across all ML models.
    
    GET /api/analytics/model-comparison/ - Returns side-by-side metrics
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get comparison metrics for all models.
        
        Args:
            request: HTTP request
            
        Returns:
            Response with model comparison data
        """
        models = MLModel.objects.all()
        
        comparison_data = []
        for model in models:
            comparison_data.append({
                'id': model.id,
                'name': model.name,
                'model_type': model.get_model_type_display(),
                'version': model.version,
                'accuracy': model.accuracy,
                'auc_roc': model.auc_roc,
                'f1_score': model.f1_score,
                'is_active': model.is_active,
            })
        
        # Sort by AUC-ROC
        comparison_data.sort(key=lambda x: x['auc_roc'], reverse=True)
        
        return Response({
            'count': len(comparison_data),
            'results': comparison_data
        }, status=status.HTTP_200_OK)
