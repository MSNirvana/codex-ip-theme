# User options

## Required

| Input | Meaning |
|---|---|
| IP image | PNG, JPEG, or WebP attachment/path used as the character artwork |

## Optional

| Option | Default | Notes |
|---|---|---|
| Theme name | Image filename | Appears in the runtime badge |
| Accent | Dominant brand color or `#ff2823` | Focus ring, links, calibration line |
| Background | `#fcfcfa` | Main content canvas |
| Sidebar | `#f0f0ed` | Left navigation surface |
| Foreground | `#111111` | Main text and borders |
| Placement | Both | Sidebar watermark, composer character, or both |
| Crop | Automatic/agent-selected | Use `x,y,width,height` for contact sheets |
| Background removal | Edge-connected | Choose `none` for existing transparency |
| Output folder | Workspace theme slug | Must not overwrite unrelated files |

## Dynamic image behavior

The generated injector hashes `theme/config.json`, `theme/theme.css`, and both image files every 1.5 seconds. Changed bytes trigger reinjection into connected Codex renderer pages. Updating an image does not require repacking the app.

Use `scripts/update_theme_image.py` from this skill to replace an image while preserving the theme project and configuration.

## Crop guidance

- Prefer one complete pose with clear silhouette and visible brand features.
- Leave 3–8% breathing room around extremities before background removal.
- Use a seated/working pose near the composer and a standing pose in the sidebar when available.
- Avoid text labels from contact sheets.
- Separate crops are optional; one image can serve both placements.

## White-background removal tuning

- Start with tolerance `38`, feather `1.25`.
- Reduce tolerance when white clothing becomes transparent through an open contour.
- Increase tolerance when a gray/cream fringe remains.
- Reduce feather when details become soft.
- Preserve shadows only when they help the character sit naturally on the UI.
