# Personal AI Privacy Capsule (PAC)

A user-owned privacy layer that preprocesses text/images/location on-device, sends only sanitized data to cloud AI, and post-processes AI responses locally. Includes audit logging, CSV export, and optional Proof-of-Deletion receipts backed by a TTL vault.

## Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ and Expo CLI (for RN fallback UI)
- Docker (optional) for Redis via docker-compose

### Backend (FastAPI)

```bash
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Environment variables (via `.env` or environment):
- AI_API_KEY: Optional; if set, used for real LLM provider. Otherwise dummy completions are returned.
- PODR_SECRET: HMAC secret for receipts; default generated if missing (dev only).
- RECEIPT_TTL_SECONDS: TTL for vault keys; default 10.
- ALLOWED_ORIGINS: Comma-separated origins for CORS.
- REDIS_URL: Redis connection string; e.g. redis://localhost:6379/0
- DATABASE_URL: SQLite path; default `sqlite:///./pac.db`.

Run tests:
```bash
cd api
pytest -q
```

### UI (React Native / Expo fallback)

```bash
cd app/rn
npm i
npm run start
```

The UI expects the API at `http://localhost:8000` (configurable in `app/rn/lib/config.ts`).

### Docker Compose (Redis)

```bash
docker compose up -d
```

## Repository Structure

```
.
├─ app/
│  ├─ lynx/            # Placeholder for Lynx; RN fallback below
│  └─ rn/              # Expo app with required screens and libs
├─ api/
│  ├─ main.py          # FastAPI app + CORS
│  ├─ ai_proxy.py      # LLM proxy + basic rate limit & idempotency
│  ├─ receipts.py      # HMAC-signed receipts + vault
│  ├─ audit.py         # Audit storage + CSV export
│  ├─ security.py      # sha256, HMAC sign/verify, key versions
│  ├─ redis_client.py  # Optional Redis vault helper
│  ├─ settings.py      # Env settings and defaults
│  ├─ placeholders.py  # Deterministic placeholders and reinsertion
│  ├─ requirements.txt
│  └─ tests/
│     ├─ test_placeholders.py
│     ├─ test_receipts.py
│     ├─ test_ai_proxy.py
│     └─ test_audit.py
├─ scripts/
│  ├─ verify_receipt.py
│  └─ seed_demo_data.py
├─ data/
├─ docker-compose.yml
├─ LICENSE
└─ README.md
```

## 3-minute Demo Script

1) Open Text Capsule.
- Paste:
```
Email john.tan@company.com, phone 9123-4567, ship to 123 Tampines St 45.
```
- Tap Sanitize → shows Before/After with placeholders: `[EMAIL_1]`, `[PHONE_1]`, `[ADDRESS_1]`.
- Tap Ask AI → sends sanitized prompt to `/ai/complete`.
- Tap Reinsert locally → final output displays with original values restored.
- Check Audit → see entry noting EMAIL, PHONE, ADDRESS redactions. Tap Export CSV.

2) Open Image Capsule.
- Pick demo image from `data/` → preview Before/After with blurred faces/plates.
- Tap Analyze with AI (optional) → calls `/ai/vision` with blurred image.

3) Receipts (optional).
- Enable receipts in Settings. Submit a text. A deletion receipt appears.
- Tap Verify → `/receipts/verify` shows ✅ after TTL expiry.

## Notes
- Privacy by design: raw PII never leaves device; only sanitized prompts are sent.
- Receipts use HMAC-SHA256 signatures and an optional Redis TTL vault.
- CSV export contains only anonymized metadata.

## License
This project is licensed under the MIT License. See `LICENSE` for details.
