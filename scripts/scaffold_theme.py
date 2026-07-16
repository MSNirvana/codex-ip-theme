#!/usr/bin/env python3
"""Create or update a cross-platform Codex runtime IP theme project."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import stat
from pathlib import Path

from PIL import Image, ImageOps

from prepare_image import create_checker_preview, parse_crop, prepare_image


SKILL_ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_ROOT = SKILL_ROOT / "assets" / "runtime-template"


def write_config(output: Path, arguments: argparse.Namespace) -> None:
    theme_id = re.sub(r"[^a-z0-9]+", "-", arguments.name.lower()).strip("-") or "ip-theme"
    config = {
        "schemaVersion": 1,
        "id": theme_id[:64],
        "name": arguments.name,
        "badge_text": arguments.badge_text or f"{arguments.name} 模式",
        "accent": arguments.accent,
        "background": arguments.background_color,
        "sidebar": arguments.sidebar_color,
        "foreground": arguments.foreground,
        "sidebar_image": "assets/ip-sidebar.png",
        "composer_image": "assets/ip-composer.png",
        "hero_image": "assets/ip-hero.png",
        "sidebar_image_width": arguments.sidebar_width,
        "sidebar_image_opacity": arguments.sidebar_opacity,
        "composer_image_width": arguments.composer_width,
        "composer_image_opacity": arguments.composer_opacity,
        "hero_title": arguments.hero_title,
        "hero_subtitle": arguments.hero_subtitle,
        "brand_subtitle": arguments.brand_subtitle,
        "status_text": arguments.status_text,
        "hero_signal": arguments.hero_signal,
        "hero_position": arguments.hero_position,
        "task_wallpaper_opacity": arguments.task_wallpaper_opacity,
        "toggle_shortcut": "Command/Ctrl+Shift+L",
    }
    config_path = output / "theme" / "config.json"
    config_path.parent.mkdir(parents=True, exist_ok=True)
    config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def prepare_hero(source: Path, destination: Path) -> dict[str, object]:
    """Preserve a rectangular scene as Hero artwork; never remove its background."""
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGBA" if "A" in opened.getbands() else "RGB")
        original_size = image.size
        image.thumbnail((2400, 1600), Image.Resampling.LANCZOS)
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, format="PNG", optimize=True)
    return {
        "source": str(source),
        "output": str(destination.resolve()),
        "original_size": list(original_size),
        "output_size": list(image.size),
        "background_removed": False,
    }


def make_executable(path: Path) -> None:
    if not path.exists():
        return
    path.chmod(path.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a reusable Codex runtime IP theme")
    parser.add_argument("--image", required=True, type=Path, help="default image for both placements")
    parser.add_argument("--sidebar-image", type=Path)
    parser.add_argument("--composer-image", type=Path)
    parser.add_argument("--hero-image", type=Path, help="rectangular full-scene artwork; background is preserved")
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--name", default="IP")
    parser.add_argument("--badge-text")
    parser.add_argument("--accent", default="#ff2823")
    parser.add_argument("--background-color", default="#fcfcfa")
    parser.add_argument("--sidebar-color", default="#f0f0ed")
    parser.add_argument("--foreground", default="#111111")
    parser.add_argument("--crop", help="x,y,width,height for the default image")
    parser.add_argument("--sidebar-crop", help="x,y,width,height for sidebar image")
    parser.add_argument("--composer-crop", help="x,y,width,height for composer image")
    parser.add_argument("--remove-background", choices=("edge", "color", "none"), default="edge")
    parser.add_argument("--background", default="auto")
    parser.add_argument("--tolerance", type=float, default=38.0)
    parser.add_argument("--feather", type=float, default=1.25)
    parser.add_argument("--sidebar-width", type=int, default=68)
    parser.add_argument("--sidebar-opacity", type=float, default=0.28)
    parser.add_argument("--composer-width", type=int, default=88)
    parser.add_argument("--composer-opacity", type=float, default=0.96)
    parser.add_argument("--hero-title", default="我们该构建什么？")
    parser.add_argument("--hero-subtitle", default="把复杂问题拆开，用代码重新连接。")
    parser.add_argument("--brand-subtitle", default="CODEX IP THEME · CREATIVE WORKSTATION")
    parser.add_argument("--status-text", default="SYSTEM ONLINE · THINK · BUILD · SHIP")
    parser.add_argument("--hero-signal", default="∞ LASER EYES ONLINE")
    parser.add_argument("--hero-position", choices=("left", "center", "right"), default="center")
    parser.add_argument("--task-wallpaper-opacity", type=float, default=0.14)
    parser.add_argument("--force", action="store_true")
    arguments = parser.parse_args()

    color_pattern = re.compile(r"^#[0-9a-fA-F]{6}$")
    for key in ("accent", "background_color", "sidebar_color", "foreground"):
        if not color_pattern.fullmatch(getattr(arguments, key)):
            parser.error(f"--{key.replace('_', '-')} must be a six-digit hex color")
    if not 0 <= arguments.sidebar_opacity <= 1 or not 0 <= arguments.composer_opacity <= 1:
        parser.error("image opacity must be between 0 and 1")
    if not 0 <= arguments.task_wallpaper_opacity <= 0.5:
        parser.error("--task-wallpaper-opacity must be between 0 and 0.5")
    if not 24 <= arguments.sidebar_width <= 400 or not 24 <= arguments.composer_width <= 400:
        parser.error("image width must be between 24 and 400 pixels")
    if len(arguments.name.strip()) == 0 or len(arguments.name) > 80:
        parser.error("theme name must contain 1–80 characters")

    output = arguments.output.resolve()
    if output.exists() and any(output.iterdir()) and not arguments.force:
        parser.error(f"output is not empty: {output}; pass --force to update generated files")

    output.mkdir(parents=True, exist_ok=True)
    shutil.copytree(TEMPLATE_ROOT, output, dirs_exist_ok=True)

    default_crop = parse_crop(arguments.crop)
    sidebar_source = (arguments.sidebar_image or arguments.image).resolve()
    composer_source = (arguments.composer_image or arguments.image).resolve()
    hero_source = arguments.hero_image.resolve() if arguments.hero_image else None
    sources = {sidebar_source, composer_source}
    if hero_source:
        sources.add(hero_source)
    for source in sources:
        if not source.is_file():
            parser.error(f"image not found: {source}")
        if source.stat().st_size > 50 * 1024 * 1024:
            parser.error(f"source image is larger than 50 MB: {source}")
    sidebar_crop = parse_crop(arguments.sidebar_crop) or default_crop
    composer_crop = parse_crop(arguments.composer_crop) or default_crop

    shared = sidebar_source == composer_source and sidebar_crop == composer_crop
    sidebar_result = prepare_image(
        sidebar_source,
        output / "assets" / "ip-sidebar.png",
        crop=sidebar_crop,
        method=arguments.remove_background,
        background=arguments.background,
        tolerance=arguments.tolerance,
        feather=arguments.feather,
        square=False,
    )
    if shared:
        shutil.copy2(output / "assets" / "ip-sidebar.png", output / "assets" / "ip-composer.png")
        composer_result = {**sidebar_result, "output": str((output / "assets" / "ip-composer.png").resolve())}
    else:
        composer_result = prepare_image(
            composer_source,
            output / "assets" / "ip-composer.png",
            crop=composer_crop,
            method=arguments.remove_background,
            background=arguments.background,
            tolerance=arguments.tolerance,
            feather=arguments.feather,
            square=False,
        )

    hero_result = prepare_hero(hero_source or (output / "assets" / "ip-sidebar.png"), output / "assets" / "ip-hero.png")

    write_config(output, arguments)
    create_checker_preview(
        Image.open(output / "assets" / "ip-sidebar.png").convert("RGBA"),
        output / "ip-transparency-preview.png",
    )
    for relative in (
        "scripts/start-macos.sh",
        "scripts/remove-theme.sh",
        "启动主题.command",
        "移除主题.command",
        "验证主题.command",
    ):
        make_executable(output / relative)

    print(
        json.dumps(
            {
                "output": str(output),
                "config": str(output / "theme" / "config.json"),
                "sidebar": sidebar_result,
                "composer": composer_result,
                "hero": hero_result,
                "mac_launcher": str(output / "启动主题.command"),
                "windows_launcher": str(output / "启动主题.cmd"),
                "transparency_preview": str(output / "ip-transparency-preview.png"),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
