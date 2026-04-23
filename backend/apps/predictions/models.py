from django.db import models
from django.contrib.auth.models import User

class Prediction(models.Model):
    """Prediction results from models"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='predictions/')
    model_name = models.CharField(max_length=255)
    confidence = models.FloatField()
    prediction = models.CharField(max_length=255)
    gradcam_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'predictions'

    def __str__(self):
        return f"{self.model_name} - {self.prediction}"

class ModelRun(models.Model):
    """Model inference run logs"""
    prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE)
    inference_time = models.FloatField()
    gpu_memory = models.FloatField(null=True)

    class Meta:
        app_label = 'predictions'

class AuditLog(models.Model):
    """Audit trail for all predictions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'predictions'
