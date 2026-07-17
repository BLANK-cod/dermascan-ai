from app.models import *
from app.database.base import Base
from app.database.session import engine

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings
from app.services.model_service import model_service


@asynccontextmanager
async def lifespan(app: FastAPI):

    # Create all database tables
    Base.metadata.create_all(bind=engine)

    # Load the AI model
    model_service.load()

    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    Path(settings.GRADCAM_DIR).mkdir(parents=True, exist_ok=True)

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Serve uploaded images and explainability maps
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.GRADCAM_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/static/storage", StaticFiles(directory="storage"), name="static")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model_service.is_loaded,
        "model_name": settings.MODEL_NAME,
    }
