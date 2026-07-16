# Contributing

Contributions for platform discovery, renderer compatibility, image preparation, accessibility, and documentation are welcome.

## Development Checks

Run the Skill validator:

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py .
```

Compile Python scripts:

```bash
python3 -m py_compile scripts/*.py
```

Check generated JavaScript and macOS shell scripts after scaffolding a sample theme:

```bash
node --check <theme>/src/cdp.mjs
node --check <theme>/src/injector.mjs
node --check <theme>/src/verify.mjs
bash -n <theme>/scripts/*.sh <theme>/*.command
```

Never commit user artwork, personal Codex screenshots, authentication files, `.runtime/` state, API keys, or generated theme verification images.

Keep platform claims explicit: do not claim Windows or macOS live verification unless it ran on that platform.
