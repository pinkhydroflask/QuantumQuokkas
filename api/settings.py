import os
from dataclasses import dataclass, field
from typing import List


def _get_list(env_name: str, default: str) -> List[str]:
    raw = os.getenv(env_name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass
class Settings:
    ai_api_key: str = os.getenv("AI_API_KEY", "")
    podr_secret: str = os.getenv("PODR_SECRET", "devsecret")
    receipt_ttl_seconds: int = int(os.getenv("RECEIPT_TTL_SECONDS", "10"))
    allowed_origins: List[str] = field(
        default_factory=lambda: _get_list(
            "ALLOWED_ORIGINS",
            "http://localhost:19006,http://localhost:8081,http://localhost:5173,http://localhost:3000",
        )
    )
    redis_url: str = os.getenv("REDIS_URL", "")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./pac.db")
    key_version_active: str = os.getenv("KEY_VERSION_ACTIVE", "v1")
    retired_secrets: List[str] = field(default_factory=lambda: _get_list("RETIRED_SECRETS", ""))


settings = Settings()
