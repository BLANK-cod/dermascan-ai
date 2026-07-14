from fastapi import APIRouter

from app.api.routes import admin, analytics, auth, history, model_info, predict

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(predict.router)
api_router.include_router(history.router)
api_router.include_router(analytics.router)
api_router.include_router(model_info.router)
api_router.include_router(admin.router)
