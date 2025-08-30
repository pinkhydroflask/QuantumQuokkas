# Personal AI Privacy Capsule (PAC)

A **user-owned privacy layer** that preprocesses text, images, and location *on-device*, sends only sanitized data to cloud AI models, and post-processes AI responses locally. Includes audit logging, CSV export, and optional Proof-of-Deletion receipts backed by a TTL vault.

---

## 🚀 Quickstart

### Prerequisites

- Python 3.11+
- Node.js 18+ and Expo CLI (`npm install -g expo-cli`)
- Docker (optional) – for running Redis via docker-compose

---

## 1. Backend (FastAPI)

```bash
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will now be available at:

- **Local**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **LAN (same Wi-Fi or hotspot)**: `http://<YOUR_MAC_LAN_IP>:8000/docs`
- **Remote (via Cloudflare Tunnel)**:
  ```bash
  cloudflared tunnel --url http://localhost:8000
  ```
  → Copy the generated `https://<random-name>.trycloudflare.com/docs` URL

### 🌱 Environment Variables

Configure via `.env` or export:

- `AI_API_KEY`: Optional. Uses real LLM provider if set.
- `PODR_SECRET`: HMAC secret for deletion receipts (auto-generated if missing).
- `RECEIPT_TTL_SECONDS`: TTL for vault keys (default: 10).
- `ALLOWED_ORIGINS`: CORS whitelist (comma-separated).
- `REDIS_URL`: Redis connection string (e.g., `redis://localhost:6379/0`).
- `DATABASE_URL`: SQLite path (default: `sqlite:///./pac.db`)

### ✅ Run Tests

```bash
cd api
pytest -q
```

---

## 2. Frontend (React Native + Expo)

```bash
cd app/rn/pac-rn
npm install
npx expo start
```

Open the **Expo Go app** on your **iOS** or **Android** device.  
Scan the QR code printed in your terminal or browser.

### 🔗 API Endpoint Configuration

The frontend reads the API base URL from `app.json` → `expo.extra.EXPO_PUBLIC_API_BASE`.

- For iOS Simulator → use `http://localhost:8000`
- For Android Emulator → use `http://10.0.2.2:8000`
- For physical device on LAN → use your Mac’s IP e.g., `http://192.168.X.X:8000`
- For remote testing → use Cloudflare tunnel URL e.g., `https://something.trycloudflare.com`

Update `app.json` like so:

```json
"extra": {
  "EXPO_PUBLIC_API_BASE": "http://192.168.X.X:8000"
}
```

Or for public tunnel:

```json
"extra": {
  "EXPO_PUBLIC_API_BASE": "https://your-tunnel.trycloudflare.com"
}
```

After updating `app.json`, restart Expo with:

```bash
npx expo start -c
```

---

## 3. Docker Compose (Optional Redis Vault)

```bash
docker compose up -d
```

This launches Redis as the optional TTL vault for deletion receipts.

---

## 📁 Repository Structure

```
.
├─ app/
│  ├─ lynx/                 # Placeholder for Lynx web app
│  └─ rn/pac-rn/            # React Native Expo app
├─ api/
│  ├─ main.py               # FastAPI entry point
│  ├─ ai_proxy.py           # Handles LLM proxying
│  ├─ receipts.py           # Proof-of-Deletion receipts
│  ├─ audit.py              # Audit logging + CSV export
│  ├─ security.py           # SHA256, HMAC helpers
│  ├─ redis_client.py       # Redis vault support
│  ├─ settings.py           # Environment config
│  ├─ placeholders.py       # Sanitization and reinsertion
│  ├─ requirements.txt
│  └─ tests/
│     ├─ test_placeholders.py
│     ├─ test_receipts.py
│     ├─ test_ai_proxy.py
│     └─ test_audit.py
├─ scripts/
│  ├─ verify_receipt.py     # CLI for verifying receipts
│  └─ seed_demo_data.py     # Populates fake data
├─ data/                    # Output data folder
├─ docker-compose.yml       # Redis container setup
├─ LICENSE
└─ README.md
```

---

## 🔐 Notes

- **Privacy by design**: Raw PII never leaves device; only sanitized data is sent.
- **Receipts** are signed using HMAC-SHA256 and optionally stored in a Redis TTL vault.
- **Exports** are anonymized and available as downloadable CSVs.

---

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for details.
