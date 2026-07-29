import torch.nn as nn
from transformers import AutoModelForImageClassification
from transformers.utils import logging
from transformers.activations import GELUActivation

from app.services.activations import AGGELU


HF_MODEL_NAME = "facebook/deit-base-patch16-224"


def replace_ag_gelu(module):
    total = 0

    for name, child in module.named_children():

        if isinstance(child, GELUActivation):
            setattr(module, name, AGGELU())
            total += 1

        else:
            total += replace_ag_gelu(child)

    return total


def build_deit_ag_gelu(num_classes: int):
    logging.set_verbosity_error()

    model = AutoModelForImageClassification.from_pretrained(
        HF_MODEL_NAME,
        num_labels=num_classes,
        ignore_mismatched_sizes=True,
        output_attentions=True,
        attn_implementation="eager",
        local_files_only=True
    )

    #total = replace_ag_gelu(model)

    #print(f"AG-GELU replacements: {total}")
    total = replace_ag_gelu(model)

    print("=" * 60)
    print("AG-GELU replacements:", total)
    print("=" * 60)

    return model