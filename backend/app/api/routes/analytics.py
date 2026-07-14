from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.database.session import get_db
from app.models.user import User
from app.schemas.prediction import AnalyticsResponse, DashboardStats
from app.services import prediction_service

router = APIRouter(tags=["analytics"])


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stats = prediction_service.dashboard_stats(db, current_user.id)
    return DashboardStats(
        **stats,
        current_model=settings.MODEL_NAME,
        model_accuracy=settings.MODEL_ACCURACY,
    )


@router.get("/analytics", response_model=AnalyticsResponse)
def analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stats = prediction_service.dashboard_stats(db, current_user.id)
    class_dist = prediction_service.class_distribution(db, current_user.id)
    items, _ = prediction_service.list_predictions(db, current_user.id, page=1, page_size=10)

    most_predicted = max(class_dist, key=class_dist.get) if class_dist else None

    return AnalyticsResponse(
        class_distribution=class_dist,
        daily_trend=prediction_service.trend(db, current_user.id, days=14),
        weekly_trend=prediction_service.trend(db, current_user.id, days=90),
        monthly_trend=prediction_service.trend(db, current_user.id, days=365),
        confidence_distribution=prediction_service.confidence_distribution(db, current_user.id),
        average_confidence=stats["average_confidence"],
        average_inference_time_ms=stats["average_inference_time_ms"],
        total_predictions=stats["total_predictions"],
        predictions_today=stats["predictions_today"],
        most_predicted_class=most_predicted,
        recent_predictions=items,
    )
