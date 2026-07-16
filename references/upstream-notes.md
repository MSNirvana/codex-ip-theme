# Upstream design reference

Architecture was benchmarked against [Fei-Away/Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin), an MIT-licensed loopback-CDP skin project.

Retained design lessons:

- Verify the official macOS app and its bundled signed Node runtime.
- Discover the current Windows Store package rather than hard-code a versioned `WindowsApps` path.
- Validate loopback WebSocket URLs and native Codex renderer markers.
- Keep a watch injector alive for reload and route resilience.
- Provide explicit verify, screenshot, reload, removal, and rollback paths.
- Reject unsafe image paths, invalid colors, oversized images, and non-Codex targets.

Intentional differences:

- Do not change `config.toml`; apply all colors at runtime.
- Generate both platforms from one Skill instead of maintaining separate platform Skills.
- Prepare transparent foreground characters rather than full-width photographic banners.
- Support edge-connected solid-background removal and live asset-byte hot reload.

Do not copy upstream promotional assets or character images into generated themes. Users must supply artwork they are authorized to use.
