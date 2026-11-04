# Medical Image Diagnosis

An AI-powered platform for chest X-ray classification (**NORMAL** vs **PNEUMONIA**). It combines deep learning and classical ML models behind a Django REST API, with a modern React dashboard for uploading images, running predictions, and comparing model performance.

> **Disclaimer:** This project is for educational and research purposes only. It is **not** a medical device and must not be used for clinical diagnosis.

---

## Features

- **Multi-model inference** — ResNet-50 (CNN), Vision Transformer (ViT), and a classical ML model (XGBoost), with ensemble results.
- **Explainability** — visual insight into predictions via Grad-CAM / SHAP.
- **Async processing** — inference runs in the background via Celery + Redis.
- **Supabase authentication** — stateless JWT auth validated against Supabase signing keys.
- **Prediction history** — per-user history with image storage in Supabase.
- **Analytics dashboard** — model leaderboard, user stats, and model comparison charts (confusion matrices, ROC curves).

---

## Tech Stack

| Layer        | Technologies |
|--------------|--------------|
| Backend      | Django 4.2, Django REST Framework, PyJWT, Celery, Redis |
| ML           | PyTorch, torchvision, transformers, scikit-learn, XGBoost, SHAP, OpenCV |
| Frontend     | React 19, Vite, React Router 7, TanStack Query, Zustand, Recharts |
| Auth/Storage | Supabase (JWT + Storage) |
| Database     | SQLite (dev default) / PostgreSQL |

---

## Project Structure

```
backend/
  apps/
    accounts/         # Supabase JWT auth, profile, health check
    predictions/      # image upload, inference, history (Celery tasks)
    models_registry/  # registered ML model metadata
    analytics/        # leaderboard, user stats, model comparison
  config/
    settings/         # base + development settings
    celery.py         # Celery app
    urls.py           # root URL routing
  ml/
    inference/        # classical, CNN, and ViT model wrappers
    preprocessing/    # image preprocessing
    explainability/   # Grad-CAM / SHAP
  training/           # training scripts and YAML configs
  weights/            # trained model weights
frontend/
  src/
    components/       # auth, charts, layout, prediction, upload
    pages/            # Landing, Auth, Dashboard, History, ModelCompare, Profile
    hooks/            # useAuth, useHistory, usePrediction
    lib/              # apiClient, supabaseClient, constants
    store/            # Zustand stores (auth, prediction)
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Redis (for Celery async inference)
- A Supabase project (for auth and image storage)

### 1. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a `.env` file in `backend/` (see [Environment Variables](#environment-variables)), then run migrations and start the server:

```powershell
python manage.py migrate
python manage.py runserver
```

Start the Celery worker in a separate terminal (Redis must be running):

```powershell
celery -A config worker -l info
```

The API runs at `http://localhost:8000`.

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Create a `.env` file in `frontend/` with your Supabase credentials and API URL, then open the app at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | insecure dev key |
| `DEBUG` | Enable debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1` |
| `USE_SQLITE` | Use SQLite instead of PostgreSQL | `True` |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` | PostgreSQL settings (when `USE_SQLITE=False`) | postgres defaults |
| `REDIS_URL` | Celery broker / result backend | `redis://localhost:6379/0` |
| `SUPABASE_URL` | Supabase project URL | — |
| `SUPABASE_KEY` | Supabase anon key | — |
| `SUPABASE_JWT_SECRET` | Legacy HS256 JWT secret | — |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | — |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:8000`) |

---

## API Overview

Authentication uses Supabase-issued JWTs. Send the access token as `Authorization: Bearer <token>` on protected endpoints.

### Auth / Accounts — `/api/auth/`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/auth/profile/` | Current user's profile |
| GET | `/api/auth/health/` | Service health check |

### Predictions — `/api/predictions/`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/predictions/upload/` | Upload an image |
| POST | `/api/predictions/` | Create a prediction |
| GET | `/api/predictions/<uuid:id>/` | Fetch a prediction result |
| GET | `/api/predictions/history/` | User's prediction history |

### Models Registry — `/api/models/`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/models/` | List registered models |
| GET | `/api/models/<int:pk>/` | Model metadata |

### Analytics — `/api/analytics/`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/analytics/leaderboard/` | Model leaderboard |
| GET | `/api/analytics/user-stats/` | Per-user statistics |
| GET | `/api/analytics/model-comparison/` | Model comparison data |

---

## Model Training

Training scripts and configs live under `backend/training/`:

```powershell
cd backend
python training/train_cnn.py        # ResNet-50
python training/train_vit.py        # Vision Transformer
python training/train_classical.py  # XGBoost / classical ML
python training/evaluate_all.py     # Evaluate all models
```

Hyperparameters are defined in `backend/training/configs/*.yaml`. Trained weights are saved to `backend/weights/`.

---

## License

For educational and research use only. Not intended for clinical diagnosis.