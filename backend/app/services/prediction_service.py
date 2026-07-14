from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.prediction import Prediction


def create_prediction(db: Session, user_id: int, **fields) -> Prediction:
    prediction = Prediction(user_id=user_id, **fields)
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction


def get_prediction(db: Session, prediction_id: int, user_id: int) -> Prediction | None:
    return (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id, Prediction.user_id == user_id)
        .first()
    )


def delete_prediction(db: Session, prediction_id: int, user_id: int) -> bool:
    prediction = get_prediction(db, prediction_id, user_id)
    if not prediction:
        return False
    db.delete(prediction)
    db.commit()
    return True


def list_predictions(
    db: Session,
    user_id: int,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
):
    query = db.query(Prediction).filter(Prediction.user_id == user_id)
    if search:
        query = query.filter(Prediction.predicted_class.ilike(f"%{search}%"))
    total = query.count()
    items = (
        query.order_by(Prediction.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return items, total


def dashboard_stats(db: Session, user_id: int) -> dict:
    base = db.query(Prediction).filter(Prediction.user_id == user_id)
    total = base.count()

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = base.filter(Prediction.created_at >= today_start).count()

    avg_conf = base.with_entities(func.avg(Prediction.confidence)).scalar() or 0.0
    avg_time = base.with_entities(func.avg(Prediction.inference_time_ms)).scalar() or 0.0

    return {
        "total_predictions": total,
        "predictions_today": today_count,
        "average_confidence": round(float(avg_conf), 4),
        "average_inference_time_ms": round(float(avg_time), 2),
    }


def class_distribution(db: Session, user_id: int) -> dict[str, int]:
    rows = (
        db.query(Prediction.predicted_class, func.count(Prediction.id))
        .filter(Prediction.user_id == user_id)
        .group_by(Prediction.predicted_class)
        .all()
    )
    return {cls: count for cls, count in rows}


def confidence_distribution(db: Session, user_id: int) -> dict[str, int]:
    buckets = {"50-60%": 0, "60-70%": 0, "70-80%": 0, "80-90%": 0, "90-100%": 0}
    rows = db.query(Prediction.confidence).filter(Prediction.user_id == user_id).all()
    for (conf,) in rows:
        pct = conf * 100
        if pct < 60:
            buckets["50-60%"] += 1
        elif pct < 70:
            buckets["60-70%"] += 1
        elif pct < 80:
            buckets["70-80%"] += 1
        elif pct < 90:
            buckets["80-90%"] += 1
        else:
            buckets["90-100%"] += 1
    return buckets


def trend(db: Session, user_id: int, days: int) -> list[dict]:
    since = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(func.date(Prediction.created_at), func.count(Prediction.id))
        .filter(Prediction.user_id == user_id, Prediction.created_at >= since)
        .group_by(func.date(Prediction.created_at))
        .order_by(func.date(Prediction.created_at))
        .all()
    )
    return [{"date": str(d), "count": c} for d, c in rows]
