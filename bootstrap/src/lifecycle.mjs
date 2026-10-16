// Internal consumer interface, NOT an API wire/crypto/TTL contract.
// Only a separately qualified, statically imported producer adapter may verify
// challenges and destinations. Production currently imports unavailableAdapter.
export const unavailableAdapter = Object.freeze({ contract: null });
export class BootstrapController {
  constructor({ adapter = unavailableAdapter, render, navigate, now = Date.now,
    monotonic = () => performance.now(), schedule = (fn, delay) => setTimeout(fn, delay), cancel = id => clearTimeout(id) }) {
    Object.assign(this, { adapter, render, navigate, now, monotonic, schedule, cancel });
    this.generation = 0; this.timer = null; this.abort = null; this.challenge = null;
    this.monotonicDeadline = 0; this.consumed = false; this.state = 'initializing';
  }
  show(state, details = {}) { this.state = state; this.render({ state, ...details }); }
  invalidate() {
    this.generation++; this.abort?.abort(); this.abort = null;
    this.cancel(this.timer); this.timer = null; this.challenge = null;
  }
  async start(supported = true) {
    this.invalidate(); this.consumed = false;
    if (!supported) return this.show('unsupported');
    if (!this.adapter.contract) return this.show('unavailable');
    if (!['create', 'wait', 'validateChallenge', 'verifyDestination', 'allowsDestination'].every(k => typeof this.adapter[k] === 'function')) return this.show('unknown');
    const generation = this.generation;
    this.abort = new AbortController();
    this.show('creating');
    try {
      const challenge = await this.adapter.create({ signal: this.abort.signal });
      if (generation !== this.generation) return;
      if (!this.adapter.validateChallenge(challenge) || !Number.isFinite(challenge?.expiresAt) || challenge.expiresAt <= this.now() || !validMatrix(challenge.matrix)) return this.fail('unknown');
      // Preserve the original deadline: reconnect never creates or renews it.
      this.challenge = Object.freeze({ ...challenge, expiresAt: challenge.expiresAt });
      this.monotonicDeadline = this.monotonic() + challenge.expiresAt - this.now();
      if (!this.armDeadline(generation)) return;
      this.show('waiting', { challenge: this.challenge });
      await this.receive(generation);
    } catch { if (generation === this.generation) this.show('recovering'); }
  }
  armDeadline(generation) {
    if (generation !== this.generation || !this.challenge) return false;
    this.cancel(this.timer);
    const remaining = Math.min(this.challenge.expiresAt - this.now(), this.monotonicDeadline - this.monotonic());
    if (remaining <= 0) { this.fail('expired'); return false; }
    this.timer = this.schedule(() => {
      if (generation !== this.generation) return;
      // Timers may fire early or be capped by the browser for large deadlines.
      this.armDeadline(generation);
    }, Math.min(remaining, 2147483647));
    return true;
  }
  fail(state) { this.invalidate(); this.show(state); }
  async receive(generation) {
    if (!this.current(generation)) return;
    const challenge = this.challenge;
    try {
      const envelope = await this.adapter.wait({ challenge, signal: this.abort.signal,
        onConfirming: () => { if (this.current(generation)) this.show('confirming', { challenge }); } });
      if (!this.current(generation)) return;
      this.show('received');
      const destination = await this.adapter.verifyDestination(envelope, { challenge, signal: this.abort.signal });
      if (!this.current(generation)) return;
      let url;
      try { url = new URL(destination); } catch { return this.fail('unsafe'); }
      // No query-string redirect input, secret fragments or scheme downgrade.
      if (url.protocol !== 'https:' || url.username || url.password || url.hash ||
          !this.adapter.allowsDestination(url, challenge)) return this.fail('unsafe');
      this.consumed = true;
      this.cancel(this.timer); this.abort?.abort();
      this.challenge = null; this.generation++;
      this.show('redirecting'); this.navigate(url.href);
    } catch { if (this.current(generation)) this.show('recovering', { challenge }); }
  }
  current(generation) {
    if (generation !== this.generation || this.consumed || !this.challenge) return false;
    if (this.challenge.expiresAt <= this.now() || this.monotonicDeadline <= this.monotonic()) { this.fail('expired'); return false; }
    return true;
  }
  async reconnect() {
    if (!this.challenge) return this.start();
    const generation = this.generation;
    if (!this.current(generation)) return;
    // Abort the previous channel; generation fences even adapters ignoring abort.
    this.abort?.abort(); this.abort = new AbortController(); this.generation++;
    if (!this.armDeadline(this.generation)) return;
    this.show('waiting', { challenge: this.challenge });
    await this.receive(this.generation);
  }
  stop() { this.invalidate(); this.show('unavailable'); }
}
export function validMatrix(matrix) {
  return Array.isArray(matrix) && matrix.length >= 21 && matrix.length <= 177 &&
    (matrix.length - 21) % 4 === 0 && matrix.every(row => Array.isArray(row) &&
      row.length === matrix.length && row.every(value => typeof value === 'boolean'));
}
