"""
Model service — DeiT + AG-GELU integration point.

This module intentionally does NOT define the DeiT architecture or the
AG-GELU activation function. Those are supplied by you at integration time
(the trained checkpoint + the AG-GELU nn.Module implementation). This file
only defines the *interface* the rest of the application talks to, so that
plugging in the real model is a matter of filling in three methods below —
nothing else in the app needs to change.

Integration steps (future phase):
  1. Drop your AG-GELU nn.Module into app/services/activations.py
     (a stub file is created for you).
  2. Define/import the DeiT + AG-GELU architecture in `_build_architecture`.
  3. Point settings.MODEL_PATH at your .pth checkpoint.
  4. Fill in `_load_weights` and `_preprocess` to match your training
     pipeline exactly (resize, normalization stats, etc).

Everything else — the /predict endpoint, DB persistence, analytics,
explainability plumbing — is already wired to this interface.
"""

from __future__ import annotations

import time
from pathlib import Path
from typing import Optional, cast

import numpy as np
from PIL import Image

from app.core.config import settings
from app.services.architecture import build_deit_ag_gelu


class ModelNotLoadedError(RuntimeError):
    """Raised when inference is requested before the model has been loaded."""


class DermaScanModel:
    """
    Thin wrapper around the DeiT + AG-GELU checkpoint. Loaded exactly once
    at FastAPI startup (see app/main.py lifespan) and reused for every
    request — never re-instantiated per-request.
    """

    def __init__(self) -> None:
        self._model = None  # torch.nn.Module, set in load()
        self._device = None  # torch.device, set in load()
        self._loaded = False
        self.class_names: list[str] = settings.CLASS_NAMES
        self.input_size: int = settings.MODEL_INPUT_SIZE
        self._last_attention_maps = None

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    # ------------------------------------------------------------------
    # Integration point #1: architecture + weights
    # ------------------------------------------------------------------
    def load(self) -> None:
        """
        Load the DeiT + AG-GELU checkpoint once. Currently a safe no-op
        placeholder so the rest of the application (auth, history,
        analytics, UI) is fully runnable before the trained model file
        exists. Replace the body of this method during model integration.
        """
        #checkpoint_path = Path(settings.MODEL_PATH)

        checkpoint_path = Path(settings.MODEL_PATH)

        #print("Checkpoint Path:", checkpoint_path.resolve())
        #print("Exists:", checkpoint_path.exists())
        
        if checkpoint_path.exists():
            print("✓ Checkpoint found")
        else:
            raise FileNotFoundError(f"Checkpoint not found: {checkpoint_path}")

        if not checkpoint_path.exists():
            # No checkpoint yet — app stays up, /predict will return a
            # clear 503 instead of crashing the whole server.
            self._loaded = False
            return

        import torch

        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        
        self._model = build_deit_ag_gelu(
            num_classes=settings.NUM_CLASSES
        )


# Handle different checkpoint formats

        state_dict = torch.load(
            checkpoint_path,
            map_location=self._device
        )

        if isinstance(state_dict, dict):
            if "state_dict" in state_dict:
                state_dict = state_dict["state_dict"]
            elif "model_state_dict" in state_dict:
                state_dict = state_dict["model_state_dict"]
        
        # print("=" * 60)
        # print("State Dict Type:", type(state_dict))
        # print("First 10 Keys:")
        # for key in list(state_dict.keys())[:10]:
        #     print(key)
        # print("=" * 60)

        #self._model.load_state_dict(state_dict)

        missing, unexpected = self._model.load_state_dict(
            state_dict,
            strict=False
        )

        print("=" * 60)
        print("Missing keys:", len(missing))
        print("Unexpected keys:", len(unexpected))

        if missing:
            print("\nMissing Keys:")
            for k in missing[:20]:
                print(" -", k)

        if unexpected:
            print("\nUnexpected Keys:")
            for k in unexpected[:20]:
                print(" -", k)

        print("=" * 60)

        self._model.to(self._device)
        self._model.eval()
        
        # print("=" * 60)
        # print("Model classifier shape:", self._model.classifier.weight.shape)

        # if "classifier.weight" in state_dict:
        #     print("Checkpoint classifier shape:", state_dict["classifier.weight"].shape)

        # print("=" * 60)

        self._loaded = True

        print("✅ DeiT + AG-GELU model loaded successfully")

    # ------------------------------------------------------------------
    # Integration point #2: preprocessing (must match training exactly)
    # ------------------------------------------------------------------
    def _preprocess(self, image: Image.Image):
        """
        Resize to MODEL_INPUT_SIZE x MODEL_INPUT_SIZE and normalize.
        Uses ImageNet stats as a placeholder default for DeiT — update to
        match whatever normalization your checkpoint was trained with.
        """
        import torch
        from torchvision import transforms

        transform = transforms.Compose(
            [
                transforms.Resize((self.input_size, self.input_size)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ]
        )
        tensor = transform(image.convert("RGB"))
        tensor = cast("torch.Tensor", tensor)
        tensor = torch.unsqueeze(tensor, 0)
        return tensor.to(self._device)

    # ------------------------------------------------------------------
    # Integration point #3: forward pass
    # ------------------------------------------------------------------
    def predict(self, image: Image.Image) -> dict:
        """
        Runs inference and returns:
        {predicted_class, confidence, probabilities: {cls: prob}, inference_time_ms}
        Raises ModelNotLoadedError if the checkpoint hasn't been wired up yet.
        """
        if not self._loaded or self._model is None:
            raise ModelNotLoadedError(
                "DeiT + AG-GELU checkpoint is not loaded yet. "
                "Place the trained weights at settings.MODEL_PATH and complete "
                "app/services/model_service.py's load()/predict() integration."
            )

        import torch

        start = time.perf_counter()
        tensor = self._preprocess(image)

        with torch.no_grad():
            #logits = self._model(tensor)
            #outputs = self._model(tensor)
            outputs = self._model(
                pixel_values=tensor,
                output_attentions=True
            )

            print("Has attentions:", outputs.attentions is not None)
            print("Shape of first attention:", outputs.attentions[0].shape)

            if outputs.attentions and len(outputs.attentions) > 0:
                self._last_attention_maps = [
                    att.detach().cpu().numpy()
                    for att in outputs.attentions
                ]
            else:
                self._last_attention_maps = None


            logits = outputs.logits
            probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

        elapsed_ms = (time.perf_counter() - start) * 1000

        top_idx = int(np.argmax(probs))
        return {
            "predicted_class": self.class_names[top_idx],
            "confidence": float(probs[top_idx]),
            "probabilities": {cls: float(p) for cls, p in zip(self.class_names, probs)},
            "inference_time_ms": round(elapsed_ms, 2),
        }

    def get_last_attention_maps(self):
        return self._last_attention_maps


# Singleton instance used across the app (loaded once in main.py's lifespan).
model_service = DermaScanModel()
