import hashlib
import hmac
from typing import Tuple
from .settings import settings


def sha256_hex(data: bytes) -> str:
    """Return hex-encoded SHA256 of input bytes.

    Never log or store raw PII; callers should hash before transport.
    """
    return hashlib.sha256(data).hexdigest()


def hmac_sign_hex(input_hash: str, timestamp_iso: str, status: str, key_version: str | None = None) -> Tuple[str, str]:
    """Sign a receipt payload using HMAC-SHA256.

    Returns (signature_hex, key_version_used)
    """
    version = key_version or settings.key_version_active
    secret = _resolve_secret_for_version(version)
    payload = f"{input_hash}|{timestamp_iso}|{status}".encode("utf-8")
    signature = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    return signature, version


def hmac_verify_hex(input_hash: str, timestamp_iso: str, status: str, signature_hex: str, key_version: str) -> bool:
    """Verify HMAC-SHA256 signature across active and retired secrets."""
    candidate_versions = [key_version, settings.key_version_active]
    for secret_version in candidate_versions:
        secret = _resolve_secret_for_version(secret_version)
        payload = f"{input_hash}|{timestamp_iso}|{status}".encode("utf-8")
        expected = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
        if hmac.compare_digest(expected, signature_hex):
            return True
    # Check retired secrets (no version match, but allow verification)
    for retired_secret in settings.retired_secrets:
        payload = f"{input_hash}|{timestamp_iso}|{status}".encode("utf-8")
        expected = hmac.new(retired_secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
        if hmac.compare_digest(expected, signature_hex):
            return True
    return False


def _resolve_secret_for_version(version: str) -> str:
    if version == settings.key_version_active:
        return settings.podr_secret
    # For a more complete implementation, map versions to secrets via env or KMS.
    # Here we fallback to active secret when unknown.
    return settings.podr_secret
