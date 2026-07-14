import shutil
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.config import settings
from app.database.session import get_db
from app.models.prediction import Prediction
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def admin_stats(_: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar()
    total_predictions = db.query(func.count(Prediction.id)).scalar()

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    predictions_today = (
        db.query(func.count(Prediction.id)).filter(Prediction.created_at >= today_start).scalar()
    )

    class_counts = (
        db.query(Prediction.predicted_class, func.count(Prediction.id))
        .group_by(Prediction.predicted_class)
        .all()
    )
    most_predicted = max(class_counts, key=lambda r: r[1])[0] if class_counts else None

    disk = shutil.disk_usage("/")

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_predictions": total_predictions,
        "predictions_today": predictions_today,
        "most_predicted_disease": most_predicted,
        "database": {
            "predictions_table_rows": total_predictions,
            "users_table_rows": total_users,
        },
        "storage": {
            "total_gb": round(disk.total / (1024**3), 2),
            "used_gb": round(disk.used / (1024**3), 2),
            "free_gb": round(disk.free / (1024**3), 2),
        },
        "system": {
            "model_name": settings.MODEL_NAME,
            "model_accuracy": settings.MODEL_ACCURACY,
        },
    }
