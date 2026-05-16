# Complete Setup Guide - Medical Image Diagnosis Backend

## EXACT POWERSHELL COMMANDS TO RUN IN ORDER

### Phase 1: Environment Setup

```powershell
# 1. Navigate to backend directory
cd D:\Medical-Image-Diagnosis\backend

# 2. Create Python virtual environment (recommended)
python -m venv venv

# 3. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 4. Upgrade pip, setuptools, wheel
python -m pip install --upgrade pip setuptools wheel
```

### Phase 2: Install Dependencies

```powershell
# 5. Install all required packages
pip install -r requirements.txt

# This will install:
# - Django 4.2.7
# - Django REST Framework 3.14.0
# - PyTorch 2.1.1 (large download ~2GB)
# - Transformers 4.35.2
# - Celery, Redis
# - And all other dependencies

# Note: If you don't have GPU, PyTorch CPU version will be installed
# For GPU support, after install run: pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Phase 3: Configure Environment

```powershell
# 6. Copy environment template
Copy-Item .env.example .env

# 7. Edit .env file with your configuration
notepad .env

# CRITICAL settings to update in .env:
# - DEBUG=True (for development)
# - SECRET_KEY=generate-random-secret-key
# - DB_NAME=medical_db
# - DB_USER=postgres
# - DB_PASSWORD=your_password
# - DB_HOST=localhost
# - DB_PORT=5432
# - SUPABASE_URL=your_supabase_url
# - SUPABASE_KEY=your_supabase_key
# - SUPABASE_JWT_SECRET=your_jwt_secret
# - REDIS_URL=redis://localhost:6379/0
# - MOCK_MODE=True (to start without ML models)
```

### Phase 4: Database Setup

```powershell
# 8. Create database migrations
python manage.py makemigrations

# 9. Apply migrations to database
python manage.py migrate

# 10. Create superuser (optional - for admin panel)
python manage.py createsuperuser
# Follow prompts to create admin user
```

### Phase 5: Run Development Servers

**Open 4 separate PowerShell windows:**

**Window 1: Django Development Server**
```powershell
cd D:\Medical-Image-Diagnosis\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# Output should show:
# Starting development server at http://127.0.0.1:8000/
# Quit the server with CTRL-BREAK.
```

**Window 2: Celery Worker (for async tasks)**
```powershell
cd D:\Medical-Image-Diagnosis\backend
.\venv\Scripts\Activate.ps1
celery -A config worker -l info

# Output should show:
# ---------- celery@HOSTNAME v5.3.4 (...)
# [Tasks]
#   . config.celery.debug_task
#   . apps.predictions.tasks.run_inference
```

**Window 3: Redis Server (if not installed as service)**
```powershell
# If Redis is installed via Chocolatey or as a service, it should already be running
# To start Redis (if installed):
redis-server

# Or check if Redis is running:
redis-cli ping
# Should return: PONG
```

**Window 4: Optional - Celery Beat (for scheduled tasks)**
```powershell
cd D:\Medical-Image-Diagnosis\backend
.\venv\Scripts\Activate.ps1
celery -A config beat -l info

# Output should show:
# Starting beat scheduler...
```

### Phase 6: Verify Setup

```powershell
# Test API endpoints:

# 1. Check API is running
Invoke-WebRequest http://localhost:8000/api/predictions/ -Headers @{"Authorization"="Bearer test"}

# 2. View Django admin panel
# Open browser: http://localhost:8000/admin/
# Login with superuser credentials

# 3. Check prediction creation
$predictionPayload = @{
    image_url = "https://example.com/image.jpg"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:8000/api/predictions/ `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer your_jwt_token"
    } `
    -Body $predictionPayload
```

## Quick Reference Commands

### Database Commands
```powershell
# Create new migrations after model changes
python manage.py makemigrations

# Apply pending migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Reverse last migration
python manage.py migrate apps 0001

# Delete all data and reset migrations (WARNING!)
python manage.py flush
```

### Django Admin
```powershell
# Create superuser
python manage.py createsuperuser

# Change user password
python manage.py changepassword username

# Django shell for testing
python manage.py shell
```

### Celery Management
```powershell
# List active tasks
celery -A config inspect active

# Purge all pending tasks
celery -A config purge

# Monitor tasks in real-time
celery -A config events

# Show statistics
celery -A config inspect stats
```

### Model Training Commands
```powershell
# Train CNN model
python training/train_cnn.py --config training/configs/cnn_config.yaml

# Train Vision Transformer
python training/train_vit.py --config training/configs/vit_config.yaml

# Train Classical ML models
python training/train_classical.py --config training/configs/classical_config.yaml

# Evaluate models on test set
python training/evaluate_models.py --dataset data/chest_xray/test --weights weights/resnet50_best.pth
```

### Debugging
```powershell
# Run Django development server with verbose logging
python manage.py runserver --verbosity 3

# Run Celery worker with debug logging
celery -A config worker -l debug

# Check database connection
python manage.py dbshell

# Create test user via shell
python manage.py shell
# >>> from django.contrib.auth.models import User
# >>> User.objects.create_user('testuser', 'test@example.com', 'password')
```

## API Endpoints Quick Reference

### Create Prediction
```powershell
$token = "your_jwt_token"
$imageUrl = "https://example.com/chest_xray.jpg"

$payload = @{
    image_url = $imageUrl
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:8000/api/predictions/ `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $payload
```

### Get Prediction Status
```powershell
$predictionId = "uuid-from-create-response"
$token = "your_jwt_token"

Invoke-WebRequest -Uri http://localhost:8000/api/predictions/$predictionId/ `
    -Headers @{
        "Authorization" = "Bearer $token"
    }
```

### List User Predictions
```powershell
$token = "your_jwt_token"

Invoke-WebRequest -Uri http://localhost:8000/api/predictions/?page=1 `
    -Headers @{
        "Authorization" = "Bearer $token"
    }
```

### Get Analytics
```powershell
$token = "your_jwt_token"

# User statistics
Invoke-WebRequest -Uri http://localhost:8000/api/analytics/user-stats/ `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

# Model leaderboard
Invoke-WebRequest -Uri http://localhost:8000/api/analytics/leaderboard/ `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

# Model comparison
Invoke-WebRequest -Uri http://localhost:8000/api/analytics/model-comparison/ `
    -Headers @{
        "Authorization" = "Bearer $token"
    }
```

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `DEBUG` | Django debug mode | `True` (dev), `False` (prod) |
| `SECRET_KEY` | Django secret key | Generate with: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DB_NAME` | PostgreSQL database name | `medical_db` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `secure_password` |
| `DB_HOST` | PostgreSQL host | `localhost` or IP |
| `DB_PORT` | PostgreSQL port | `5432` |
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Supabase API key | From Supabase dashboard |
| `SUPABASE_JWT_SECRET` | JWT secret key | From Supabase settings |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `MOCK_MODE` | Use mock predictions | `True` (no ML models needed), `False` (requires weights) |

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'django'"
**Solution**: Ensure virtual environment is activated
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Issue: "psycopg2 connection error"
**Solution**: Check PostgreSQL is running and credentials in .env are correct
```powershell
# Test database connection
python manage.py dbshell
```

### Issue: "Redis connection refused"
**Solution**: Start Redis server (Windows)
```powershell
# If Redis installed via Chocolatey:
redis-server

# Or check if running as service:
Get-Service Redis
```

### Issue: "Celery worker not picking up tasks"
**Solution**: Verify Celery configuration
```powershell
# Check Celery can connect to broker
celery -A config inspect ping

# Restart worker with debug output
celery -A config worker -l debug
```

### Issue: GPU not detected (for CUDA)
**Solution**: Reinstall PyTorch with CUDA support
```powershell
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## Production Deployment Checklist

- [ ] Set `DEBUG=False` in .env
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure PostgreSQL with backups
- [ ] Set up Redis with persistence
- [ ] Use Gunicorn + Nginx
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure email backend for notifications
- [ ] Set up logging and monitoring
- [ ] Create admin superuser
- [ ] Test all API endpoints
- [ ] Load test with Apache Bench or Locust
- [ ] Set up CI/CD pipeline

## Next Steps

1. **Frontend Setup**: Set up React/Vue frontend at `D:\Medical-Image-Diagnosis\frontend`
2. **ML Models**: Download or train models and place weights in `backend/weights/`
3. **Database Backup**: Set up automated PostgreSQL backups
4. **Monitoring**: Set up error tracking (Sentry) and logging aggregation
5. **Testing**: Write unit tests for models and API endpoints

---

**Backend URL**: `http://localhost:8000/api/`
**Admin Panel**: `http://localhost:8000/admin/`
**API Documentation**: Visit `http://localhost:8000/api/` in browser for browsable API
