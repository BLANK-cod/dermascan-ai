from __future__ import annotations

import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import logging
from pathlib import Path
from typing import Optional

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


class SegmentationNotAvailableError(RuntimeError):
    pass


class SegmentationService:
    def __init__(self) -> None:
        self._model = None
        self._input_size: tuple[int, int] | None = None
        self._loaded = False
        self._model_path = Path("models") / "unet.keras"
        self._try_load()

    def _try_load(self) -> None:
        try:
            import tensorflow as tf
            tf.get_logger().setLevel("ERROR")
        except Exception as exc:
            logger.warning("TensorFlow not available for U-Net segmentation: %s", exc)
            self._loaded = False
            return

        try:
            print("Loading U-Net from:", self._model_path)
            self._model = tf.keras.models.load_model(str(self._model_path), compile=False)
            inp_shape = self._model.input_shape
            if len(inp_shape) == 4:
                self._input_size = (int(inp_shape[1]), int(inp_shape[2]))
            else:
                self._input_size = (256, 256)

            print("Input shape:", inp_shape)
            print("Using input size:", self._input_size)
            self._loaded = True
            logger.info("Loaded U-Net model from %s with input_size=%s", self._model_path, self._input_size)
        except Exception as exc:
            print("\n========== U-NET MODEL LOAD FAILED ==========")
            print(exc)
            import traceback
            traceback.print_exc()
            print("=============================================\n")
            self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def predict_mask(self, image: Image.Image) -> np.ndarray:
        if not self._loaded or self._model is None:
            raise SegmentationNotAvailableError("U-Net segmentation model is not loaded")

        import cv2
        import numpy as np
        import tensorflow as tf
        tf.get_logger().setLevel("ERROR")

        orig_w, orig_h = image.size
        target_h, target_w = self._input_size or (256, 256)

        img = image.convert("RGB")
        img_resized = img.resize((target_w, target_h), Image.Resampling.BILINEAR)
        arr = np.asarray(img_resized).astype("float32") / 255.0
        inp = np.expand_dims(arr, axis=0)

        pred = self._model.predict(inp)
        if pred.ndim == 4:
            mask_small = pred[0, :, :, 0]
        elif pred.ndim == 3:
            mask_small = pred[0, :, :]
        else:
            raise RuntimeError(f"Unexpected segmentation output shape: {pred.shape}")

        mask_up = cv2.resize(mask_small.astype("float32"), (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
        mask_bin = (mask_up >= 0.5).astype(np.uint8)
        return mask_bin


segmentation_service = SegmentationService()
