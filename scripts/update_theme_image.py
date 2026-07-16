#!/usr/bin/env python3
"""Replace one or both images in an existing generated theme project."""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from prepare_image import parse_crop, prepare_image


def main() -> None:
    parser = argparse.ArgumentParser(description="Update runtime theme IP artwork")
    parser.add_argument("--project", required=True, type=Path)
    parser.add_argument("--image", required=True, type=Path)
    parser.add_argument("--placement", choices=("sidebar", "composer", "both"), default="both")
    parser.add_argument("--crop", help="x,y,width,height")
    parser.add_argument("--remove-background", choices=("edge", "color", "none"), default="edge")
    parser.add_argument("--background", default="auto")
    parser.add_argument("--tolerance", type=float, default=38.0)
    parser.add_argument("--feather", type=float, default=1.25)
    arguments = parser.parse_args()

    project = arguments.project.resolve()
    if not (project / "theme" / "config.json").exists():
        parser.error(f"not a generated theme project: {project}")

    temporary = project / "assets" / ".ip-update.png"
    result = prepare_image(
        arguments.image.resolve(),
        temporary,
        crop=parse_crop(arguments.crop),
        method=arguments.remove_background,
        background=arguments.background,
        tolerance=arguments.tolerance,
        feather=arguments.feather,
    )

    destinations = []
    if arguments.placement in ("sidebar", "both"):
        destination = project / "assets" / "ip-sidebar.png"
        shutil.copy2(temporary, destination)
        destinations.append(str(destination))
    if arguments.placement in ("composer", "both"):
        destination = project / "assets" / "ip-composer.png"
        shutil.copy2(temporary, destination)
        destinations.append(str(destination))
    temporary.unlink(missing_ok=True)

    print(json.dumps({"updated": destinations, "image": result}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
