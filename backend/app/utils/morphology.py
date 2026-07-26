from __future__ import annotations

import math
from typing import Dict

import cv2
import numpy as np
from PIL import Image


def _ensure_binary_mask(mask: np.ndarray) -> np.ndarray:
    # Convert to 0/1 binary mask
    if mask.dtype != np.uint8:
        mask = mask.astype(np.uint8)
    if mask.max() > 1:
        _, mask = cv2.threshold(mask, 127, 1, cv2.THRESH_BINARY)
    return mask


def _rotate_mask_to_major_axis(mask: np.ndarray, contour: np.ndarray) -> np.ndarray:
    if len(contour) < 5:
        return mask
    try:
        (_, _), (_, _), angle = cv2.fitEllipse(contour)
    except cv2.error:
        return mask
    center = (mask.shape[1] / 2.0, mask.shape[0] / 2.0)
    M = cv2.getRotationMatrix2D(center, -angle, 1.0)
    rotated = cv2.warpAffine(mask.astype(np.uint8), M, (mask.shape[1], mask.shape[0]), flags=cv2.INTER_NEAREST, borderValue=0)
    return rotated


def _category_asymmetry(score: float) -> str:
    if score <= 0.15:
        return "Low"
    if score <= 0.35:
        return "Moderate"
    return "High"


def _category_border(score: float) -> str:
    if score <= 1.2:
        return "Smooth"
    if score <= 1.8:
        return "Mild irregularity"
    return "Marked irregularity"


def _category_colour(score: float) -> str:
    if score <= 10.0:
        return "Uniform"
    if score <= 25.0:
        return "Moderate"
    return "Variegated"


def _category_diameter_mm(diameter_mm: float) -> str:
    if diameter_mm <= 6.0:
        return "Small"
    if diameter_mm <= 15.0:
        return "Medium"
    return "Large"


def extract_morphology(mask: np.ndarray, original_image: Image.Image | None = None) -> Dict[str, float | str]:
    """
    Extract basic morphological features from a binary segmentation mask.

    Returns a dict with: area (pixels), equivalent_diameter (pixels),
    perimeter (pixels), circularity, border_irregularity, and color_variation
    (mean stddev across HSV channels) when `original_image` is provided.
    """
    if mask is None:
        return {}

    mask = np.asarray(mask)
    mask = _ensure_binary_mask(mask)

    # Area
    area = float(mask.sum())

    # Perimeter and contours
    contours, _ = cv2.findContours(mask.copy().astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    perimeter = 0.0
    major_axis = 0.0
    if contours:
        # take largest contour
        c = max(contours, key=cv2.contourArea)
        perimeter = float(cv2.arcLength(c, True))
        if len(c) >= 5:
            ellipse = cv2.fitEllipse(c)
            (cx, cy), (MA, ma), angle = ellipse
            major_axis = float(max(MA, ma))
        else:
            x, y, w, h = cv2.boundingRect(c)
            major_axis = float(max(w, h))

    # Equivalent diameter
    equivalent_diameter = 0.0
    if area > 0:
        equivalent_diameter = 2.0 * math.sqrt(area / math.pi)

    # Perimeter-based compactness and circularity
    circularity = 0.0
    compactness = 0.0
    if perimeter > 0:
        compactness = (4 * math.pi * area) / (perimeter * perimeter)
        circularity = compactness

    border_irregularity = 0.0
    if circularity > 0:
        border_irregularity = 1.0 / circularity

    # Solidity and extent
    solidity = 0.0
    convex_area = 0.0
    extent = 0.0
    if contours:
        hull = cv2.convexHull(c)
        convex_area = float(cv2.contourArea(hull))
        if convex_area > 0:
            solidity = area / convex_area
        x, y, w, h = cv2.boundingRect(c)
        if w > 0 and h > 0:
            extent = area / float(w * h)

    # Colour variation inside mask (if image provided)
    color_variation = 0.0
    if original_image is not None and area > 0:
        img = np.array(original_image.convert("RGB"))
        h, w = mask.shape[:2]
        if img.shape[0] != h or img.shape[1] != w:
            img = cv2.resize(img, (w, h), interpolation=cv2.INTER_LINEAR)
        hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
        vals = []
        for i in range(3):
            channel = hsv[:, :, i]
            masked_vals = channel[mask.astype(bool)]
            if masked_vals.size > 0:
                vals.append(float(np.std(masked_vals)))
        if vals:
            color_variation = float(np.mean(vals))

    # Eccentricity from ellipse fit
    eccentricity = 0.0
    minor_axis = 0.0
    if contours and len(c) >= 5:
        if ma > 0:
            minor_axis = float(min(MA, ma))
            eccentricity = math.sqrt(max(0.0, 1.0 - (minor_axis / max(MA, ma)) ** 2))

    # Asymmetry: compare left/right areas after aligning the major axis horizontally
    asymmetry = 0.0
    if contours and area > 0 and len(c) >= 5:
        mask_rotated = _rotate_mask_to_major_axis(mask, c)
        center_x = mask_rotated.shape[1] // 2
        left_area = float(mask_rotated[:, :center_x].sum())
        right_area = float(mask_rotated[:, center_x:].sum())
        asymmetry = abs(left_area - right_area) / area

    # Diameter in mm (proxy scale)
    px_to_mm = 0.02
    equivalent_diameter_mm = equivalent_diameter * px_to_mm
    major_axis_mm = major_axis * px_to_mm

    # ABCD categories
    asymmetry_category = _category_asymmetry(asymmetry)
    border_category = _category_border(border_irregularity)
    colour_category = _category_colour(color_variation)
    diameter_category = _category_diameter_mm(equivalent_diameter_mm)

    return {
        "area": area,
        "perimeter": perimeter,
        "equivalent_diameter": equivalent_diameter,
        "equivalent_diameter_mm": equivalent_diameter_mm,
        "major_axis": major_axis,
        "major_axis_mm": major_axis_mm,
        "circularity": circularity,
        "compactness": compactness,
        "border_irregularity": border_irregularity,
        "solidity": solidity,
        "extent": extent,
        "eccentricity": eccentricity,
        "asymmetry": asymmetry,
        "asymmetry_category": asymmetry_category,
        "border_category": border_category,
        "colour_category": colour_category,
        "diameter_category": diameter_category,
        "color_variation": color_variation,
    }
