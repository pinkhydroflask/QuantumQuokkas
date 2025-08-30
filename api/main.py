from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .settings import settings
from .ai_proxy import router as ai_router
from .receipts import router as receipts_router
from .audit import router as audit_router, init_db
from .vision import router as image_router

app = FastAPI(title="PAC API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite tables
init_db()

app.include_router(ai_router, prefix="/ai", tags=["ai"])
app.include_router(receipts_router, prefix="/receipts", tags=["receipts"])
app.include_router(audit_router, prefix="/audit", tags=["audit"])
app.include_router(image_router, prefix="/image", tags=["image"])
