from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    image_path: Mapped[str] = mapped_column(String(500), nullable=False)

    # DeiT + AG-GELU output
    predicted_class: Mapped[str] = mapped_column(String(10), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    probabilities: Mapped[dict] = mapped_column(JSONB, nullable=False)  # {class_name: prob}
    inference_time_ms: Mapped[float] = mapped_column(Float, nullable=False)

    # Transformer explainability (attention rollout / ViT-CAM), not CNN Grad-CAM
    explainability_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    explainability_method: Mapped[str] = mapped_column(String(50), default="attention_rollout")

    model_name: Mapped[str] = mapped_column(String(100), default="DeiT + AG-GELU")
    # Morphology and staging (rule-based additions)
    morphology: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    thickness_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    clinical_stage: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="predictions")
