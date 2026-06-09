import logging
import random
from django.utils import timezone

logger = logging.getLogger(__name__)

MOCK_MODE =False

CLASS_LABELS = ['NORMAL', 'PNEUMONIA']


def run_inference(prediction_id):
    """
    Run inference synchronously - no Celery needed.
    MOCK_MODE=True uses random predictions for development.
    """
    try:
        from .models import Prediction

        prediction = Prediction.objects.get(id=prediction_id)
        prediction.status = 'PROCESSING'
        prediction.save()

        logger.info(f'Starting inference for {prediction_id}')

        if MOCK_MODE:
            cnn_pred = random.choice(CLASS_LABELS)
            vit_pred = random.choice(CLASS_LABELS)
            classical_pred = random.choice(CLASS_LABELS)

            cnn_conf = round(random.uniform(0.65, 0.99), 4)
            vit_conf = round(random.uniform(0.65, 0.99), 4)
            classical_conf = round(random.uniform(0.55, 0.95), 4)

            labels = [cnn_pred, vit_pred, classical_pred]
            ensemble_pred = max(set(labels), key=labels.count)
            ensemble_conf = round((cnn_conf + vit_conf + classical_conf) / 3, 4)

            disease_labels = {
                label: round(random.uniform(0.01, 0.3), 4)
                for label in CLASS_LABELS
            }
            disease_labels[ensemble_pred] = ensemble_conf

            prediction.cnn_prediction = cnn_pred
            prediction.cnn_confidence = cnn_conf
            prediction.vit_prediction = vit_pred
            prediction.vit_confidence = vit_conf
            prediction.classical_prediction = classical_pred
            prediction.classical_confidence = classical_conf
            prediction.ensemble_prediction = ensemble_pred
            prediction.ensemble_confidence = ensemble_conf
            prediction.disease_labels = disease_labels
            prediction.status = 'COMPLETED'
            prediction.completed_at = timezone.now()

        # Update user prediction count
        try:
            profile = prediction.user.userprofile
            profile.total_predictions += 1
            profile.save()
        except Exception as e:
            logger.warning(f'Could not update profile: {e}')

        prediction.save()
        logger.info(f'Inference completed for {prediction_id}')
        return prediction

    except Exception as e:
        logger.error(f'Inference failed for {prediction_id}: {e}')
        try:
            from .models import Prediction
            p = Prediction.objects.get(id=prediction_id)
            p.status = 'FAILED'
            p.error_message = str(e)
            p.save()
        except Exception:
            pass