# DermaScan AI

Full-stack dermoscopy decision-support application, rebuilt around a
**DeiT + AG-GELU** (PyTorch, Vision Transformer) 7-class skin lesion
classifier. This is an infrastructure-complete build — auth, database,
history, analytics, and UI all work end-to-end — with a clean, modular
interface for dropping in your trained checkpoint.

**Your trained model is not included and was not created or trained by
this build.** Model integration is a separate, explicit step (see below).

---

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router + Recharts + Framer Motion
- **Backend:** FastAPI + SQLAlchemy + Alembic + JWT auth + PyTorch (inference only)
- **Database:** PostgreSQL

## Project layout

```
backend/
  app/
    core/          # config, JWT/password security
    database/      # engine, session, declarative Base
    models/        # SQLAlchemy models: User, Prediction
    schemas/       # Pydantic request/response schemas
    api/routes/     # auth, predict, history, analytics, model_info, admin
    services/
      model_service.py          # DeiT + AG-GELU load/predict interface
      activations.py            # AG-GELU stub — you supply the real module
      explainability_service.py # Attention Rollout (ViT-native, not CNN Grad-CAM)
      prediction_service.py     # DB queries for history/analytics
  alembic/         # migrations
  models/          # put deit_ag_gelu_best.pth here
frontend/
  src/
    pages/         # Login, Register, Dashboard, Prediction, History,
                    # Analytics, ModelInfo, Profile, Admin
    layouts/       # Sidebar (collapsible), Navbar, DashboardLayout
    context/       # AuthContext, ThemeContext (dark/light)
    services/api.js
docker-compose.yml # local Postgres
```

---

## Running locally

### 1. Database

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env         # edit if needed
alembic revision --autogenerate -m "init"
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive API docs, and
`http://localhost:8000/health` to confirm the server (and model-load status)
is up.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. The dev server proxies `/api` and `/static`
to the backend on port 8000.

Until a checkpoint is loaded, the app is fully usable — register, log in,
browse every page — but `/predict` returns a clear `503` explaining the
model isn't wired up yet, instead of crashing.

---

## Integrating your trained DeiT + AG-GELU model

Three files, no changes needed anywhere else in the app:

1. **`backend/app/services/activations.py`** — paste in your AG-GELU
   `nn.Module` implementation.
2. **`backend/app/services/model_service.py`** — in `load()`, uncomment and
   complete the architecture-build + `state_dict` loading block; in
   `_preprocess()`, match your exact training-time resize/normalization if
   it differs from the ImageNet defaults currently there.
3. **`backend/models/deit_ag_gelu_best.pth`** — place your checkpoint here
   (path is configurable via `MODEL_PATH` in `.env`).

For explainability, DeiT is a Vision Transformer, so this app uses
**Attention Rollout** (`explainability_service.py`) instead of CNN
Grad-CAM — it needs the per-block self-attention weights from your
forward pass. Wire `model_service.get_last_attention_maps()` to return
those (e.g. by capturing them via forward hooks or having your model's
forward pass optionally return them), and explainability maps will start
generating automatically after every prediction — no route or UI changes
required.

---

## Notes

- `predictions.probabilities` uses Postgres `JSONB` — if you ever need a
  different DB engine, swap that column type accordingly.
- The 7 supported classes (`MEL, NV, BCC, AKIEC, BKL, DF, VASC`) are
  centralized in `backend/app/core/config.py` (`CLASS_NAMES`) — nothing
  else hardcodes them.
- Admin dashboard requires a user with `is_admin=True`; set that directly
  in the database for your first admin account.
