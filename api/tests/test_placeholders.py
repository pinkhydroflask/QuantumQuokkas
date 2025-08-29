import pytest
from api.placeholders import build_placeholders, reinsert_placeholders

def test_mapping_stability_and_order():
    text = "Email a@b.com and a@b.com again; John Tan called 9123-4567; ship to 123 Tampines Road."
    sanitized, mapping, counts = build_placeholders(text, ["EMAIL", "NAME", "PHONE", "ADDRESS"])
    assert "[EMAIL_1]" in sanitized
    assert "[EMAIL_2]" in sanitized
    assert counts["EMAIL"] == 2
    assert counts["PHONE"] == 1
    assert counts["ADDRESS"] == 1
    # Deterministic reinsertion
    restored = reinsert_placeholders(sanitized, mapping)
    assert restored == text


def test_no_partial_collisions():
    text = "NAME_10 is literally in text and also John Tan"
    sanitized, mapping, counts = build_placeholders(text, ["NAME"])
    # Reinsertion should restore original without corrupting NAME_10 literal
    restored = reinsert_placeholders(sanitized, mapping)
    assert restored == text
