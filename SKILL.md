---
name: codex-ip-theme
description: Create, update, and validate non-destructive Codex/ChatGPT desktop runtime themes for macOS and Windows from user-provided IP, mascot, character, or brand images. Use when a user asks to skin or restyle the Codex desktop app, turn an uploaded image into a reusable Codex theme, remove a white or solid image background, generate transparent PNG theme assets, support dynamically replaceable theme images, or package Mac and Windows launchers without modifying app.asar.
---

# Codex IP Theme

Generate a self-contained runtime theme project that injects CSS and transparent IP artwork through a localhost-only Electron debugging connection. Never modify the installed application bundle.

## Inputs

Require only one image. Use these defaults unless the user specifies otherwise:

- Theme name: source filename stem.
- Accent: derive from the strongest brand color; fall back to `#ff2823`.
- Background/sidebar/foreground: `#fcfcfa`, `#f0f0ed`, `#111111`.
- Placement: the same prepared image in the sidebar and above the composer.
- Background removal: `edge` for white or solid backgrounds; `none` for an existing transparent PNG.
- Output: `<workspace>/<theme-slug>-codex-theme/`.

Read `references/user-options.md` only when the user requests advanced colors, placement, cropping, or repeated image updates. Read `references/troubleshooting.md` only when launch or injection fails.
Read `references/upstream-notes.md` only when maintaining the runtime engine or comparing behavior with Codex Dream Skin.

## Workflow

1. Inspect the supplied image with `view_image`. If it is a contact sheet, select one or two coherent character crops. Ask only when multiple choices would materially change the requested identity.
2. Call `codex_app__load_workspace_dependencies` and use its Python executable so Pillow and NumPy are available on both macOS and Windows. Fall back to system Python only after verifying `PIL` and `numpy` imports.
3. For a white/solid background, use edge-connected removal. This preserves enclosed white areas inside an outlined character. Do not use global color removal when the character itself contains the background color.
4. Run `scripts/scaffold_theme.py` with the image, output directory, theme name, colors, and optional crop coordinates.
5. Inspect `ip-transparency-preview.png`. Reject heavy halos, missing white body regions, clipped limbs, or an opaque border. Adjust `--tolerance`, `--feather`, or crop and rerun with `--force`.
6. Validate generated JavaScript with `node --check`, macOS scripts with `bash -n`, and generated file presence. Do not claim Windows execution was tested unless it ran on Windows.
7. Run the generated verify entry. Require a real sidebar, composer, both IP images, `pointer-events: none`, and no horizontal overflow. When practical, test injection in a separate Codex instance with a temporary user-data directory and a non-default debugging port. Do not quit or mutate the user's live instance merely for validation.
8. Deliver the generated project, transparency preview, verification screenshot/report, and concise platform launch instructions.

## Create a Theme

Resolve this skill directory, then run:

```bash
<python> <skill-dir>/scripts/scaffold_theme.py \
  --image <image-path> \
  --output <output-directory> \
  --name <theme-name>
```

Useful arguments:

- `--crop x,y,width,height`
- `--sidebar-image` and `--composer-image` for separate poses
- `--sidebar-crop` and `--composer-crop`
- `--remove-background edge|color|none`
- `--background auto|#rrggbb`
- `--tolerance 20..70`
- `--feather 0.5..2.5`
- `--accent`, `--background-color`, `--sidebar-color`, `--foreground`
- `--force` to update an existing generated project

Use explicit argument arrays or careful quoting for paths containing spaces or non-ASCII characters.

## Update a Dynamic Image

When the user uploads a replacement image, run:

```bash
<python> <skill-dir>/scripts/update_theme_image.py \
  --project <generated-theme-directory> \
  --image <new-image-path> \
  --placement both
```

Choose `sidebar`, `composer`, or `both`. If the theme injector is running, it watches the configuration, CSS, and image bytes and reapplies changes within about two seconds. “Dynamic” means the user can upload different images across tasks or replace images while the injector runs; it does not send images to a remote service.

## Background Removal Rules

- Use `edge` for white, gray, or single-color studio backgrounds. It removes only similar pixels connected to the canvas edge.
- Use `color` only when removing that color globally cannot damage the character.
- Use `none` for transparent artwork or when the background is intentionally part of the theme.
- For complex photographic backgrounds, explain that deterministic edge removal is insufficient. Use an available image-editing capability or a locally installed segmentation tool only with the user's authorization; never silently download a model.

Always keep the original uploaded image outside the generated runtime assets. Generate PNG output with alpha and verify it on the checkerboard preview.

## Safety and Compatibility

- Bind debugging only to `127.0.0.1`; never use `0.0.0.0`.
- Do not read browser storage, authentication tokens, cookies, or private app state.
- Do not edit `app.asar`, application signatures, or the installed app.
- If Codex is already running without the debugging port, instruct the user to save work and quit it before using the launcher.
- Treat API provider/model configuration as unrelated to theme injection.
- Expect DOM selectors to need maintenance after major app updates.
