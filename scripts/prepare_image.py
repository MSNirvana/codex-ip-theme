#!/usr/bin/env python3
"""Prepare an IP/mascot image for Codex runtime theme injection.

The default edge-connected algorithm removes a solid or near-solid background
without deleting light areas enclosed by the character outline.
"""

from __future__ import annotations

import argparse
import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def parse_crop(value: str | None) -> tuple[int, int, int, int] | None:
    if not value:
        return None
    parts = [int(part.strip()) for part in value.split(",")]
    if len(parts) != 4 or parts[2] <= 0 or parts[3] <= 0:
        raise argparse.ArgumentTypeError("crop must be x,y,width,height")
    return parts[0], parts[1], parts[2], parts[3]


def parse_hex_color(value: str) -> tuple[int, int, int]:
    normalized = value.strip().lstrip("#")
    if len(normalized) == 3:
        normalized = "".join(character * 2 for character in normalized)
    if len(normalized) != 6:
        raise ValueError(f"invalid color: {value}")
    return tuple(int(normalized[index : index + 2], 16) for index in (0, 2, 4))


def border_pixels(rgb: np.ndarray, band: int) -> np.ndarray:
    height, width, _ = rgb.shape
    band = max(1, min(band, height // 4, width // 4))
    return np.concatenate(
        [
            rgb[:band, :, :].reshape(-1, 3),
            rgb[-band:, :, :].reshape(-1, 3),
            rgb[band:-band, :band, :].reshape(-1, 3),
            rgb[band:-band, -band:, :].reshape(-1, 3),
        ],
        axis=0,
    )


def estimate_background(rgb: np.ndarray) -> tuple[int, int, int]:
    band = max(2, round(min(rgb.shape[:2]) * 0.015))
    samples = border_pixels(rgb, band)
    # Median resists dark borders, text and contact-sheet separators.
    median = np.median(samples, axis=0)
    return tuple(int(round(channel)) for channel in median)


def connected_background(candidate: np.ndarray) -> np.ndarray:
    """Return candidate pixels connected to any image edge using 4-neighbours."""
    height, width = candidate.shape
    visited = np.zeros((height, width), dtype=np.bool_)
    queue: deque[int] = deque()

    def seed(y: int, x: int) -> None:
        if candidate[y, x] and not visited[y, x]:
            visited[y, x] = True
            queue.append(y * width + x)

    for x in range(width):
        seed(0, x)
        seed(height - 1, x)
    for y in range(1, height - 1):
        seed(y, 0)
        seed(y, width - 1)

    while queue:
        index = queue.popleft()
        y, x = divmod(index, width)
        if x > 0 and candidate[y, x - 1] and not visited[y, x - 1]:
            visited[y, x - 1] = True
            queue.append(index - 1)
        if x + 1 < width and candidate[y, x + 1] and not visited[y, x + 1]:
            visited[y, x + 1] = True
            queue.append(index + 1)
        if y > 0 and candidate[y - 1, x] and not visited[y - 1, x]:
            visited[y - 1, x] = True
            queue.append(index - width)
        if y + 1 < height and candidate[y + 1, x] and not visited[y + 1, x]:
            visited[y + 1, x] = True
            queue.append(index + width)

    return visited


def make_alpha(
    rgba: np.ndarray,
    background: tuple[int, int, int],
    tolerance: float,
    method: str,
    feather: float,
) -> np.ndarray:
    rgb = rgba[:, :, :3].astype(np.float32)
    source_alpha = rgba[:, :, 3].astype(np.float32) / 255.0
    background_array = np.asarray(background, dtype=np.float32)
    distance = np.sqrt(np.sum((rgb - background_array) ** 2, axis=2))
    candidate = distance <= tolerance

    if method == "edge":
        remove = connected_background(candidate)
    elif method == "color":
        remove = candidate
    elif method == "none":
        return rgba[:, :, 3]
    else:
        raise ValueError(f"unsupported method: {method}")

    hard_mask = np.where(remove, 0, 255).astype(np.uint8)
    mask_image = Image.fromarray(hard_mask, mode="L")
    if feather > 0:
        mask_image = mask_image.filter(ImageFilter.GaussianBlur(radius=feather))
    mask = np.asarray(mask_image, dtype=np.float32) / 255.0
    return np.clip(mask * source_alpha * 255.0, 0, 255).astype(np.uint8)


def decontaminate_edges(
    rgba: np.ndarray,
    alpha: np.ndarray,
    background: tuple[int, int, int],
) -> np.ndarray:
    result = rgba.copy()
    a = alpha.astype(np.float32) / 255.0
    edge = (a > 0.02) & (a < 0.98)
    if not np.any(edge):
        result[:, :, 3] = alpha
        return result

    background_array = np.asarray(background, dtype=np.float32)
    colors = rgba[:, :, :3].astype(np.float32)
    safe_alpha = np.maximum(a, 0.02)[:, :, None]
    recovered = (colors - (1.0 - a[:, :, None]) * background_array) / safe_alpha
    recovered = np.clip(recovered, 0, 255)
    result[:, :, :3][edge] = recovered[edge].astype(np.uint8)
    result[:, :, 3] = alpha
    return result


def trim_and_pad(image: Image.Image, padding: int, square: bool) -> tuple[Image.Image, tuple[int, int, int, int]]:
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        raise ValueError("background removal produced an empty image")

    left, top, right, bottom = bounds
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    cropped = image.crop((left, top, right, bottom))

    if square:
        size = max(cropped.width, cropped.height)
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        canvas.alpha_composite(cropped, ((size - cropped.width) // 2, (size - cropped.height) // 2))
        cropped = canvas

    return cropped, (left, top, right, bottom)


def resize_max(image: Image.Image, max_size: int) -> Image.Image:
    if max(image.size) <= max_size:
        return image
    scale = max_size / max(image.size)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    return image.resize(size, Image.Resampling.LANCZOS)


def create_checker_preview(image: Image.Image, output_path: Path, cell: int = 18) -> None:
    width, height = image.size
    y, x = np.indices((height, width))
    checker = ((x // cell + y // cell) % 2).astype(np.uint8)
    light = np.array([238, 238, 238], dtype=np.uint8)
    dark = np.array([190, 190, 190], dtype=np.uint8)
    rgb = np.where(checker[:, :, None] == 0, light, dark)
    background = Image.fromarray(rgb, mode="RGB").convert("RGBA")
    background.alpha_composite(image)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    background.save(output_path, format="PNG", optimize=True)


def prepare_image(
    input_path: Path,
    output_path: Path,
    *,
    crop: tuple[int, int, int, int] | None = None,
    method: str = "edge",
    background: str = "auto",
    tolerance: float = 38.0,
    feather: float = 1.25,
    padding: int = 20,
    square: bool = False,
    max_size: int = 1024,
) -> dict[str, object]:
    image = Image.open(input_path).convert("RGBA")
    source_size = image.size

    if crop:
        x, y, width, height = crop
        if x < 0 or y < 0 or x + width > image.width or y + height > image.height:
            raise ValueError(f"crop {crop} exceeds image bounds {image.size}")
        image = image.crop((x, y, x + width, y + height))

    rgba = np.asarray(image, dtype=np.uint8).copy()
    background_rgb = estimate_background(rgba[:, :, :3]) if background == "auto" else parse_hex_color(background)
    alpha = make_alpha(rgba, background_rgb, tolerance, method, feather)
    prepared = Image.fromarray(decontaminate_edges(rgba, alpha, background_rgb), mode="RGBA")
    prepared, content_bounds = trim_and_pad(prepared, padding, square)
    prepared = resize_max(prepared, max_size)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    prepared.save(output_path, format="PNG", optimize=True)

    prepared_alpha = np.asarray(prepared.getchannel("A"), dtype=np.uint8)
    transparent_ratio = float(np.mean(prepared_alpha == 0))
    translucent_ratio = float(np.mean((prepared_alpha > 0) & (prepared_alpha < 255)))
    result = {
        "input": str(input_path.resolve()),
        "output": str(output_path.resolve()),
        "source_size": source_size,
        "crop": crop,
        "background": "#%02x%02x%02x" % background_rgb,
        "method": method,
        "tolerance": tolerance,
        "feather": feather,
        "content_bounds": content_bounds,
        "output_size": prepared.size,
        "transparent_ratio": round(transparent_ratio, 4),
        "translucent_ratio": round(translucent_ratio, 4),
    }
    return result


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Remove a solid/white background from an IP image")
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--crop", help="x,y,width,height before background removal")
    parser.add_argument("--method", choices=("edge", "color", "none"), default="edge")
    parser.add_argument("--background", default="auto", help="auto or a hex color such as #ffffff")
    parser.add_argument("--tolerance", type=float, default=38.0)
    parser.add_argument("--feather", type=float, default=1.25)
    parser.add_argument("--padding", type=int, default=20)
    parser.add_argument("--square", action="store_true")
    parser.add_argument("--max-size", type=int, default=1024)
    parser.add_argument("--preview", type=Path, help="optional checkerboard preview path")
    return parser


def main() -> None:
    arguments = build_parser().parse_args()
    result = prepare_image(
        arguments.input,
        arguments.output,
        crop=parse_crop(arguments.crop),
        method=arguments.method,
        background=arguments.background,
        tolerance=arguments.tolerance,
        feather=arguments.feather,
        padding=arguments.padding,
        square=arguments.square,
        max_size=arguments.max_size,
    )
    if arguments.preview:
        create_checker_preview(Image.open(arguments.output).convert("RGBA"), arguments.preview)
        result["preview"] = str(arguments.preview.resolve())
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
