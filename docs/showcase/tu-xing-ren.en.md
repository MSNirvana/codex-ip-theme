# Case Study: Tu Xing Ren Flagship Codex Theme

[中文案例](tu-xing-ren.zh-CN.md) · [Back to English README](../../README.en.md)

This is the first complete flagship case for `codex-ip-theme`. The goal was to carry the Tu Xing Ren identity across the Codex home, suggestion cards, composer, sidebar, and task route while keeping every native control usable.

> The repository contains runtime screenshots only. Original character and scene assets are not included.

## Final Result

### Home workstation

![Tu Xing Ren flagship home](../assets/showcase/tu-xing-ren-home.png)

The full landscape GGOO scene becomes the Hero. A white gradient creates a readable copy area on the left while characters, Lego structures, and red infinity eyes remain visible on the right. The four native suggestion cards stay clickable.

### Task route

![Tu Xing Ren task route](../assets/showcase/tu-xing-ren-task.png)

The same scene is reused at `0.12` opacity with a white mask. Messages, file cards, diffs, side panels, and the composer retain their native contrast.

## From Artwork to Runtime Theme

| Stage | Input / treatment | Result |
|---|---|---|
| Character extraction | Crop one complete pose and use edge-connected removal | Transparent PNG while preserving the white body and dark outline |
| Hero scene | Preserve the entire 16:9 scene without background removal | The complete GGOO environment enters the home route |
| Home composition | Detect the real home route and native suggestions | Hero, cards, project selection, and composer form one workstation |
| Task route | Apply a separate route class and restrained wallpaper | Brand continuity without reducing content contrast |
| Dynamic updates | Hash config, CSS, character assets, and Hero bytes | Changes reapply in about two seconds without repackaging Codex |

## Improvements Captured by the Skill

1. Use separate pipelines for transparent character art and full rectangular Hero scenes.
2. Build around the real Codex DOM; never cover the app with a fake screenshot.
3. Keep home and task route classes mutually exclusive with `classList.toggle`.
4. Use semantic selector fallbacks for home detection and project selection.
5. Inspect computed element bounds to catch native negative margins and composer/card overlap.
6. Protect live controls first in responsive layouts; hide decoration before compressing interaction.
7. Validate the Hero, 2–6 native cards, project selector, composer, sidebar, and overflow—not just CSS injection.

The reusable details now live in `references/flagship-patterns.md`.

## Verification

| Check | Result |
|---|---|
| Hero bounds | `1152 × 650` |
| Native suggestions | Four, visible and clickable |
| Project selector | Visible with its native menu intact |
| Composer | Focusable with native permission and model controls intact |
| Task route | Wallpaper visible; text and file cards remain clear |
| Reload | Theme restores automatically |
| Responsive widths | No horizontal overflow at 1180 / 900 / 640px |
| Decoration layer | `pointer-events: none` |

The Windows launchers and scripts passed static checks; these case screenshots were captured on macOS.

## Reuse the Pattern

```text
Use $codex-ip-theme. The first image is a character sheet: select and cut out one complete pose. Preserve the second landscape image as the home Hero. Generate a flagship macOS and Windows theme, then verify native home cards, project selection, the composer, task readability, and responsive behavior.
```
