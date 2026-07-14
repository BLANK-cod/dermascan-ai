"""
Importing this package registers every ORM model with Base.metadata, which
Alembic's autogenerate (and any code needing the full schema) relies on.
Kept separate from database/base.py to avoid a circular import: models
import Base from database.base, so base.py cannot import models back.
"""
from app.models.user import User  # noqa: F401
from app.models.prediction import Prediction  # noqa: F401
