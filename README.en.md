<p align="center">
  <a href="README.md">简体中文</a> · <strong>English</strong>
</p>

<p align="center">
  <img src="assets/icon.svg" width="88" alt="Codex IP Theme">
</p>

<h1 align="center">Codex IP Theme</h1>

<p align="center">
  <strong>Turn your IP into a Codex workstation that actually works.</strong><br>
  Upload character and scene artwork; let Codex handle cutouts, the home Hero, native-control styling, cross-platform launchers, and verification screenshots.
</p>

<p align="center">
  <code>macOS</code> · <code>Windows</code> · <code>Native controls</code> · <code>Live image updates</code> · <code>No app.asar edits</code>
</p>

<p align="center">
  <a href="#build-your-theme-in-three-steps"><strong>Get started</strong></a> ·
  <a href="docs/showcase/tu-xing-ren.en.md">Full case study</a> ·
  <a href="docs/tutorial.en.md">Operation guide</a>
</p>

> Community project, not an official OpenAI product. Themes use a loopback-only runtime injection and do not modify the Codex installation, signatures, authentication, API keys, or model-provider settings.

## See It First

This is not a concept render or a fake screenshot covering the window. It is the Tu Xing Ren flagship theme running inside the real Codex desktop renderer.

![Tu Xing Ren flagship home](docs/assets/showcase/tu-xing-ren-home.png)

Native suggestions, project selection, the composer, and navigation remain interactive. The same identity continues into populated task routes.

<details>
<summary><strong>Expand the task-route screenshot</strong></summary>

![Tu Xing Ren task route](docs/assets/showcase/tu-xing-ren-task.png)

</details>

## What the Skill Does for You

| You provide | The Skill handles | You receive |
|---|---|---|
| One character image | Pose selection, cropping, white/solid background removal | Transparent sidebar and composer characters |
| Optional landscape scene | Full-background preservation, copy mask, home composition | A branded flagship Hero workstation |
| One theme request | Palette, copy, layout, and responsive rules | Editable config and CSS |
| No manual app-path hunting | Platform launcher generation and checks | macOS `.command` + Windows `.cmd` |
| A real Codex renderer | Home, task, reload, and overflow checks | Verification report and screenshots |

One character image is enough to begin. Add a landscape scene to unlock the complete flagship home.

## Build Your Theme in Three Steps

### 1. Install the Skill

Ask Codex:

```text
Install the Skill from https://github.com/MSNirvana/codex-ip-theme.
```

Restart Codex or open a new task after installation.

<details>
<summary>Manual installation</summary>

macOS / Linux:

```bash
git clone https://github.com/MSNirvana/codex-ip-theme.git ~/.codex/skills/codex-ip-theme
```

Windows PowerShell:

```powershell
git clone https://github.com/MSNirvana/codex-ip-theme.git "$HOME\.codex\skills\codex-ip-theme"
```

</details>

### 2. Attach Artwork and Describe the Result

With one character image:

```text
Use $codex-ip-theme to turn this character image into a macOS and Windows Codex theme. Remove the white background automatically and generate verification screenshots.
```

With a character sheet and a landscape scene:

```text
Use $codex-ip-theme. Select and cut out one complete pose from the first character sheet. Preserve the second landscape image as the home Hero. Generate a flagship macOS and Windows theme, then verify native suggestions, project selection, the composer, task readability, and responsive behavior.
```

Theme name, accent, copy, and placements are optional. The Skill can derive a complete first pass from the artwork.

### 3. Launch the Theme

Save your work and quit Codex completely:

| Platform | Launch | Keep running |
|---|---|---|
| macOS | Double-click `启动主题.command` | Terminal window |
| Windows | Double-click `启动主题.cmd` | Command window |

The theme is active when the launcher prints `[injected]`. Press `Command/Ctrl + Shift + L` to toggle between the original and themed appearance.

## More Than a Color Swap

- **Native interaction stays intact:** suggestions, project selection, composer, sidebar, and navigation come from the real Codex DOM.
- **Character and scene art use separate pipelines:** characters become transparent PNGs; landscape Heroes keep their complete backgrounds.
- **Home and task routes have different priorities:** strong identity on home, restrained atmosphere where code and messages must stay readable.
- **Artwork can change live:** character assets, Hero, config, and CSS reapply in about two seconds.
- **The result is reusable:** the Skill generates a standalone project, not a one-off mockup.
- **Verification goes beyond an injection log:** native controls, route transitions, reload persistence, responsive widths, and overflow are checked.

## Case Study: Tu Xing Ren Flagship Workstation

The case combines a character sheet and a 16:9 GGOO scene:

| Design goal | Verified result |
|---|---|
| Branded home | Landscape scene becomes a 650px Hero with readable copy |
| IP recognition | Red infinity eyes, black/white/red palette, linked sidebar/composer characters |
| Native interaction | Four suggestions, project selection, composer, and navigation remain usable |
| Task readability | Same scene appears at `0.12` opacity without obscuring content |
| Responsive behavior | No horizontal overflow at 1180, 900, or 640px |
| Reload persistence | Theme restores automatically after renderer reload |

[Open the complete case study and implementation notes →](docs/showcase/tu-xing-ren.en.md)

## Generated Project

```text
your-theme/
├── assets/
│   ├── ip-sidebar.png
│   ├── ip-composer.png
│   └── ip-hero.png
├── theme/
│   ├── config.json
│   └── theme.css
├── 启动主题.command / .cmd
├── 验证主题.command / .cmd
├── 移除主题.command / .cmd
└── ip-transparency-preview.png
```

Nothing is written into `app.asar`, and the official application is not re-signed.

## Replace Artwork Dynamically

Attach a new image and ask:

```text
Use $codex-ip-theme to replace the home Hero in this generated theme while keeping its existing colors and character placements.
```

Replace `sidebar`, `composer`, `both`, `hero`, or `all` without repackaging Codex.

## Documentation

- [English operation guide](docs/tutorial.en.md)
- [Tu Xing Ren flagship case study](docs/showcase/tu-xing-ren.en.md)
- [Troubleshooting](references/troubleshooting.md)
- [Security policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)
- [中文 README](README.md)

## Compatibility and Boundaries

- macOS: official Codex/ChatGPT desktop app with bundle identifier `com.openai.codex`.
- Windows: OpenAI Codex desktop installer or Store package; scripts discover the installed path.
- Default cutout works best on white, gray, and near-solid backgrounds; complex photography needs a separate segmentation tool.
- Major Codex UI updates may require selector maintenance.
- Windows scripts pass static checks but should still be verified on the target machine.
- CDP binds only to `127.0.0.1`; never expose it through `0.0.0.0`.

## License and Credits

Code is released under the [MIT License](LICENSE). Original user artwork is not included. Tu Xing Ren/GGOO visuals visible in case screenshots are excluded from the MIT grant; see [NOTICE.md](NOTICE.md).

The runtime architecture was benchmarked against the MIT-licensed [Fei-Away/Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin). Theme generation, image preparation, flagship Hero composition, live replacement, verification, and cross-platform project scaffolding are implemented independently in this project.

---

<p align="center">
  <strong>Do not leave your IP inside a single image. Turn it into the Codex workspace you use every day.</strong>
</p>
