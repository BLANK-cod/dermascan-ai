"""
Central configuration for DermaScan AI backend.
All values are sourced from environment variables (.env), with sane defaults
for local development. Nothing model-architecture-specific lives here beyond
paths and metadata — the actual DeiT + AG-GELU definition lives in
app/services/model_service.py and is supplied at integration time.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    PROJECT_NAME: str = "DermaScan AI"
    API_V1_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres123@localhost:5432/dermascan_ai"

    # Auth
    SECRET_KEY: str = "insecure-dev-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Model — DeiT + AG-GELU (loaded lazily by model_service at startup)
    MODEL_PATH: str = "models/deit_ag_gelu_best.pth"
    MODEL_NAME: str = "DeiT + AG-GELU"
    MODEL_ACCURACY: float = 81.04
    MODEL_INPUT_SIZE: int = 224
    NUM_CLASSES: int = 7
    #CLASS_NAMES: List[str] = ["MEL", "NV", "BCC", "AKIEC", "BKL", "DF", "VASC"]
    CLASS_NAMES: List[str] = [
    "AKIEC",
    "BCC",
    "BKL",
    "DF",
    "MEL",
    "NV",
    "VASC"
]

    # Storage
    UPLOAD_DIR: str = "storage/uploads"
    GRADCAM_DIR: str = "storage/explainability"
    MAX_UPLOAD_MB: int = 10

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
