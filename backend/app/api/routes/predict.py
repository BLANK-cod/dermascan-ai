import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from PIL import Image
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.database.session import get_db
from app.models.user import User
from app.schemas.prediction import ExplainabilityOut, PredictionOut
from app.services import prediction_service
from app.services.explainability_service import (
    ExplainabilityNotAvailableError,
    generate_explainability_map,
)
from app.services.model_service import ModelNotLoadedError, model_service
from app.utils.morphology import extract_morphology
from app.services.stage_estimation import estimate_stage
from app.services.segmentation_service import segmentation_service, SegmentationNotAvailableError
import numpy as np

router = APIRouter(tags=["prediction"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _validate_image(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(415, f"Unsupported image type: {file.content_type}")


def _save_upload(image: Image.Image, subdir: str) -> str:
    directory = Path(settings.UPLOAD_DIR) / subdir
    directory.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.jpg"
    path = directory / filename
    image.convert("RGB").save(path, "JPEG", quality=90)
    return str(path)


@router.post("/predict", response_model=PredictionOut)
async def predict(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _validate_image(file)

    raw = await file.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(raw) > max_bytes:
        raise HTTPException(413, f"Image exceeds {settings.MAX_UPLOAD_MB}MB limit")

    try:
        image = Image.open(__import__("io").BytesIO(raw))
        image.verify()
        image = Image.open(__import__("io").BytesIO(raw))  # reopen after verify()
    except Exception:
        raise HTTPException(400, "Uploaded file is not a valid image")

    try:
        result = model_service.predict(image)
    except ModelNotLoadedError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc))

    image_path = _save_upload(image, "images")

    # Explainability is generated eagerly so history/detail views always
    # have it ready — attention maps come from the same forward pass.
    explainability_path = None
    try:
        attn_maps = model_service.get_last_attention_maps()
        patch_grid = settings.MODEL_INPUT_SIZE // 16  # typical ViT/DeiT patch size = 16
        out_path = Path(settings.GRADCAM_DIR) / "images" / f"{uuid.uuid4().hex}.jpg"
        generate_explainability_map(image, attn_maps, patch_grid, out_path)
        explainability_path = str(out_path)
    except ExplainabilityNotAvailableError:
        pass  # model not fully integrated yet; prediction still saved
    # Run U-Net segmentation (if available), save mask, then extract morphology and estimate stage
    morphology = None
    thickness_score = None
    clinical_stage = None

    try:
        print("===================================")
        print("Segmentation loaded:", segmentation_service.is_loaded)
        print("===================================")
        if segmentation_service.is_loaded:
            print("Running U-Net...")
            mask_arr = segmentation_service.predict_mask(image)
            print("Mask shape:", mask_arr.shape)
            seg_dir = Path(settings.UPLOAD_DIR).parent / "segmentation" / "images"
            seg_dir.mkdir(parents=True, exist_ok=True)
            print("Saving mask...")
            filename = Path(image_path).stem + ".png"
            mask_path = seg_dir / filename

            mask_img = Image.fromarray((mask_arr * 255).astype("uint8"))
            mask_img.save(mask_path)
            print("Mask saved:", mask_path)

            morphology = extract_morphology(mask_arr, original_image=image)
            print("Morphology:", morphology)

            morphology_numeric = {
                k: float(v)
                for k, v in morphology.items()
                if isinstance(v, (int, float))
            }

            thickness_score, clinical_stage = estimate_stage(morphology_numeric)
            print("Stage:", clinical_stage)
        else:
            print("❌ Segmentation model is NOT loaded")
    except Exception as e:
        print("\n========== SEGMENTATION ERROR ==========")
        print(e)
        import traceback
        traceback.print_exc()
        print("========================================\n")
        morphology = None
        thickness_score = None
        clinical_stage = None

    prediction = prediction_service.create_prediction(
        db,
        user_id=current_user.id,
        image_path=image_path,
        predicted_class=result["predicted_class"],
        confidence=result["confidence"],
        probabilities=result["probabilities"],
        inference_time_ms=result["inference_time_ms"],
        explainability_path=explainability_path,
        model_name=settings.MODEL_NAME,
        morphology=morphology,
        thickness_score=thickness_score,
        clinical_stage=clinical_stage,
    )
    return prediction


@router.post("/explainability/{prediction_id}", response_model=ExplainabilityOut)
def get_explainability(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prediction = prediction_service.get_prediction(db, prediction_id, current_user.id)
    if not prediction:
        raise HTTPException(404, "Prediction not found")
    if not prediction.explainability_path:
        raise HTTPException(404, "Explainability map not available for this prediction")
    
    print("Image Path:", prediction.image_path)
    print("Explainability Path:", prediction.explainability_path)

    return ExplainabilityOut(
        prediction_id=prediction.id,
        original_image_url=f"/static/{prediction.image_path}",
        explainability_image_url=f"/static/{prediction.explainability_path}",
        method=prediction.explainability_method,
        predicted_class=prediction.predicted_class,
        confidence=prediction.confidence,
    )


# Backward-compatible alias for the legacy "/gradcam" naming — same behavior.
@router.post("/gradcam/{prediction_id}", response_model=ExplainabilityOut, include_in_schema=False)
def get_gradcam_alias(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_explainability(prediction_id, current_user, db)
