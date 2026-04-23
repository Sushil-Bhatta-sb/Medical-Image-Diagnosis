from django.db import models

class ModelVersion(models.Model):
    """ML Model version management"""
    name = models.CharField(max_length=255)
    version = models.CharField(max_length=50)
    architecture = models.CharField(max_length=255)
    framework = models.CharField(max_length=100)
    weights_path = models.FileField(upload_to='model_weights/')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        app_label = 'models_registry'

    def __str__(self):
        return f"{self.name} v{self.version}"

class ModelMetrics(models.Model):
    """Model performance metrics"""
    model = models.OneToOneField(ModelVersion, on_delete=models.CASCADE)
    accuracy = models.FloatField()
    precision = models.FloatField()
    recall = models.FloatField()
    f1_score = models.FloatField()
    roc_auc = models.FloatField()
    confusion_matrix = models.JSONField()

    class Meta:
        app_label = 'models_registry'
