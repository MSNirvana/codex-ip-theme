# Security Policy

## Runtime Boundary

Codex IP Theme uses Chrome DevTools Protocol to inject CSS and decorative DOM into the official Codex renderer. The endpoint must remain bound to `127.0.0.1`.

CDP is locally privileged and unauthenticated while active. Use it only on a trusted machine, keep untrusted local software closed, and never change the bind address to `0.0.0.0` or expose the port through a tunnel or firewall rule.

## Project Guardrails

- Never modify `app.asar`, the official application bundle, WindowsApps ownership, or code signatures.
- Never read or transmit authentication tokens, cookies, API keys, browser storage, or model-provider configuration.
- Reject non-loopback WebSocket URLs and renderer pages without expected Codex shell markers.
- Keep decorative layers at `pointer-events: none`.
- Use the official signed bundled Node runtime on macOS.
- Treat user artwork as local input and do not upload it to external services without explicit authorization.

## Reporting a Vulnerability

Open a private GitHub security advisory for the repository when available. Do not publish credentials, tokens, personal screenshots, or exploitable details in a public issue.
