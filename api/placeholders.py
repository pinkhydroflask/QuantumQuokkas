from __future__ import annotations
import re
from typing import Dict, List, Tuple

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\b(?:\+?\d{1,3}[- ]?)?(?:\d{3,4}[- ]?){2,3}\b")
# Address heuristic: number + words + suffix; allow trailing punctuation or EoS
ADDRESS_RE = re.compile(
    r"\b\d+\s+"  # house number
    r"[A-Za-z][A-Za-z\s]+"  # street name words
    r"\s(?:Road|Rd|Street|St|Ave|Avenue|Boulevard|Blvd|Lane|Ln|Drive|Dr)"  # suffix
    r"(?:[\.;,]|$)"  # trailing punctuation or end
)
GPS_RE = re.compile(r"\b-?\d{1,2}\.\d{3,},\s*-?\d{1,3}\.\d{3,}\b")
CARD_RE = re.compile(r"\b(?:\d[ -]*?){13,19}\b")
ID_RE = re.compile(r"\b(?:[STFG]\d{7}[A-Z]|\d{3}-\d{2}-\d{4})\b")  # NRIC/SSN
# Avoid matching street names by excluding common road suffixes as the second token
NAME_RE = re.compile(r"\b([A-Z][a-z]+)\s+(?!Road\b|Rd\b|Street\b|St\b|Ave\b|Avenue\b|Boulevard\b|Blvd\b|Lane\b|Ln\b|Drive\b|Dr\b)[A-Z][a-z]+\b")


CATEGORY_TO_REGEX = {
    "EMAIL": EMAIL_RE,
    "PHONE": PHONE_RE,
    "ADDRESS": ADDRESS_RE,
    "GPS": GPS_RE,
    "CARD": CARD_RE,
    "ID": ID_RE,
    "NAME": NAME_RE,
}


def build_placeholders(text: str, categories: List[str]) -> Tuple[str, Dict[str, str], Dict[str, int]]:
    """Return sanitized text, placeholder->original map, and counts per category.

    Placeholders are stable by order of first appearance per category: CAT_1, CAT_2, ...
    """
    placeholder_map: Dict[str, str] = {}
    counts: Dict[str, int] = {cat: 0 for cat in categories}

    # Collect matches in order, non-overlapping via progressive replacement
    def repl_factory(cat: str):
        def _repl(m: re.Match) -> str:
            counts[cat] += 1
            key = f"{cat}_{counts[cat]}"
            placeholder = f"[{key}]"
            placeholder_map[placeholder] = m.group(0)
            return placeholder
        return _repl

    sanitized = text
    for cat in categories:
        regex = CATEGORY_TO_REGEX.get(cat)
        if not regex:
            continue
        sanitized = regex.sub(repl_factory(cat), sanitized)
    return sanitized, placeholder_map, counts


def reinsert_placeholders(text: str, placeholder_map: Dict[str, str]) -> str:
    """Deterministically reinsert placeholders in a single pass without partial collisions."""
    # Sort by descending key length to avoid partial collisions (e.g., NAME_1 vs NAME_10)
    items = sorted(placeholder_map.items(), key=lambda kv: len(kv[0]), reverse=True)
    result = text
    for placeholder, original in items:
        result = result.replace(placeholder, original)
    return result
