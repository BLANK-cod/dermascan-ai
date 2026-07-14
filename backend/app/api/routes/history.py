from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.prediction import PaginatedPredictions, PredictionOut
from app.services import prediction_service

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=PaginatedPredictions)
def list_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total = prediction_service.list_predictions(
        db, current_user.id, page, page_size, search
    )
    return PaginatedPredictions(items=items, total=total, page=page, page_size=page_size)


@router.get("/{prediction_id}", response_model=PredictionOut)
def get_history_item(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prediction = prediction_service.get_prediction(db, prediction_id, current_user.id)
    if not prediction:
        raise HTTPException(404, "Prediction not found")
    return prediction


@router.delete("/{prediction_id}", status_code=204)
def delete_history_item(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not prediction_service.delete_prediction(db, prediction_id, current_user.id):
        raise HTTPException(404, "Prediction not found")
