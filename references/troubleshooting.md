# Troubleshooting

## Theme does not appear

1. Confirm the app process includes `--remote-debugging-port=9229` or the configured port.
2. Confirm `http://127.0.0.1:<port>/json/list` exposes an `app://-/index.html` page.
3. Confirm the launcher output contains `[injected]`.
4. If the app was already open without the port, quit it completely and relaunch through the generated launcher.
5. If the renderer appears late, allow the injector's 30-second startup wait to finish.

## Image still has a white rectangle

- Inspect `ip-transparency-preview.png`, not a viewer that renders transparency as white.
- Confirm `--remove-background edge` was used.
- Increase tolerance gradually by 5–10.
- Ensure the crop border contains actual background around the character.

## White body parts disappear

- Use `edge`, not `color`.
- Reduce tolerance.
- Select a crop where the black outline closes around the white body.

## Windows cannot find the app

Set `CODEX_APP` to the executable path before running the launcher. Store/MSIX paths may be protected; prefer the regular desktop installer when available.

## Node.js is missing

The launchers first use system Node.js, then look for the Node runtime bundled with the desktop app. If neither is present, install Node.js 22+ or update the app path detection for that release.
