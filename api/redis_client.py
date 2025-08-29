from __future__ import annotations
from typing import Optional
from redis import Redis
from .settings import settings

_redis_instance: Optional[Redis] = None


def get_redis() -> Optional[Redis]:
    global _redis_instance
    if _redis_instance is not None:
        return _redis_instance
    if not settings.redis_url:
        return None
    try:
        _redis_instance = Redis.from_url(settings.redis_url, decode_responses=True)
        # Try a ping to ensure connectivity
        _redis_instance.ping()
        return _redis_instance
    except Exception:
        return None
