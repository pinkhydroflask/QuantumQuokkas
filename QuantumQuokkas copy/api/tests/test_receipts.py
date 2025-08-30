from api.security import hmac_sign_hex, hmac_verify_hex

def test_hmac_sign_and_verify():
    input_hash = "abcd1234"
    ts = "2025-08-29T08:12:30Z"
    status = "not_yet_deleted"
    sig, ver = hmac_sign_hex(input_hash, ts, status)
    assert sig
    assert ver
    assert hmac_verify_hex(input_hash, ts, status, sig, ver)


def test_hmac_tamper_detection():
    input_hash = "abcd1234"
    ts = "2025-08-29T08:12:30Z"
    status = "not_yet_deleted"
    sig, ver = hmac_sign_hex(input_hash, ts, status)
    assert not hmac_verify_hex(input_hash, ts, "deleted", sig, ver)
