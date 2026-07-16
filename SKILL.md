---
name: codex-ip-theme
description: Create, update, and validate non-destructive Codex/ChatGPT desktop runtime themes for macOS and Windows from user-provided IP, mascot, character, or brand images. Use when a user asks to skin or restyle the Codex desktop app, turn an uploaded image into a reusable Codex theme, remove a white or solid image background, generate transparent PNG theme assets, support dynamically replaceable theme images, or package Mac and Windows launchers without modifying app.asar.
---

# Codex IP Theme

Generate a self-contained runtime theme project that injects CSS and transparent IP artwork through a localhost-only Electron debugging connection. Never modify the installed application bundle.

## Inputs

Require only one image. A second rectangular scene image unlocks the flagship Hero layout. Use these defaults unless the user specifies otherwise:

- Theme name: source filename stem.
- Accent: derive from the strongest brand color; fall back to `#ff2823`.
- Background/sidebar/foreground: `#fcfcfa`, `#f0f0ed`, `#111111`.
- Placement: the prepared transparent character in the sidebar and above the composer.
- Hero: preserve a supplied rectangular scene/background; otherwise reuse the prepared character on the flagship canvas.
- Home copy: concise title, subtitle, system status, and optional IP/brand label.
- Background removal: `edge` for white or solid backgrounds; `none` for an existing transparent PNG.
- Output: `<workspace>/<theme-slug>-codex-theme/`.

Read `references/user-options.md` only when the user requests advanced colors, placement, cropping, or repeated image updates. Read `references/troubleshooting.md` only when launch or injection fails.
Read `references/upstream-notes.md` only when maintaining the runtime engine or comparing behavior with Codex Dream Skin.

## Workflow

1. Inspect every supplied image with `view_image`. Classify each as character art, rectangular Hero scene, or both. If it is a contact sheet, select one or two coherent character crops. Ask only when multiple choices would materially change the requested identity.
2. Call `codex_app__load_workspace_dependencies` and use its Python executable so Pillow and NumPy are available on both macOS and Windows. Fall back to system Python only after verifying `PIL` and `numpy` imports.
3. For a white/solid background, use edge-connected removal. This preserves enclosed white areas inside an outlined character. Do not use global color removal when the character itself contains the background color.
4. Run `scripts/scaffold_theme.py` with the character image, optional `--hero-image`, output directory, theme name, copy, colors, and optional crop coordinates. Never remove the background from the rectangular Hero scene.
5. Inspect `ip-transparency-preview.png`. Reject heavy halos, missing white body regions, clipped limbs, or an opaque border. Adjust `--tolerance`, `--feather`, or crop and rerun with `--force`.
6. Validate generated JavaScript with `node --check`, macOS scripts with `bash -n`, and generated file presence. Do not claim Windows execution was tested unless it ran on Windows.
7. Run the generated verify entry. Require a real sidebar, composer, both character placements, `pointer-events: none`, and no horizontal overflow. On the home route also require a visible Hero, native suggestion buttons, real project selector, and live composer. When practical, test injection in a separate Codex instance with a temporary user-data directory and a non-default debugging port. Do not quit or mutate the user's live instance merely for validation.
8. Inspect both a home screenshot and a normal task screenshot. The home screenshot must read as an authored IP workspace; the task wallpaper must remain restrained enough for code and messages to stay legible.
9. Deliver the generated project, transparency preview, verification screenshots/report, and concise platform launch instructions.

## Create a Theme

Resolve this skill directory, then run:

```bash
<python> <skill-dir>/scripts/scaffold_theme.py \
  --image <image-path> \
  --hero-image <rectangular-scene-path> \
  --output <output-directory> \
  --name <theme-name>
```

Useful arguments:

- `--crop x,y,width,height`
- `--sidebar-image` and `--composer-image` for separate poses
- `--hero-image` for a full rectangular scene; its background is intentionally preserved
- `--sidebar-crop` and `--composer-crop`
- `--remove-background edge|color|none`
- `--background auto|#rrggbb`
- `--tolerance 20..70`
- `--feather 0.5..2.5`
- `--accent`, `--background-color`, `--sidebar-color`, `--foreground`
- `--hero-title`, `--hero-subtitle`, `--brand-subtitle`, `--status-text`, `--hero-signal`
- `--hero-position left|center|right` and `--task-wallpaper-opacity 0..0.5`
- `--force` to update an existing generated project

Use explicit argument arrays or careful quoting for paths containing spaces or non-ASCII characters.

## Update a Dynamic Image

When the user uploads a replacement image, run:

```bash
<python> <skill-dir>/scripts/update_theme_image.py \
  --project <generated-theme-directory> \
  --image <new-image-path> \
  --placement hero
```

Choose `sidebar`, `composer`, `both`, `hero`, or `all`. Character placements use the selected background-removal method; Hero replacement preserves the full rectangular scene. If the theme injector is running, it watches the configuration, CSS, and all image bytes and reapplies changes within about two seconds. “Dynamic” means the user can upload different images across tasks or replace images while the injector runs; it does not send images to a remote service.

## Flagship Visual Rules

- Build around the real Codex DOM. Never replace the window with a screenshot or block native controls.
- Use the Hero image inside the real home route; keep native suggestion buttons, project selection, composer, sidebar, and navigation interactive.
- Put readable copy over the visually quiet side of the Hero. Add a strong gradient when the image competes with text.
- Keep decorative layers and injected images at `pointer-events: none`.
- Give task routes only a low-opacity wallpaper treatment; do not reduce message, code, diff, or composer contrast.
- Add responsive layouts for wide, medium, and narrow windows. At narrow widths, reduce or hide nonessential decorations before compressing live controls.

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
