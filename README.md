# DJConnect VibeCast Receiver

Central VibeCast.tv bootstrap and independently pinned Google Cast receiver distribution.

The bootstrap lives in `bootstrap/` and builds to `dist/bootstrap`; Cast remains
in `wwwroot`. See [bootstrap build, contracts, tests and publication gates](docs/WEB_BOOTSTRAP.md).
No rendezvous producer is qualified yet: production explicitly shows connecting
is unavailable, without a QR or simulated pairing.

The receiver contains no user API, analytics, storage, Home Assistant pairing
credential or proxy. A paired Apple sender provides one runtime-scoped,
read-only handoff via the Cast custom message channel. The receiver then
connects directly to the user's reachable Home Assistant instance.

Cloudflare Pages hosts only this static code. It is intentionally deployed and
released independently from the DJConnect marketing website.

The current receiver source is an exact import of Core's shared renderer build 1.1.0.
Run `npm run import:core`, `npm run verify:core` and `npm test` offline.
See [pinned adoption, compatibility and effect gates](docs/CAST_ADOPTION.md).
Generated `wwwroot/index.html` must never be hand-edited. Source adoption does
not establish Pages, real CAF, physical Cast or Apple-sender acceptance.

See [1.1.0 status adoption and publication boundary](docs/CAST_STATUS_ADOPTION_1_1.md).

The readonly retirement import from protected Core `6a3adbc8` removes the obsolete
Session-end control while retaining build/status wire 1.1.0. See
[exact pins, qualification and promotion boundaries](docs/CAST_READONLY_RETIREMENT.md).
