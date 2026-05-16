# Django Backend - Medical Image Diagnosis

Complete Django REST Framework backend for the Medical Image Diagnosis platform.

## Project Structure

```
backend/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variables template
├── setup.ps1                 # PowerShell setup script
├── config/                   # Django configuration
│   ├── settings/
│   │   ├── base.py          # Base settings (shared)
│   │   ├── development.py   # Development-specific settings
│   │   └── __init__.py
│   ├── celery.py            # Celery configuration
│   ├── asgi.py              # ASGI configuration
│   ├── wsgi.py              # WSGI configuration
│   ├── urls.py              # Main URL routing
│   └── __init__.py
├── apps/                     # Django applications
│   ├── accounts/            # User authentication and profiles
│   ├── predictions/         # Prediction management
│   ├── models_registry/     # ML model versioning
│   ├── analytics/           # Analytics and reporting
│   └── __init__.py
├── ml/                       # Machine learning modules
│   ├── inference/           # Model inference
│   │   ├── base_model.py    # Abstract base class
│   │   ├── cnn_model.py     # ResNet-50 CNN
│   │   ├── vit_model.py     # Vision Transformer
│   │   ├── classical_model.py # SVM/XGBoost
│   │   └── ensemble.py      # Ensemble combining
│   ├── preprocessing/       # Feature extraction
│   │   ├── image_transforms.py
│   │   └── feature_extractor.py
│   ├── explainability/      # Model explanations
│   │   ├── gradcam.py       # Grad-CAM visualization
│   │   └── feature_importance.py
│   └── __init__.py
├── training/                 # Model training scripts
│   ├── train_cnn.py         # CNN training
│   ├── train_vit.py         # ViT training
│   ├── train_classical.py   # Classical ML training
│   ├── evaluate_models.py   # Model evaluation
│   ├── configs/             # Training configurations
│   │   ├── cnn_config.yaml
│   │   ├── vit_config.yaml
│   │   └── classical_config.yaml
│   ├── notebooks/           # Jupyter notebooks
│   └── __init__.py
├── weights/                 # ML model weights
├── media/                   # User uploads and outputs
├── logs/                    # Application logs
└── README.md
```

## Key Features

### 1. **Multi-Model Inference**
- **CNN (ResNet-50)**: Efficient convolutional neural network
- **Vision Transformer (ViT)**: Transformer-based vision model
- **Classical ML**: SVM and XGBoost with hand-crafted features
- **Ensemble**: Majority voting + confidence averaging

### 2. **Async Processing**
- Celery + Redis for background inference tasks
- Status tracking: PENDING → PROCESSING → COMPLETED/FAILED
- Retry logic with exponential backoff

### 3. **Authentication**
- Supabase JWT authentication
- User profiles with prediction tracking
- API key support via REST framework

### 4. **Model Management**
- Version tracking of all models
- Metrics storage (accuracy, AUC-ROC, F1-score)
- Active/inactive model switching

### 5. **Analytics & Reporting**
- User prediction history and statistics
- Model comparison and leaderboard
- Agreement rate tracking across ensembles

### 6. **Explainability**
- Grad-CAM heatmaps for CNN/ViT
- Feature importance for classical models
- SHAP integration (optional)

## Setup Instructions

### Prerequisites
- Python 3.9+
- PostgreSQL (or SQLite for development)
- Redis (for Celery)
- CUDA compatible GPU (optional, but recommended for deep learning)

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Minimum required:
# - DATABASE credentials (PostgreSQL)
# - SUPABASE_URL, SUPABASE_KEY, SUPABASE_JWT_SECRET
# - SECRET_KEY (generate a random string)
# - REDIS_URL (if using Celery)
```

### Step 3: Database Setup

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### Step 4: Run Development Server

```bash
# Terminal 1: Django development server
python manage.py runserver

# Terminal 2: Celery worker (for async tasks)
celery -A config worker -l info

# Terminal 3: Celery beat (optional, for scheduled tasks)
celery -A config beat -l info

# Terminal 4: Redis (if not running as a service)
redis-server
```

The API will be available at: `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile

### Predictions
- `POST /api/predictions/` - Create new prediction
- `GET /api/predictions/<id>/` - Get prediction by ID
- `GET /api/predictions/` - List user predictions (paginated)

### Models Registry
- `GET /api/models/` - List all active models
- `GET /api/models/<id>/` - Get model details with metrics

### Analytics
- `GET /api/analytics/leaderboard/` - Model performance leaderboard
- `GET /api/analytics/user-stats/` - User prediction statistics
- `GET /api/analytics/model-comparison/` - Compare models side-by-side

## Model Training

### Training CNN (ResNet-50)

```bash
python training/train_cnn.py --config training/configs/cnn_config.yaml
```

**Configuration file**: `training/configs/cnn_config.yaml`
- Learning rate: 0.001
- Batch size: 32
- Epochs: 50 (with early stopping)
- Output weights: `weights/resnet50_best.pth`

### Training ViT

```bash
python training/train_vit.py --config training/configs/vit_config.yaml
```

**Configuration file**: `training/configs/vit_config.yaml`
- Learning rate: 0.0005
- Batch size: 16
- Epochs: 40
- Model: google/vit-base-patch16-224
- Output weights: `weights/vit_best.pth`

### Training Classical ML

```bash
python training/train_classical.py --config training/configs/classical_config.yaml
```

**Configuration file**: `training/configs/classical_config.yaml`
- Models: SVM (RBF kernel) vs XGBoost
- Features: HOG + LBP
- Best model saved: `weights/svm_pipeline.pkl`

### Evaluate Models

```bash
python training/evaluate_models.py --dataset data/chest_xray/test --weights weights/resnet50_best.pth
```

## Development Mode

The backend includes `MOCK_MODE=True` by default for development:

- Predictions are generated without actual ML models
- No GPU required
- Realistic mock values: confidence 0.55-0.99
- All predictions complete instantly

To use actual models, set `MOCK_MODE=False` in `.env` and ensure weights are available.

## Database Models

### Accounts
- `User`: Django default user model
- `UserProfile`: Extended user profile (Supabase UID, total predictions)

### Predictions
- `Prediction`: UUID, image URL, status, CNN/ViT/Classical predictions, ensemble result, Grad-CAM URLs, disease labels

### Models Registry
- `MLModel`: Model metadata (name, type, version, metrics)
- `ModelMetrics`: Per-epoch training metrics

### Analytics
- Built-in admin interface for tracking

## Celery Tasks

### `run_inference`
Async task that:
1. Downloads image from URL
2. Runs all 3 models (CNN, ViT, Classical)
3. Computes ensemble prediction
4. Generates Grad-CAM visualizations
5. Stores results in database
6. Updates user statistics

**Retries**: Up to 3 times with exponential backoff

## Security

- JWT authentication with Supabase
- CORS configured for localhost:3000 (frontend) and localhost:5173 (Vite)
- Environment variables for sensitive data
- CSRF protection enabled
- SQL injection prevention via ORM

## Troubleshooting

### Models Not Loading
Ensure weights files exist in `weights/` directory or set `MOCK_MODE=True`

### Celery Not Working
- Check Redis is running: `redis-cli ping`
- Verify `REDIS_URL` in `.env`
- Check Celery logs: `celery -A config worker -l debug`

### Database Connection Errors
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Run migrations: `python manage.py migrate`

### CORS Issues
- Update `CORS_ALLOWED_ORIGINS` in `.env.example` and `.env`
- Restart Django development server

## Performance Optimization

### For Production
1. Use Gunicorn instead of Django dev server
2. Use Nginx as reverse proxy
3. Enable Redis caching
4. Use Postgres connection pooling
5. Set up Celery result backend
6. Enable model quantization/distillation

### Model Inference Optimization
- Batch processing for multiple predictions
- Model weight caching
- GPU memory optimization
- Feature extraction caching

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Celery Documentation](https://docs.celeryproject.io/)
- [PyTorch Docs](https://pytorch.org/docs/)
- [Transformers](https://huggingface.co/transformers/)
