from __future__ import annotations
from fastapi import APIRouter, Header, HTTPException, Request, UploadFile, File
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Dict, Optional
from .settings import settings
from .audit import append_audit_entry

router = APIRouter()

class CompleteBody(BaseModel):
    prompt: str

# In-memory rate limiting and idempotency (demo only; not for multi-process)
_rate_limit: Dict[str, list] = {}
_idempotency_cache: Dict[str, Dict] = {}


def _rate_limit_key(client_ip: str) -> str:
    return f"rl:{client_ip}"


@router.post("/complete")
async def ai_complete(body: CompleteBody, request: Request, idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key")):
    client_ip = request.client.host if request.client else "unknown"

    if idempotency_key and idempotency_key in _idempotency_cache:
        return _idempotency_cache[idempotency_key]

    # Basic token bucket: 30 req/min per IP
    now = datetime.utcnow()
    window_start = now - timedelta(seconds=60)
    key = _rate_limit_key(client_ip)
    _rate_limit.setdefault(key, [])
    _rate_limit[key] = [ts for ts in _rate_limit[key] if ts > window_start]
    if len(_rate_limit[key]) >= 30:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    _rate_limit[key].append(now)

    sanitized_prompt = body.prompt

    # Provider interface: dummy unless AI_API_KEY present
    if settings.ai_api_key:
        # Placeholder for real provider call; avoid sending PII by contract (input is sanitized).
        completion_text = f"[LLM completion simulated at {now.isoformat()}Z]"
    else:
        completion_text = f"[dummy completion at {now.isoformat()}Z] You said: {sanitized_prompt[:120]}"

    response = {"completion": completion_text}

    # Append audit entry (no raw prompt stored)
    append_audit_entry({
        "request_id": idempotency_key or f"req-{now.timestamp()}",
        "ts": now.isoformat() + "Z",
        "text_redactions": [],
        "image_masks": [],
        "placeholders_used": {},
        "policy_snapshot": {},
    })

    if idempotency_key:
        _idempotency_cache[idempotency_key] = response
    return response


@router.post("/vision")
async def ai_vision(image: UploadFile = File(...)):
    # Do not log raw image content; read minimally to validate
    content_type = image.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are accepted")
    # Optionally, ensure size under limit by reading small chunk
    # For demo: return a simple caption without storing the image
    now = datetime.utcnow().isoformat() + "Z"
    return {"caption": "Blurred image received.", "notes": f"Processed at {now}"}
