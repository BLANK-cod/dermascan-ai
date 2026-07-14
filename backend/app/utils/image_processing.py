from PIL import Image


def is_valid_dermoscopic_image(image: Image.Image, min_dim: int = 64) -> bool:
    """Basic sanity check — real medical-image validation belongs here as needed."""
    width, height = image.size
    return width >= min_dim and height >= min_dim


def to_rgb(image: Image.Image) -> Image.Image:
    return image.convert("RGB") if image.mode != "RGB" else image
