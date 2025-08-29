from __future__ import annotations
import json
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query
from fastapi.responses import PlainTextResponse
from .settings import settings
import io
import csv

DB_PATH = settings.database_url.replace("sqlite:///", "")
router = APIRouter()


def init_db() -> None:
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS audit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id TEXT,
                ts TEXT,
                text_redactions TEXT,
                image_masks TEXT,
                placeholders_used TEXT,
                policy_snapshot TEXT
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS receipts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                input_hash TEXT,
                timestamp TEXT,
                status TEXT,
                signature TEXT,
                key_version TEXT
            );
            """
        )
        conn.commit()
    finally:
        conn.close()


def append_audit_entry(entry: Dict[str, Any]) -> None:
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO audit (request_id, ts, text_redactions, image_masks, placeholders_used, policy_snapshot)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                entry.get("request_id"),
                entry.get("ts", datetime.utcnow().isoformat() + "Z"),
                json.dumps(entry.get("text_redactions", [])),
                json.dumps(entry.get("image_masks", [])),
                json.dumps(entry.get("placeholders_used", {})),
                json.dumps(entry.get("policy_snapshot", {})),
            ),
        )
        conn.commit()
    finally:
        conn.close()


@router.get("/export", response_class=PlainTextResponse)
def export_csv(format: str = Query("csv"), from_ts: Optional[str] = Query(None, alias="from"), to_ts: Optional[str] = Query(None, alias="to")):
    assert format == "csv"
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.cursor()
        query = "SELECT request_id, ts, text_redactions, image_masks, placeholders_used FROM audit"
        params: List[Any] = []
        if from_ts and to_ts:
            query += " WHERE ts BETWEEN ? AND ?"
            params.extend([from_ts, to_ts])
        elif from_ts:
            query += " WHERE ts >= ?"
            params.append(from_ts)
        elif to_ts:
            query += " WHERE ts <= ?"
            params.append(to_ts)
        query += " ORDER BY ts ASC"
        cur.execute(query, params)
        rows = cur.fetchall()
    finally:
        conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["request_id", "ts", "text_redactions", "image_masks", "placeholders_used"])
    for r in rows:
        request_id, ts, red, masks, placeholders = r
        writer.writerow([
            request_id or "",
            ts or "",
            red or "[]",
            masks or "[]",
            placeholders or "{}",
        ])
    return output.getvalue()
