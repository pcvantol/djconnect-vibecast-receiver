# Repository status

**Role:** stateless VibeCast Google Cast Custom Web Receiver distribution.
Core owns the shared renderer and all host-adapter source.

**Current assignment:** `DJC-VIBECAST-CAST-RECEIVER-ADOPTION-V1-20261009`.
ACK/actual base/branch/first material: [#10/6083184705](https://github.com/pcvantol/djconnect-vibecast-receiver/issues/10#issuecomment-6083184705).
Base `a901fbcd3e894af62b63fafbca8f96738e08ce3c`; isolated source writer branch
`codex/djc-vibecast-cast-receiver-adoption-v1-20261009`.

Pinned published Core supplying `7460ef5e1d4c15888569b857d7c636620ace7e37`,
shared build 1.0.0, manifest `72239b476e793fe5bb5493d2be5720fcd1f6e64ea83e012c77573732a58c7898`.
Offline import/verification and negative tests prepared. See
[adoption runbook](docs/CAST_ADOPTION.md) for exact pins, rollback and acceptance.

**Delivery state:** local candidate; independent local software review GO; 14 tests and 10 browser scenarios PASS. Required remote
checks/protected delivery/exact-main readback/Finalization pending. Push held
until external Cloudflare Git effects and publication authority are known.
Pages project/URL, public Cast App ID and device are UNKNOWN. Real CAF/physical
Cast/Apple sender qualification NOT_RUN/OPEN; no full COMPLETE claim.

Apple keeps its sole conversation/history writer. Registered sender follow-up:
`DJC-APPLE-VIBECAST-CAST-SENDER-V1-20261009`; early read-only contract coordination
sent. No Swift/Core source write, HA deployment/config, Console mutation,
signing, account/cost, LG package, Windows work or extra capability.
