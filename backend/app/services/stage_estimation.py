from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple

@dataclass
class StageThresholds:
    early: float = 1.0
    intermediate: float = 4.0


def estimate_thickness_from_features(features: Dict[str, float], px_to_mm: float = 0.02) -> float:
    """
    Rule-based proxy for Breslow thickness (in mm) from morphology features.

    Default `px_to_mm` is a placeholder scale (mm per pixel). For reliable
    estimates supply calibrated `px_to_mm` based on imaging setup. The
    implementation uses the equivalent diameter as a proxy for lesion width
    and scales it to mm; this is intentionally simple and rule-based.
    """
    if not features or features.get("equivalent_diameter", 0) <= 0:
        return 0.0

    eq_diam_px = float(features.get("equivalent_diameter", 0.0))

    # Simple linear proxy: thickness_mm = scale * equivalent_diameter_px
    thickness_mm = px_to_mm * eq_diam_px
    return round(float(thickness_mm), 3)


def map_thickness_to_stage(thickness_mm: float, thresholds: StageThresholds | None = None) -> str:
    if thresholds is None:
        thresholds = StageThresholds()
    if thickness_mm <= thresholds.early:
        return "Early"
    if thickness_mm <= thresholds.intermediate:
        return "Intermediate"
    return "Advanced"


def estimate_stage(features: Dict[str, float], px_to_mm: float = 0.02, thresholds: StageThresholds | None = None) -> Tuple[float, str]:
    thickness = estimate_thickness_from_features(features, px_to_mm=px_to_mm)
    stage = map_thickness_to_stage(thickness, thresholds)
    return thickness, stage
