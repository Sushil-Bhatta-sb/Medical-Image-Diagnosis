"""
Celery tasks for asynchronous inference processing.
Handles model inference, ensemble logic, and explainability generation.
"""

from celery import shared_task
from django.utils import timezone
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
import logging
from io import BytesIO

from .models import Prediction
from .utils import download_image_from_url, save_gradcam_overlay
from ml.inference.cnn_model import CNNModel
from ml.inference.vit_model import ViTModel
from ml.inference.classical_model import ClassicalModel
from ml.inference.ensemble import EnsembleModel
from ml.explainability.gradcam import GradCAM

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def run_inference(self, prediction_id: str) -> dict:
    """
    Main Celery task for running full inference pipeline.
    
    Orchestrates:
    1. Image download
    2. Individual model inferences
    3. Ensemble prediction
    4. Grad-CAM generation
    5. Results storage
    
    Args:
        prediction_id: UUID of the Prediction instance
        
    Returns:
        Dictionary with prediction ID and status
    """
    try:
        prediction = Prediction.objects.get(id=prediction_id)
        prediction.status = 'PROCESSING'
        prediction.save()
        
        logger.info(f"Starting inference for prediction {prediction_id}")
        
        # Download image
        try:
            image = download_image_from_url(prediction.image_url)
        except Exception as e:
            logger.error(f"Image download failed: {str(e)}")
            prediction.status = 'FAILED'
            prediction.error_message = f"Image download failed: {str(e)}"
            prediction.save()
            return {'prediction_id': prediction_id, 'status': 'FAILED'}
        
        # Run individual model inferences
        try:
            cnn_model = CNNModel()
            cnn_result = cnn_model.predict(image)
            prediction.cnn_prediction = cnn_result['prediction']
            prediction.cnn_confidence = cnn_result['confidence']
        except Exception as e:
            logger.error(f"CNN inference failed: {str(e)}")
            prediction.cnn_prediction = None
            prediction.cnn_confidence = None
        
        try:
            vit_model = ViTModel()
            vit_result = vit_model.predict(image)
            prediction.vit_prediction = vit_result['prediction']
            prediction.vit_confidence = vit_result['confidence']
        except Exception as e:
            logger.error(f"ViT inference failed: {str(e)}")
            prediction.vit_prediction = None
            prediction.vit_confidence = None
        
        try:
            classical_model = ClassicalModel()
            classical_result = classical_model.predict(image)
            prediction.classical_prediction = classical_result['prediction']
            prediction.classical_confidence = classical_result['confidence']
        except Exception as e:
            logger.error(f"Classical ML inference failed: {str(e)}")
            prediction.classical_prediction = None
            prediction.classical_confidence = None
        
        # Generate ensemble prediction
        try:
            results = [
                cnn_result if 'cnn_result' in locals() else None,
                vit_result if 'vit_result' in locals() else None,
                classical_result if 'classical_result' in locals() else None,
            ]
            results = [r for r in results if r is not None]
            
            if results:
                ensemble = EnsembleModel()
                ensemble_result = ensemble.aggregate_predictions(results)
                prediction.ensemble_prediction = ensemble_result['prediction']
                prediction.ensemble_confidence = ensemble_result['confidence']
                prediction.disease_labels = ensemble_result.get('class_probabilities')
        except Exception as e:
            logger.error(f"Ensemble aggregation failed: {str(e)}")
        
        # Generate Grad-CAM visualizations
        try:
            gradcam = GradCAM()
            
            # CNN Grad-CAM
            if 'cnn_model' in locals():
                try:
                    cnn_heatmap = gradcam.generate(
                        cnn_model,
                        image,
                        prediction.cnn_prediction
                    )
                    prediction.gradcam_cnn_url = save_gradcam_overlay(
                        image,
                        cnn_heatmap,
                        f"cnn_{prediction_id}"
                    )
                except Exception as e:
                    logger.warning(f"CNN Grad-CAM generation failed: {str(e)}")
            
            # ViT Grad-CAM
            if 'vit_model' in locals():
                try:
                    vit_heatmap = gradcam.generate(
                        vit_model,
                        image,
                        prediction.vit_prediction
                    )
                    prediction.gradcam_vit_url = save_gradcam_overlay(
                        image,
                        vit_heatmap,
                        f"vit_{prediction_id}"
                    )
                except Exception as e:
                    logger.warning(f"ViT Grad-CAM generation failed: {str(e)}")
        except Exception as e:
            logger.warning(f"Grad-CAM pipeline failed: {str(e)}")
        
        # Update user's prediction count
        user_profile = prediction.user.profile
        user_profile.total_predictions += 1
        user_profile.save()
        
        # Mark as completed
        prediction.status = 'COMPLETED'
        prediction.completed_at = timezone.now()
        prediction.save()
        
        logger.info(f"Inference completed for prediction {prediction_id}")
        return {'prediction_id': prediction_id, 'status': 'COMPLETED'}
        
    except Prediction.DoesNotExist:
        logger.error(f"Prediction {prediction_id} not found")
        return {'prediction_id': prediction_id, 'status': 'ERROR', 'error': 'Prediction not found'}
        
    except Exception as e:
        logger.error(f"Unexpected error in inference: {str(e)}")
        
        try:
            prediction = Prediction.objects.get(id=prediction_id)
            prediction.status = 'FAILED'
            prediction.error_message = f"Inference pipeline error: {str(e)}"
            prediction.save()
        except:
            pass
        
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=2 ** self.request.retries)
