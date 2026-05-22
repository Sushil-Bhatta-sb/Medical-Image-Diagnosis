import os
import django
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path('.') / '.env')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.models_registry.models import MLModel

# Clear existing
MLModel.objects.all().delete()
print("Cleared existing models")

# Create new
MLModel.objects.create(
    name="ResNet-50 CNN",
    model_type="CNN",
    version="1.0",
    description="ResNet-50 fine-tuned on chest X-rays",
    accuracy=0.87,
    auc_roc=0.91,
    f1_score=0.85,
    is_active=True
)

MLModel.objects.create(
    name="ViT Base",
    model_type="VIT",
    version="1.0",
    description="Vision Transformer fine-tuned on chest X-rays",
    accuracy=0.89,
    auc_roc=0.93,
    f1_score=0.88,
    is_active=True
)

MLModel.objects.create(
    name="SVM Classical",
    model_type="CLASSICAL",
    version="1.0",
    description="SVM with HOG+LBP features",
    accuracy=0.79,
    auc_roc=0.83,
    f1_score=0.77,
    is_active=True
)

print("Done!", MLModel.objects.count(), "models created successfully!")