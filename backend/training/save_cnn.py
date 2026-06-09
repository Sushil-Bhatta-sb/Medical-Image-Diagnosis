import torch
import torchvision.models as models
import os

WEIGHTS_PATH = r"D:\Medical-Image-Diagnosis\backend\weights"
NUM_CLASSES = 2

print("Loading ResNet-50 with pretrained ImageNet weights...")
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)

# Replace final layer same as training script
import torch.nn as nn
num_features = model.fc.in_features
model.fc = nn.Sequential(
    nn.Linear(num_features, 512),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(512, NUM_CLASSES)
)

save_path = os.path.join(WEIGHTS_PATH, "resnet50_best.pth")
torch.save(model.state_dict(), save_path)
print(f"Saved to: {save_path}")
print("Done!")