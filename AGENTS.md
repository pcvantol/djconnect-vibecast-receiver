# DJConnect VibeCast Receiver

This repository owns only the static Google Cast Custom Web Receiver runtime.
Read `BOOTSTRAP_CODEX_SESSION.md` before significant work.

The receiver is stateless: no API, analytics, pairing credentials, storage,
proxy or relay. It receives one runtime-scoped handoff and connects directly to
the user's Home Assistant Broadcast WebSocket. Canonical contracts live in
`pcvantol/djconnect/SYNC_PROMPTS.md` and `docs/product/VIBECAST_ARCHITECTURE.md`.
