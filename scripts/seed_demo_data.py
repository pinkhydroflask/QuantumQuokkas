from datetime import datetime
from api.audit import append_audit_entry


def run():
    now = datetime.utcnow().isoformat() + "Z"
    append_audit_entry({
        "request_id": "demo-1",
        "ts": now,
        "text_redactions": ["EMAIL", "PHONE", "ADDRESS"],
        "image_masks": [{"face": 1}],
        "placeholders_used": {"EMAIL_1": "john.tan@company.com"},
        "policy_snapshot": {"text": {"redact": ["EMAIL", "PHONE"]}},
    })


if __name__ == "__main__":
    run()
