from api.audit import append_audit_entry
from api.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_export_csv_contains_headers_and_rows():
    append_audit_entry({
        "request_id": "req-1",
        "ts": "2025-08-29T08:12:30Z",
        "text_redactions": ["EMAIL", "PHONE"],
        "image_masks": [],
        "placeholders_used": {"EMAIL_1": "x"},
        "policy_snapshot": {"text": {"mode": "placeholder"}}
    })
    r = client.get("/audit/export?format=csv")
    assert r.status_code == 200
    csv = r.text.strip().splitlines()
    assert csv[0] == "request_id,ts,text_redactions,image_masks,placeholders_used"
    assert any("req-1" in line for line in csv[1:])
