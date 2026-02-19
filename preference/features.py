from __future__ import annotations

from typing import List

TINCTURES = [
    "argent",
    "or",
    "gules",
    "sable",
    "azure",
    "vert",
    "purpure",
    "murrey",
    "sanguine",
    "tenné",
]

DIVISIONS = [
    "perPale",
    "perFess",
    "perBend",
    "perBendSinister",
    "perCross",
    "perSaltire",
    "perChevron",
    "perPile",
    "gyronny",
    "chevronny",
]

ORDINARIES = [
    "fess",
    "pale",
    "bend",
    "bendSinister",
    "chief",
    "base",
    "chevron",
    "cross",
    "saltire",
    "bordure",
    "orle",
    "mount",
    "point",
    "flaunches",
    "gore",
    "gyron",
    "quarter",
    "canton",
    "pall",
    "terrace",
    "label",
]


def extract_base_tincture(t_str: str) -> str:
    """Extract base tincture from a pattern string like 'ermine-argent-sable'."""
    if not t_str:
        return ""
    if "-" not in t_str:
        return t_str

    parts = t_str.split("-")
    for part in parts:
        if part in TINCTURES:
            return part

    return parts[1] if len(parts) > 1 else t_str


def _one_hot(value: str, options: List[str]) -> List[float]:
    return [1.0 if value == option else 0.0 for option in options]


def _zeros(count: int) -> List[float]:
    return [0.0] * count


def extract_features(coa: dict) -> List[float]:
    """Extract a flat feature vector from a COA JSON object."""
    coa = coa or {}
    t1_raw = coa.get("t1", "")
    t1 = extract_base_tincture(t1_raw) if isinstance(t1_raw, str) else ""
    has_pattern = 1.0 if isinstance(t1_raw, str) and "-" in t1_raw else 0.0

    division = coa.get("division") or {}
    division_type = division.get("division", "") if isinstance(division, dict) else ""
    has_division = 1.0 if division_type else 0.0
    division_t = extract_base_tincture(division.get("t", "")) if has_division else ""

    ordinaries = coa.get("ordinaries") or []
    has_ordinary = 1.0 if ordinaries else 0.0
    first_ordinary = ordinaries[0].get("ordinary", "") if ordinaries else ""

    charges = coa.get("charges") or []
    has_charge = 1.0 if charges else 0.0
    num_charges = float(len(charges))
    num_ordinaries = float(len(ordinaries))
    first_charge_t = extract_base_tincture(charges[0].get("t", "")) if charges else ""

    features: List[float] = []
    features.extend(_one_hot(t1, TINCTURES))
    features.append(has_pattern)

    features.extend(_one_hot(division_t, TINCTURES) if has_division else _zeros(len(TINCTURES)))
    features.extend(_one_hot(division_type, DIVISIONS) if has_division else _zeros(len(DIVISIONS)))
    features.append(has_division)

    features.extend(_one_hot(first_ordinary, ORDINARIES) if has_ordinary else _zeros(len(ORDINARIES)))
    features.append(has_ordinary)

    features.append(num_charges)
    features.append(num_ordinaries)
    features.append(has_charge)

    features.extend(_one_hot(first_charge_t, TINCTURES) if has_charge else _zeros(len(TINCTURES)))

    complexity = num_charges + num_ordinaries + has_division + has_pattern
    features.append(float(complexity))

    return features


def get_feature_names() -> List[str]:
    """Return a list of feature names aligned with extract_features."""
    names: List[str] = []
    names.extend([f"t1_{t}" for t in TINCTURES])
    names.append("has_pattern")
    names.extend([f"division_t_{t}" for t in TINCTURES])
    names.extend([f"division_{d}" for d in DIVISIONS])
    names.append("has_division")
    names.extend([f"ordinary_{o}" for o in ORDINARIES])
    names.append("has_ordinary")
    names.append("num_charges")
    names.append("num_ordinaries")
    names.append("has_charge")
    names.extend([f"charge_t_{t}" for t in TINCTURES])
    names.append("complexity")
    return names