# Codex IP Theme Operation Tutorial

## 1. Install

Recommended prompt:

```text
Install the skill from https://github.com/MSNirvana/codex-ip-theme.
```

Manual installation:

```bash
git clone https://github.com/MSNirvana/codex-ip-theme.git ~/.codex/skills/codex-ip-theme
```

Windows PowerShell:

```powershell
git clone https://github.com/MSNirvana/codex-ip-theme.git "$HOME\.codex\skills\codex-ip-theme"
```

Restart Codex or open a new task.

## 2. Prepare Artwork

PNG, JPEG, and WebP are supported. Prefer artwork with a clear silhouette and a small amount of background around the character. White, gray, and other near-solid backgrounds work best.

Contact sheets are supported, but Codex should select crop coordinates for a specific pose. A working/seated pose usually fits the composer, while a standing pose fits the sidebar.

When available, use a separate landscape scene as the Hero. A 16:9 image with a visually quiet side for title copy works best.

Only use artwork you are authorized to use.

## 3. Generate a Theme

Attach an image and prompt:

```text
Use $codex-ip-theme. Remove the white background from the first character image. Preserve the second landscape image as the home Hero. Create a flagship macOS and Windows theme named "My IP" with #ff2823 as the accent.
```

Default colors are `#fcfcfa` for the main background, `#f0f0ed` for the sidebar, and `#111111` for foreground text. The same prepared character is used in both placements unless separate poses are supplied. The native home suggestions are arranged over the Hero; without a separate scene, the transparent character is reused.

Inspect `ip-transparency-preview.png` before launching. The checkerboard represents transparency.

## 4. Launch

### macOS

1. Save your work and quit Codex with `Command+Q`.
2. Double-click `启动主题.command` in the generated project.
3. Keep the Terminal window open.
4. Wait for the `[injected]` message.

The launcher verifies the `com.openai.codex` bundle identifier, the official application signature, the signed bundled Node runtime, and loopback-only CDP access.

### Windows

1. Save your work and quit Codex completely.
2. Double-click `启动主题.cmd`.
3. Keep the command window open.

The launcher checks standard install locations and then uses `Get-AppxPackage OpenAI.Codex` to discover the Store package. Set `CODEX_APP` to the complete executable path when automatic discovery is unavailable.

## 5. Verify

Run `验证主题.command` on macOS or `验证主题.cmd` on Windows.

Verification requires the theme style, non-interactive decorative layer, native sidebar, native composer, both character placements, and no horizontal overflow. On the home route it also requires a visible Hero, 2–6 native suggestion buttons, and the real project selector. A successful run writes `theme-verification.png`.

## 6. Replace an Image Dynamically

Attach a replacement image and prompt:

```text
Use $codex-ip-theme to replace the sidebar character in my generated theme while keeping its colors.
```

CLI equivalent:

```bash
<python> <skill-dir>/scripts/update_theme_image.py \
  --project <generated-theme-directory> \
  --image <replacement-image> \
  --placement sidebar
```

Placement can be `sidebar`, `composer`, `both`, `hero`, or `all`. Hero replacement preserves the complete rectangular background; character placements use background removal. A running injector reapplies changed image bytes automatically.

## 7. Tune Background Removal

- White body regions disappear: use `edge` and lower tolerance.
- A white fringe remains: increase tolerance in steps of 5–10.
- Edges are too soft: lower feathering.
- Limbs are clipped: expand the crop by 3%–8%.
- Complex photographic background: use a separate local segmentation or image-editing tool instead of extreme tolerance values.

## 8. Customize the Generated Project

Edit `theme/config.json` to change colors, image width/opacity, Hero title/subtitle, brand copy, Hero alignment, and task-wallpaper opacity. Edit `theme/theme.css` to change the Hero, card grid, border radius, shadows, sidebar, and composer. A running injector detects those file changes.

## 9. Toggle and Remove

- `Command/Ctrl + Shift + L`: temporary toggle.
- `移除主题.command` / `移除主题.cmd`: remove from the current renderer.
- Launching Codex normally: start without the theme.

The application bundle and `app.asar` remain untouched.

## 10. Troubleshooting

If the original UI remains visible, check for `[injected]` in the launcher window. An already-running Codex process without the debugging port must be fully closed before launching the theme.

API provider configuration is unrelated to rendering. The project does not read or change API keys, Base URLs, model names, or providers.
