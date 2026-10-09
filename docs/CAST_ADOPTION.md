# Pinned Core Cast adoption

Assignment: `DJC-VIBECAST-CAST-RECEIVER-ADOPTION-V1-20261009`.
Receiver owns distribution only. Core owns every renderer/adapter source byte;
Apple owns `DJC-APPLE-VIBECAST-CAST-SENDER-V1-20261009`. Personal conversations,
archives, search and Profile data remain outside the shared display.

## Import and verification

The reviewed supplying revision is `7460ef5e1d4c15888569b857d7c636620ace7e37`,
protected source merge `b211e5e99235e5862b3befb100dd9e64438f6e80`, producer
Finalization `49137c7af3e3bd9dc53bdd5d8db14f3e99afdaf3`. The supplying revision
in the manifest is deliberately retained after squash merge. The source lock
records the immutable release URL and all external SHA256 pins.

```sh
npm run import:core
npm run verify:core
npm test
```

All three commands are offline. The published archive and unchanged pinned
Core `scripts/build_vibecast.py` are retained under `vendor/core`; the lock
pins both. The original Core MIT license is the same as this repository's MIT
license. The wrapper validates archive identity and every member before
extracting into a fresh temporary directory. It allows exactly three regular
files, no duplicates, links, directories, traversal, extras or files over 1 MiB.
It invokes the original Core CLI `--verify-existing --revision ...
--expected-manifest-sha256 ...`, then copies `cast/index.html` byte-for-byte to
`wwwroot/index.html` and manifest to `wwwroot/vibecast-manifest.json`.
It never executes a render/build function. `--check` validates the entire
supplying bundle and committed distribution bytes and rejects extra webroot
assets. No fetch, deployment or runtime data is part of import.

To obtain the input independently, download the exact `bundle_url` in
`vibecast-source-lock.json` with the existing authorized GitHub account, and run
`python3 scripts/import_vibecast.py --bundle /path/to/download.tar.gz --check`.
The downloaded checksum is validated before extraction. Core verifier provenance:
`https://github.com/pcvantol/djconnect/blob/7460ef5e1d4c15888569b857d7c636620ace7e37/scripts/build_vibecast.py`.
Do not use a mutable main version or edit generated HTML.

A future build requires its own reviewed producer handoff: retain the new
published archive and exact unchanged verifier, update the source lock with
externally supplied revision/hash pins, run import/test/review, and obtain
specific promotion authority. Changing a lock is a trust decision, not an
automatic updater. Git history retains each old archive, verifier, lock and
headers. For rollback, restore those together with both generated output files
from the previously delivered receiver commit, run `npm test`, review the revert
and promote through the same protected/effect route. Before first adoption,
`a901fbcd3e894af62b63fafbca8f96738e08ce3c` is the complete prior receiver tree;
a reviewed full revert to that tree restores its legacy bootstrap/tests.
No force push, unreviewed live rollback or irreversible cleanup is implied.

## Sender and Core contract

CAF uses Google's hosted v3 SDK (not a vendored SDK). Wire namespace:
`urn:x-cast:com.djconnect.vibecast.v1`; JSON handoff `kind:vibecast_handoff`,
`version:1`, `ha_url`, `session_id`, `broadcast_token`. The adapter accepts an
exact HTTPS HA origin without userinfo/path/query/fragment, nonempty Session ID
at most 128 characters and token length 24–256. Additional owner authority,
private data and sender-provided end grants are not forwarded. Locale comes
from the authoritative Session snapshot (browser language before that).
The public receiver URL must contain no HA address, Session or credentials.

Current supported contract is snapshot/event v1 from the pinned producer,
`view_broadcast:true`, `owner_controls:false`, matching snapshot Session and
schema version 1 when explicit. This is not qualification of older HA builds
or an arbitrary version range. The last reported installed HA-dev `69315f43`
predates the cross-origin change and is **not qualified** for this route.
No installation or readback of a new HA version has been performed here.

The HA endpoint must be reachable from the Cast network over trusted HTTPS/WSS;
HA's existing `http.cors_allowed_origins` must include the exact eventual
receiver origin. Browser WS needs this server Origin check, not an invented
credentialed wildcard CORS header. No TLS/auth bypass, central relay, new tunnel,
HA restart or config update is authorized by source import.

Lifecycle: a new handoff invalidates the previous socket/timers/content. Token
errors, incompatible snapshot, host unload/stop and Runtime end clear the
projection; receiver stop has no playback/Session command authority. Network
loss retries with bounded delay. Sender departure is not Runtime end or
explicit receiver stop. CAF default idle policy remains enabled; independent
continuation after departure has no hardware receipt yet. There is no receiver
acknowledgement/status message to the sender in this pinned adapter. An SDK
connect callback therefore cannot prove that HA content is visible.

## Official CAF audit, 2026-10-09

[Google Custom Web Receiver](https://developers.google.com/cast/docs/web_receiver/basic)
documents the hosted SDK, media element and start lifecycle. The bundle supplies
one hidden `castMediaElement`, singleton context, custom listener and start.
It loads no music/media URL.
[Context reference](https://developers.google.com/cast/docs/reference/web_receiver/cast.framework.CastReceiverContext)
documents namespace registration, readiness and stop.
[Receiver options](https://developers.google.com/cast/docs/reference/web_receiver/cast.framework.CastReceiverOptions)
documents custom namespace initialization before start and default JSON type.
This bundle registers its listener before `start({disableIdleTimeout:false})`
but provides no explicit `customNamespaces` map. Actual SDK namespace discovery,
readiness and message delivery must be verified on real CAF; the modeled
listener tests do not resolve that platform behavior. If it fails, send an exact
reproducer to the Core owner for a newly qualified bundle. Never patch this HTML.
[Registration](https://developers.google.com/cast/docs/registration) requires a
registered receiver App ID and test-device admission for unpublished apps.
No Console or account modification has been performed.

## Distribution and effect gate

Only `wwwroot` may be hosted: index plus static public manifest, with `_headers`.
The wildcard header rule covers `/`, `/index.html`, `/index` and metadata:
no-store, no-referrer, nosniff, frame deny, existing HSTS/permissions policy.
No new CSP policy is asserted; no existing CSP was removed. No Functions,
analytics, proxy, storage, CORS authority or credentials are included.

2026-10-09 GitHub readback: hooks[], deployments[], no open receiver PR;
workflows run test/projection with contents:read. Protected main requires strict
`test`, enforces admins, linear history, no force push. These facts **do not**
exclude an external Cloudflare Git integration. Before any push or merge,
inspect the existing Pages project's connected repository, production branch,
preview branch filters, auto-deploy settings, build command/output and domains.
No branch-filter or Git integration setting change should be assumed authorized.
Unknown external triggers mean hold the push, including a draft PR push.

Before promotion, record exact reviewed receiver commit/tree, build/manifest
hashes, Pages project and fixed HTTPS URL, public App ID, deployment effects
(preview/main), specific authority and prior deployment rollback identity.
Read actual `/`, `/index.html` redirect/clean URL and manifest responses: status,
HTML/JSON content types, cache-control/no-referrer/nosniff, CSP if supplied by
host, TLS, no Access challenge, exact bytes and headers after CDN propagation.
No session credentials in probes or public URLs. Verify both old and new browser
loads during promotion; do not claim cache/update behavior from a source rule.

Browser UI automation is currently unavailable because CUA rejects the host's
symlinked CODEX_HOME writable root. No configuration repair was attempted.
Pages project/URL, Cast App ID and hardware have been requested from the owner;
they remain UNKNOWN until authoritative readback. Publication and hardware
approval must name the concrete effects/resources, not a generic continuation.

## Acceptance and evidence labels

| Gate | Current evidence / remaining condition |
| --- | --- |
| BUILD_ADOPTION | Local pinned Core verifier, archive/manifest/renderer/output equality; adversarial importer tests |
| DISTRIBUTION_BROWSER_QUAL | Imported-byte VM/DOM/WS contract tests only; actual browser/network/layout acceptance pending |
| REAL_CAF_QUAL | NOT_RUN; hosted SDK/device launch/message/readiness/idle/shutdown pending |
| PAGES_DEPLOYMENT | NOT_RUN; project/Git triggers/URL/authority/readback missing |
| APPLE_SENDER_QUAL | OPEN; owning registered follow-up, current conversation/history WIP preserved |
| GOOGLE_CAST_TV_QUAL | NOT_RUN; device/AppID/authorized reachable compatible HA missing |
| native macOS | Separate supported sender-route qualification needed |

The Core producer's eleven real isolated TLS/HA/Broadcast/browser sequences are
producer evidence in #10/6081115048 and Core#1101/6081612285. The identical
import preserves those qualified bytes but does not re-run those sequences or
turn modeled CAF into device acceptance.

Joint acceptance starts on the built Apple active DJ-session page: Cast button,
SDK devicepicker, real receiver launch, HA-scoped handoff, snapshot and later
Moments with Persona/two-source attribution/art/progress in landscape/five
languages; reconnect, renewal/expiry, late callbacks, sender departure, explicit
tv stop and Runtime end. Also no device, denied local-network permission,
cancellation, background/resume and Session end during launch. Stop must leave
music/Session unchanged. Record Apple/receiver/Core SHA, public App ID, device,
receiver origin and actual HA installation/config identity. No tokens/private
content in screenshots/logs. Technical senders can only prove receiver/CAF;
Apple end-user acceptance remains separate. LG webOS, Windows retirement and
new capabilities are outside this single delivery.
