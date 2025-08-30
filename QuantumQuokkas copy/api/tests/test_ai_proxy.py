import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_complete_uses_sanitized_prompt_and_returns_completion():
    r = client.post("/ai/complete", json={"prompt": "[EMAIL_1] hello"})
    assert r.status_code == 200
    data = r.json()
    assert "completion" in data
    assert "[EMAIL_1]" in data["completion"] or "You said:" in data["completion"]


def test_idempotency_key_returns_cached_response():
    headers = {"Idempotency-Key": "test-key-123"}
    r1 = client.post("/ai/complete", json={"prompt": "hi"}, headers=headers)
    r2 = client.post("/ai/complete", json={"prompt": "changed"}, headers=headers)
    assert r1.json() == r2.json()
