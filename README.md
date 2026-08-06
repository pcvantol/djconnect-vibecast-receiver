# DJConnect VibeCast Receiver

Static Google Cast Custom Web Receiver for DJConnect VibeCast.

The receiver contains no user API, analytics, storage, Home Assistant pairing
credential or proxy. A paired Apple sender provides one runtime-scoped,
read-only handoff via the Cast custom message channel. The receiver then
connects directly to the user's reachable Home Assistant instance.

Cloudflare Pages hosts only this static code. It is intentionally deployed and
released independently from the DJConnect marketing website.
