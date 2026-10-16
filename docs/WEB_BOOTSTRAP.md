# VibeCast.tv public bootstrap — slice 1

Assignment: DJC-VIBECAST-TV-BOOTSTRAP-CLOUDFLARE-V1-20261015 / [issue16](https://github.com/pcvantol/djconnect-vibecast-receiver/issues/16).
Owning register: #10. Design predecessor: source Core1181/main8a48a6ff,
Finalization1183/main **f32b625eb0a3d1b8abfc2c81378d25d769c6766d**;
[terminal handoff](https://github.com/pcvantol/djconnect-vibecast-receiver/issues/16#issuecomment-6202423207).
Canonical [distribution/trust decisions](https://github.com/pcvantol/djconnect/blob/f32b625eb0a3d1b8abfc2c81378d25d769c6766d/docs/product/VIBECAST_WEB_ENTRY_DISTRIBUTION_V1.md).

## Source and runtime boundary

`bootstrap/src` and `bootstrap/public` build to **dist/bootstrap**, never wwwroot.
The existing Cast1.1 import, vendor, source locks, origin and AppID are unchanged.
Core owns all shared renderer source. No session UI, Worker, D1, backend, analytics,
third-party font/script, storage or HA/owner credentials are implemented here.

The production adapter has no contract and makes no request. The public frontend
shows a clear localized unavailable state, no QR. This is real fail-closed UI,
not a complete rendezvous/onboarding implementation. Successful destination
receipt would only lead to HA; HA's six-digit session admission stays separate.

`BootstrapController` is an **internal semantic consumer seam, not a proposed
wire protocol**. A future separately reviewed, statically imported adapter must
supply create/wait/cancel-by-AbortSignal, challenge validation, destination
verification and exact origin/path/query admission. `contract` is its exact
qualified identity; challenge deadline and boolean QR matrix are internal view
values, not specified API fields. All network/crypto/QR encoding/TTL/endpoint
choices remain producer-owned. No dynamic window adapter, URL-config injection
or dev-fixture switch exists in the public entry. Tests construct explicitly
synthetic, non-scannable matrices; these do not qualify real QR exchange.

The controller retires generations, pending channels and content on new attempts,
expiry, pagehide and terminal results. It rechecks original expiry after each
await and before navigation; reconnect never renews a challenge. A monotonic
bound also prevents wall-clock rollback extending it. Only a verified handoff
may navigate using replace; HTTPS, no userinfo/fragment, exact adapter-owned
origin/path/query validation. Unsolicited query/hash inputs are discarded, never
used for redirection. Verification/network exceptions give recovery without
acceptance; unknown versions fail closed. No credentials enter logs/history/storage.

## Visual and accessibility implementation

One responsive composition covers landscape TV/desktop and portrait/mobile.
Solid is the initial safe tier. A bounded 45-frame local observation plus actual
CSS support allows Soft/Glass; unavailable features, reduced motion/transparency,
high contrast and the accessible fewer-effects toggle force Solid. No UA gating,
telemetry, persistent device identity or looping benchmark. Current sampling is
initial qualification only; thermal/long-running older-TV qualification remains
NOT_RUN. No native Liquid Glass claim.

Opaque QR panel with four-module quiet zone, integer-pixel drawing, no blur or
animation. Only waiting/confirming states expose it; all others erase the canvas. Width-only
ResizeObserver plus a frame-coalesced resize fallback redraws the raster at
integer module sizes after orientation changes, without renewing the challenge.
Locale-complete en/nl/de/fr/es controls/states, live region, semantic headings,
visible focus and 44px controls. Unsupported script engines retain static secure
browser guidance. Browser tests exercise real Chromium and WebKit with production
headers over loopback HTTP (not a production HTTPS or physical-TV receipt).

## Build and qualification

```sh
npm ci --ignore-scripts
npm test
npm run build:bootstrap
npx playwright install chromium webkit
npm run test:browser
node scripts/verify_bootstrap.mjs dist/bootstrap "$(git rev-parse HEAD)"
```

Node24 is the CI runtime. Exact dev dependencies/lock: Playwright1.64.1,
Wrangler4.151.0; runtime has no npm dependency. Build has no timestamps or machine
paths. Manifest pins sourceSHA, designPin, unavailable-service disposition and
all static file hashes; SHA256SUMS also binds the manifest. The hash file does
not hash itself. Tests compare two builds, deny Cast output, tampering, extra
members and wrong source, and restore exact bytes as local rollback proof.

Existing required `test` and `validate-projection` job names remain. PR/main CI
runs Cast plus bootstrap security/state/localization/build regressions, real
Chromium/WebKit tests, artifact verification and uploads bootstrap-<exactSHA>.
No PR job receives Cloudflare secrets. Generated governance is unchanged; only
its separate local extension is widened, and the existing projection validator
passes without manual projection edits.

## Current delivery checkpoint, 2026-10-16

Source PR17 and owner-selfreview delta PR18 are protected delivered. MainCI38865047408
and exact downloaded artifact verification PASS on2e6b8f9f29449d5d07931a0bd4c744518b196b33.
The separate Direct Upload target now exists. Owner-selfreview is applied and read
back; required owner approval, no admin bypass and protected branches remain.
No bootstrap deployment yet: scoped Pages environment secret and separate DNS
access are still missing. deployment.json remains unqualified. See the
[measured acceptance matrix and next execution steps](qualification/2026-10-16-bootstrap-delivery-checkpoint.md).

The preflight and initial freeze statements below are historical measurements;
they do not override that current checkpoint.

## Historical verified external preflight, 2026-10-15

Existing OAuth Wrangler readback succeeded. Account identity is pinned in
bootstrap/deployment.json, which is not part of the public output. Pages currently
has `djconnect-vibecast-receiver` and `djconnect`; **vibecast-tv-bootstrap does not
yet exist** (API8000007). Cast project's actual build destination is wwwroot,
empty command/root, GitHub integration, main production auto-deploy enabled,
preview setting all, includes *, excludes [], watch all paths. Thus ANY new
branch push can publish an unchanged Cast preview; merge can redeploy existing
Cast production. These are real effect gates even for bootstrap/docs-only changes.
Do not change existing project settings or redirect receiver.djconnect.dev.

vibecast.tv zone exists and is active, nameservers adel/howard.ns.cloudflare.com.
The domain did not resolve at measured HTTPS preflight. OAuth has zone-read but
DNS-record listing returned Authentication error10000: current records remain
UNVERIFIED. Do not guess they are empty or overwrite them. Read DNS configuration
through an owner-authorized DNS-read route before any binding. No account/zone/
DNS/project changes have been made. GitHub secret-name and environment inventories
were empty; local OAuth access is not a minimally scoped CI credential.

## Scoped credential and DNS read preflight

Peter confirmed both environment secrets saved on2026-10-16. GitHub secret-name
readback confirms CLOUDFLARE_API_TOKEN and CLOUDFLARE_DNS_API_TOKEN; values are
never retrieved locally. Presence alone is not credential qualification.

Dispatch **Verify VibeCast Cloudflare access** from exact current protected main,
with its successful Verify receiver push/main run id. Required owner environment
approval still applies. The same repository/branch/current-main/trusted-CI and
non-bypassable owner-review checks run before any Cloudflare request. The read
workflow deliberately does not require deployment.json QUALIFIED: it is the
bounded readback needed before that later reviewed qualification.

The two tokens are used separately for GET-only requests to the pinned Pages
project and vibecast.tv zone. Redirects, incomplete/changing pagination, wrong
project/integration/branch or foreign-zone records fail closed. The receipt lists
DNS identity/type/TTL/proxy metadata and A/AAAA/CNAME contents; unrelated TXT/MX
contents and credentials are excluded. Provider error bodies are not logged.
No build dependencies or PR code receive either secret. The sanitized two-day
artifact proves read access only; edit capability, binding, deployment and TLS
remain untested until their own actual controlled effects/readbacks. Review the
real DNS inventory before planning any change; never infer absence from error.

## Owner-approved environment review mode, 2026-10-16

Peter explicitly stated in the owning Workchat: “Ik geef expliciete toestemming
voor owner-selfreview.” Only vibecast-production may permit the required owner
reviewer to approve their own deployment run (prevent_self_review=false).
The promotion guard pins the sole reviewer to pcvantol/user19624891; it also
accepts the stricter true setting. A required approval still blocks the job
until the owner approves it. Independent source reviews, green trusted main CI,
exact artifact/target checks, protected branches and can_admins_bypass=false
remain mandatory. This does not supply the missing scoped Pages credential or
DNS access, qualify deployment.json, or authorize any broader bypass.

## Controlled publication runbook and actual blockers

Proposed isolated Direct Upload target: **vibecast-tv-bootstrap**, fixed output
**dist/bootstrap**, production root **https://vibecast.tv/**. No Git integration
for this new target. Follow Cloudflare's official [Direct Upload CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
and [custom domain](https://developers.cloudflare.com/pages/configuration/custom-domains/)
procedures; existing Cast target is not part of provisioning.

1. Independent exact-candidate technical/privacy and product/UX reviews, fixes,
   and candidate-bound owner effect approval before branch push/PR: unchanged
   Cast public preview and protected-main redeploy are disclosed above. Preserve
   exact reviewed SHA/tree; require existing branch checks, no admin bypass.
2. Inspect actual zone records, record prior binding/absence and confirm this
   specific root is unused. Qualified provision: new free Pages Direct Upload
   target in the pinned account, no Worker/functions/service, no paid plan.
   Domain binding/DNS has its own concrete effect gate; never account-wide DNS.
3. Configure **vibecast-production** with the sole required owner reviewer pcvantol (user19624891), owner self-review allowed,
   no admin bypass and protected-main branch policy. Add Pages Edit credential
   restricted to this account with minimal supported scope as environment secret
   CLOUDFLARE_API_TOKEN; set CLOUDFLARE_ACCOUNT_ID variable. Do not reuse local broad
   OAuth, APNs or DNS credentials for CI; no secrets in chat/files/artifacts.
   Verify actual protection/token/target readback, then update deployment.json
   to QUALIFIED through a reviewed source change; current configuration blocks
   deployment. Exact DNS permission need is separate from this Pages credential.
4. After protected main CI success and exact effect approval, dispatch
   Publish VibeCast bootstrap from main with that main candidate_sha and its
   successful Verify receiver push-run artifact_run_id. Guard checks checkout
   SHA/current main, repository, branch, trusted workflow/event/success, protected
   approval configuration, fixed project/account. It downloads only that trusted
   run's exact named artifact, verifies every byte and fences stale runs again
   immediately before Wrangler. One concurrency group serializes production.
   Project/config unknown, fork/PR/failed/stale/wrong artifact all fail closed.
5. Wrangler deploys only the prebuilt artifact; no rebuild during promotion.
   Measure immutable deployment and custom root, no certificate bypass: expected
   file bytes/types, manifest identity and the complete artifact-bound headerpolicy,
   including cache/referrer/nosniff/frame/HSTS/CSP/permissions on final entries,
   assets, manifest/checksums and the actual HTTP404 page.
   Compare existing Cast HTTPS HTML/manifest/privacy both before and after.
   Save sanitized deployment identity, previous deployment/binding, approvals,
   artifact digest and HTTPS receipts. Workflow failures remain failures, never
   an inferred live PASS. Validate clean index redirect behavior on live host.
6. First publication rollback baseline is **no bootstrap project/domain binding**,
   pending DNS inventory, not the existing Cast deployment. Preserve prior DNS
   values before effects. If rollout fails, stop promotion; remove only newly
   approved binding/restore exact prior target via authorized owner route.
   Retain deployment evidence. Later rollback re-promotes an exact previously
   tested bootstrap artifact through the same review/effect route (dedicated
   rollback candidate; normal stale-main guard intentionally blocks arbitrary
   old-run promotion). Never overwrite the Cast project or use force push.

Current blockers: scoped Pages CI credential and target qualification; separate
DNS record read/edit route and prior-binding inventory; producer rendezvous/TRUST
contract plus Core/Apple onboarding. Source reviews, protected merges, target
creation and owner-selfreview authorization/configuration have been completed.
Existing OAuth now resolves account/Pages-read access, so do not request it again.
The source/pipeline is protected delivered with remote CI and exact artifact
verification. No bootstrap deployment/domain binding/live rollback executed.

## Handoff and acceptance labels

Contract requests: [API90](https://github.com/pcvantol/djconnect-api/issues/90#issuecomment-6201943165),
[Core1101](https://github.com/pcvantol/djconnect/issues/1101#issuecomment-6201943586),
[Apple87](https://github.com/pcvantol/djconnect-app/issues/87#issuecomment-6201943988).
Need exact qualified service/wire/crypto/TTL/browserbinding/redirect rules and
positive/negative fixtures; then static adapter + CSP network allowlist change
gets its own actual review. No receiver-owned server invention.

SOURCE_DELIVERED YES; CI_QUALIFIED PASS for source/build/browser/artifact; PAGES_DEPLOYED
NOT_RUN; DOMAIN_TLS_VERIFIED NOT_VERIFIED; RENDEZVOUS_CONNECTED BLOCKED_BY_NAMED_CONTRACT;
APPLE_HA_ONBOARDING_E2E OPEN; PHYSICAL_TV_ACCEPTANCE NOT_RUN. Own Finalization remains
pending actual source/CI/publication receipts and its separate candidate gate.
No full VibeCast/shared guest/real CAF/Apple/Cast/LG acceptance is established.
