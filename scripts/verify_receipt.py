#!/usr/bin/env python3
import json
import sys
from pathlib import Path

# Allow running from monorepo root
try:
    from api.security import hmac_verify_hex
except Exception:
    sys.path.append(str(Path(__file__).resolve().parents[1]))
    from api.security import hmac_verify_hex  # type: ignore


def main():
    if len(sys.argv) < 2:
        print("Usage: verify_receipt.py <receipt.json>")
        sys.exit(1)
    path = Path(sys.argv[1])
    data = json.loads(path.read_text())
    rcpt = data if isinstance(data, dict) else data.get("receipt", {})
    ok = hmac_verify_hex(
        rcpt.get("input_hash", ""),
        rcpt.get("timestamp", ""),
        rcpt.get("status", ""),
        rcpt.get("signature", ""),
        rcpt.get("key_version", "v1"),
    )
    print("signature_valid:", bool(ok))


if __name__ == "__main__":
    main()
