from __future__ import annotations
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3
from .settings import settings
from .security import hmac_sign_hex, hmac_verify_hex
from .redis_client import get_redis

router = APIRouter()
DB_PATH = settings.database_url.replace("sqlite:///", "")


class ProcessBody(BaseModel):
    input_hash: str


class VerifyBody(BaseModel):
    receipt: Dict[str, Any]


@router.post("/process")
async def process_receipt(body: ProcessBody):
    now = datetime.utcnow().isoformat() + "Z"
    status = "not_yet_deleted"

    r = get_redis()
    if r is not None:
        # Store a tombstone with TTL; for demo, value is a marker string
        r.set(body.input_hash, "present", ex=settings.receipt_ttl_seconds)
        ttl = settings.receipt_ttl_seconds
    else:
        ttl = 0

    signature, key_version = hmac_sign_hex(body.input_hash, now, status)

    # Persist receipt row (append-only)
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO receipts (input_hash, timestamp, status, signature, key_version)
            VALUES (?, ?, ?, ?, ?)
            """,
            (body.input_hash, now, status, signature, key_version),
        )
        conn.commit()
    finally:
        conn.close()

    return {
        "input_hash": body.input_hash,
        "timestamp": now,
        "status": status,
        "signature": signature,
        "key_version": key_version,
        "ttl_seconds": ttl,
    }


@router.post("/verify")
async def verify_receipt(body: VerifyBody):
    rcpt = body.receipt
    sig_valid = hmac_verify_hex(
        rcpt.get("input_hash", ""),
        rcpt.get("timestamp", ""),
        rcpt.get("status", ""),
        rcpt.get("signature", ""),
        rcpt.get("key_version", "v1"),
    )
    # Check vault status for demo visualization
    r = get_redis()
    present = False
    if r is not None and rcpt.get("input_hash"):
        present = r.exists(rcpt["input_hash"]) == 1

    verified = sig_valid and not present
    return {
        "signature_valid": bool(sig_valid),
        "verified": bool(verified),
        "data_present_in_vault": bool(present),
    }
