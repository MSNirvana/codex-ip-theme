# Codex IP Theme

[简体中文](README.zh-CN.md) · English

Turn an uploaded mascot, character, logo, or brand image into a reusable runtime theme for the Codex desktop app on macOS and Windows.

Codex IP Theme removes simple white or solid backgrounds, generates transparent PNG assets, turns a landscape scene into a full native-home Hero, restyles the real suggestion cards, and scaffolds platform launchers. It injects through a loopback-only Chrome DevTools Protocol connection and does **not** modify `app.asar`, the official application bundle, signatures, authentication, API keys, or model-provider settings.

> Community project. Not an official OpenAI product.

## Features

- One Skill for macOS and Windows.
- One uploaded image is enough; colors and placement are optional.
- An optional landscape scene enables the flagship Hero; without one, the prepared character is reused.
- Native suggestion buttons, project selection, composer, sidebar, and navigation stay live—no fake full-window screenshot.
- Task routes receive a restrained matching wallpaper while code and messages remain readable.
- Edge-connected white-background removal preserves enclosed white body regions.
- Separate sidebar and composer poses are supported.
- Live image, CSS, and configuration hot reload.
- Official Codex renderer-marker checks before injection.
- Loopback WebSocket validation and image/configuration safety checks.
- macOS verification of the official app and its bundled signed Node runtime.
- Windows Store package discovery through `Get-AppxPackage OpenAI.Codex`.
- Generated verify, screenshot, reload, toggle, and restore entries.

## Install the Skill

Ask Codex:

```text
Install the skill from https://github.com/MSNirvana/codex-ip-theme
```

Or clone it manually.

macOS/Linux:

```bash
git clone https://github.com/MSNirvana/codex-ip-theme.git ~/.codex/skills/codex-ip-theme
```

Windows PowerShell:

```powershell
git clone https://github.com/MSNirvana/codex-ip-theme.git "$HOME\.codex\skills\codex-ip-theme"
```

Restart Codex or open a new task after installation.

## Quick Start

Attach an image and prompt:

```text
Use $codex-ip-theme to turn the attached IP image into a Codex theme for macOS and Windows. Remove the white background automatically.
```

Only the character image is required. Optional inputs include a landscape Hero scene, home title/subtitle, theme name, accent/background/sidebar/text colors, crop coordinates, placements, and output directory.

Recommended flagship prompt:

```text
Use $codex-ip-theme. The first image is a character sheet: select and cut out one complete pose. Use the second landscape image as the home Hero and preserve its background. Generate a flagship macOS and Windows theme, then verify native home cards, project selection, the composer, and task-page readability.
```

The Skill generates a standalone theme project. Quit Codex completely, then run:

- macOS: double-click `启动主题.command`.
- Windows: double-click `启动主题.cmd`.
- Temporary toggle: `Command/Ctrl + Shift + L`.
- Validation: double-click `验证主题.command` or `验证主题.cmd`.
- Removal: double-click `移除主题.command` or `移除主题.cmd`.

## Dynamic Images

Upload a replacement image and ask:

```text
Use $codex-ip-theme to replace the home Hero in my generated theme with this landscape image while preserving its background.
```

Replace `sidebar`, `composer`, `both`, `hero`, or `all`. While the injector is running, changes to all image bytes, `theme/config.json`, or `theme/theme.css` are reapplied in about two seconds.

## Documentation

- [English operation tutorial](docs/tutorial.en.md)
- [中文操作教程](docs/tutorial.zh-CN.md)
- [Security policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Requirements and Limitations

- Official Codex/ChatGPT desktop app with bundle identifier `com.openai.codex` on macOS, or the OpenAI Codex desktop package/installer on Windows.
- Image generation uses Python with Pillow and NumPy. Codex desktop workspace runtimes normally provide them.
- Deterministic background removal is designed for solid or near-solid edge-connected backgrounds. Complex photographic backgrounds require a separate local segmentation or image-editing capability.
- Major Codex UI updates may require selector maintenance.
- Windows scripts are generated and statically checked; validate them on the specific Windows installation being used.

## Security

The theme endpoint is intentionally restricted to `127.0.0.1`. CDP is locally privileged while active, so run the theme only on a trusted machine and never change the bind address to `0.0.0.0`. See [SECURITY.md](SECURITY.md).

## License and Credits

Code is released under the [MIT License](LICENSE). User-provided artwork remains under its original owner's license and is not included in this repository.

The runtime architecture was benchmarked against the MIT-licensed [Fei-Away/Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin). See [NOTICE.md](NOTICE.md).
