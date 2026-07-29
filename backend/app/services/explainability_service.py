"""
Explainability service for DeiT + AG-GELU.

DeiT is a Vision Transformer, not a CNN, so classic Grad-CAM (which needs a
convolutional feature map) does not apply. Instead this module implements
**Attention Rollout** (Abnar & Zuidema, 2020), the standard technique for
visualizing what a ViT attends to:

1. Collect the self-attention weight matrices from every transformer block
   during the forward pass (averaged across heads).
2. Add the identity matrix to each (to account for the residual/skip
   connection) and re-normalize so each row sums to 1.
3. Multiply the per-layer matrices together to "roll out" attention from
   the output back to the input patch tokens.
4. Take the row corresponding to the [CLS] token, reshape the remaining
   patch-token scores into a (H/patch x W/patch) grid, and upsample to
   the original image size to get a heatmap.

This module is written against the *interface* in model_service
(`get_last_attention_maps`) and will work as soon as the real DeiT forward
pass populates that attention list. Until then it raises a clear error
rather than fabricating a heatmap.
"""
from __future__ import annotations

from pathlib import Path
from typing import Optional

import numpy as np
from PIL import Image


class ExplainabilityNotAvailableError(RuntimeError):
    pass


def attention_rollout(attention_maps: list, discard_ratio: float = 0.0) -> np.ndarray:
    """
    attention_maps: list of (num_heads, tokens, tokens) arrays, one per
    transformer block, captured during the forward pass.
    Returns a (tokens,) array — attention from CLS token to every other token
    after rolling out through all layers.
    """
    result = np.eye(attention_maps[0].shape[-1])

    for attn in attention_maps:
        # Convert torch tensor to numpy if needed
        if hasattr(attn, "detach"):
            attn = attn.detach().cpu().numpy()

            # Shape can be:
            # (1, 12, 197, 197)  -> batch, heads, tokens, tokens
            # (12, 197, 197)     -> heads, tokens, tokens

        if attn.ndim == 4:
            attn = attn[0]  # remove batch dimension

        # Average over attention heads
        attn_avg = attn.mean(axis=0)

        if discard_ratio > 0:
            flat = attn_avg.flatten()
            n_discard = int(flat.size * discard_ratio)

            if n_discard > 0:
                threshold = np.partition(flat, n_discard)[n_discard]
                attn_avg = np.where(attn_avg < threshold, 0, attn_avg)

        # Add residual connection
        attn_avg = attn_avg + np.eye(attn_avg.shape[0])

        # Normalize
        attn_avg = attn_avg / attn_avg.sum(axis=-1, keepdims=True)

        result = attn_avg @ result

    # CLS token (index 0) attention to all patch tokens
    return result[0, 1:]


def render_heatmap_overlay(
    original_image: Image.Image,
    cls_attention: np.ndarray,
    patch_grid_size: int,
    output_path: Path,
    alpha: float = 0.5,
) -> Path:
    """
    Reshapes the flat per-patch attention scores into a grid, upsamples to
    the original image resolution, and saves a heatmap-over-image overlay.
    """
    import cv2

    grid = cls_attention.reshape(patch_grid_size, patch_grid_size)
    grid = (grid - grid.min()) / (grid.max() - grid.min() + 1e-8)

    img_rgb = np.array(original_image.convert("RGB"))
    h, w = img_rgb.shape[:2]

    heatmap = cv2.resize(grid, (w, h), interpolation=cv2.INTER_CUBIC)
    heatmap = np.clip(heatmap * 255, 0, 255).astype(np.uint8)
    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)

    overlay = np.uint8(img_rgb * (1 - alpha) + heatmap_color * alpha)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(overlay).save(output_path)
    return output_path


def generate_explainability_map(
    original_image: Image.Image,
    attention_maps: Optional[list],
    patch_grid_size: int,
    output_path: Path,
) -> Path:
    """
    Main entry point used by the /explainability (formerly /gradcam) route.
    Raises ExplainabilityNotAvailableError until the model service is wired
    up to capture real attention maps from the DeiT forward pass.
    """
    if not attention_maps:
        raise ExplainabilityNotAvailableError(
            "Attention maps are not available yet — this is populated once "
            "the DeiT + AG-GELU forward pass is integrated in model_service.py."
        )

    cls_attention = attention_rollout(attention_maps)
    return render_heatmap_overlay(original_image, cls_attention, patch_grid_size, output_path)
    