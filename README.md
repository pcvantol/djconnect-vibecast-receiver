# DJConnect VibeCast Receiver

Static Google Cast Custom Web Receiver for DJConnect VibeCast.

The receiver contains no user API, analytics, storage, Home Assistant pairing
credential or proxy. A paired Apple sender provides one runtime-scoped,
read-only handoff via the Cast custom message channel. The receiver then
connects directly to the user's reachable Home Assistant instance.

Cloudflare Pages hosts only this static code. It is intentionally deployed and
released independently from the DJConnect marketing website.

The current receiver is an exact import of Core's shared renderer build 1.0.0.
Run `npm run import:core`, `npm run verify:core` and `npm test` offline.
See [pinned adoption, compatibility and effect gates](docs/CAST_ADOPTION.md).
Generated `wwwroot/index.html` must never be hand-edited. Source adoption does
not establish Pages, real CAF, physical Cast or Apple-sender acceptance.
