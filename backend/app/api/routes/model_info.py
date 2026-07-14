from fastapi import APIRouter

from app.core.config import settings
from app.services.model_service import model_service

router = APIRouter(prefix="/model", tags=["model"])


@router.get("/info")
def model_info():
    return {
        "model_name": settings.MODEL_NAME,
        "framework": "PyTorch",
        "architecture": "Data-efficient Image Transformer (DeiT) with custom AG-GELU activation",
        "dataset": "ISIC 2018",
        "input_size": f"{settings.MODEL_INPUT_SIZE} x {settings.MODEL_INPUT_SIZE}",
        "num_classes": settings.NUM_CLASSES,
        "class_names": settings.CLASS_NAMES,
        "overall_accuracy": settings.MODEL_ACCURACY,
        "explainability_method": "Attention Rollout (transformer-native, not CNN Grad-CAM)",
        "is_loaded": model_service.is_loaded,
        "notes": [
            "DeiT is a Vision Transformer — explainability uses attention "
            "rollout across self-attention layers rather than CNN Grad-CAM.",
            "AG-GELU is a custom activation function supplied at model "
            "integration time.",
        ],
    }
