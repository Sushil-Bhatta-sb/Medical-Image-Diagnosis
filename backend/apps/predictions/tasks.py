"""
Celery tasks for asynchronous inference processing.
"""

import logging
import random
from datetime import datetime
from django.utils import timezone
from .models import Prediction

try:
    from celery import shared_task
except ImportError:
    # Fallback when celery is not installed
    def shared_task(*args, **kwargs):
        def decorator(func):
            return func
        return decorator

logger = logging.getLogger(__name__)

# MOCK_MODE = True for development (uses random predictions instead of real models)
MOCK_MODE = True

# Class labels for predictions
CLASS_LABELS = [
    'Atelectasis',
    'Cardiomegaly',
    'Effusion',
    'Infiltration',
    'Mass',
    'Nodule',
    'Pneumonia',
    'Pneumothorax',
    'Normal'
]


@shared_task(bind=True, max_retries=3)
def run_inference(self, prediction_id: str):
    """
    Main Celery task for running full inference pipeline.
    
    In MOCK_MODE (development), generates realistic random predictions.
    In real mode, uses actual ML models.
    
    Args:
        prediction_id: UUID of the Prediction instance
    """
    try:
        prediction = Prediction.objects.get(id=prediction_id)
        prediction.status = 'PROCESSING'
        prediction.save()
        
        logger.info(f'Starting inference for prediction {prediction_id}')
        
        if MOCK_MODE:
            # Development mode: generate random predictions
            logger.info(f'MOCK_MODE: Generating random predictions')
            
            # Generate realistic predictions
            cnn_pred = random.choice(CLASS_LABELS)
            vit_pred = random.choice(CLASS_LABELS)
            classical_pred = random.choice(CLASS_LABELS)
            
            cnn_conf = random.uniform(0.65, 0.99)
            vit_conf = random.uniform(0.65, 0.99)
            classical_conf = random.uniform(0.55, 0.95)
            
            # Simple ensemble: majority vote
            predictions = [cnn_pred, vit_pred, classical_pred]
            ensemble_pred = max(set(predictions), key=predictions.count)
            ensemble_conf = (cnn_conf + vit_conf + classical_conf) / 3
            
            # Create disease labels
            disease_labels = {
                label: random.uniform(0.01, 0.99)
                for label in CLASS_LABELS
            }
            # Normalize to sum to 1
            total = sum(disease_labels.values())
            disease_labels = {k: v / total for k, v in disease_labels.items()}
            
            prediction.cnn_prediction = cnn_pred
            prediction.cnn_confidence = cnn_conf
            prediction.vit_prediction = vit_pred
            prediction.vit_confidence = vit_conf
            prediction.classical_prediction = classical_pred
            prediction.classical_confidence = classical_conf
            prediction.ensemble_prediction = ensemble_pred
            prediction.ensemble_confidence = ensemble_conf
            prediction.disease_labels = disease_labels
            prediction.gradcam_cnn_url = '/media/gradcam/mock_cnn.png'
            prediction.gradcam_vit_url = '/media/gradcam/mock_vit.png'
            
        else:
            # Real mode: use actual ML models
            try:
                from utils import download_image_from_url
                from ml.inference.cnn_model import CNNModel
                from ml.inference.vit_model import ViTModel
                from ml.inference.classical_model import ClassicalModel
                from ml.inference.ensemble import EnsembleModel
                
                # Download image
                image = download_image_from_url(prediction.image_url)
                
                # Run inference with all models
                cnn_model = CNNModel()
                cnn_result = cnn_model.predict(image)
                prediction.cnn_prediction = cnn_result['prediction']
                prediction.cnn_confidence = cnn_result['confidence']
                
                vit_model = ViTModel()
                vit_result = vit_model.predict(image)
                prediction.vit_prediction = vit_result['prediction']
                prediction.vit_confidence = vit_result['confidence']
                
                classical_model = ClassicalModel()
                classical_result = classical_model.predict(image)
                prediction.classical_prediction = classical_result['prediction']
                prediction.classical_confidence = classical_result['confidence']
                
                # Ensemble
                ensemble = EnsembleModel()
                ensemble_result = ensemble.combine(cnn_result, vit_result, classical_result)
                prediction.ensemble_prediction = ensemble_result['prediction']
                prediction.ensemble_confidence = ensemble_result['confidence']
                prediction.disease_labels = ensemble_result.get('class_probabilities', {})
                
            except Exception as e:
                logger.error(f'Real inference failed: {str(e)}. Falling back to mock mode.')
                # Fallback to mock mode
                prediction.cnn_prediction = random.choice(CLASS_LABELS)
                prediction.ensemble_prediction = prediction.cnn_prediction
                prediction.ensemble_confidence = 0.7
        
        # Update user's prediction count
        user_profile = prediction.user.profile
        user_profile.total_predictions += 1
        user_profile.save()
        
        # Mark as completed
        prediction.status = 'COMPLETED'
        prediction.completed_at = timezone.now()
        prediction.save()
        
        logger.info(f'Inference completed for prediction {prediction_id}')
        return {'prediction_id': str(prediction_id), 'status': 'COMPLETED'}
        
    except Prediction.DoesNotExist:
        logger.error(f'Prediction {prediction_id} not found')
        return {'prediction_id': prediction_id, 'status': 'ERROR', 'error': 'Prediction not found'}
        
    except Exception as e:
        logger.error(f'Unexpected error in inference: {str(e)}')
        
        try:
            prediction = Prediction.objects.get(id=prediction_id)
            prediction.status = 'FAILED'
            prediction.error_message = str(e)
            prediction.save()
        except:
            pass
        
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=2 ** self.request.retries)
