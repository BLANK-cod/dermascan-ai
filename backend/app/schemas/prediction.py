from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PredictionOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        protected_namespaces=()
    )

    id: int
    image_path: str
    predicted_class: str
    confidence: float
    probabilities: dict[str, float]
    inference_time_ms: float
    explainability_path: str | None
    explainability_method: str
    model_name: str
    thickness_score: float | None = None
    clinical_stage: str | None = None
    morphology: dict | None = None
    created_at: datetime


class PredictionListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    predicted_class: str
    confidence: float
    inference_time_ms: float
    created_at: datetime


class PaginatedPredictions(BaseModel):
    items: list[PredictionListItem]
    total: int
    page: int
    page_size: int


class ExplainabilityOut(BaseModel):
    prediction_id: int
    original_image_url: str
    explainability_image_url: str
    method: str
    predicted_class: str
    confidence: float


class DashboardStats(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        protected_namespaces=()
    )
    total_predictions: int
    predictions_today: int
    average_confidence: float
    average_inference_time_ms: float
    current_model: str
    model_accuracy: float


class AnalyticsResponse(BaseModel):
    class_distribution: dict[str, int]
    daily_trend: list[dict]
    weekly_trend: list[dict]
    monthly_trend: list[dict]
    confidence_distribution: dict[str, int]
    average_confidence: float
    average_inference_time_ms: float
    total_predictions: int
    predictions_today: int
    most_predicted_class: str | None
    recent_predictions: list[PredictionListItem]
