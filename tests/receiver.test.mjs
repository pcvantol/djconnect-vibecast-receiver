import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("receiver is a stateless Cast bootstrap with direct local-HA transport", async () => {
  const page = await readFile(new URL("../wwwroot/index.html", import.meta.url), "utf8");
  assert.match(page, /caf_receiver\/v3\/cast_receiver_framework\.js/);
  assert.match(page, /--font-ui:Arial,Helvetica,sans-serif/);
  assert.match(page, /urn:x-cast:com\.djconnect\.vibecast\.v1/);
  assert.match(page, /kind !== "vibecast_handoff"/);
  assert.match(page, /\/api\/djconnect\/v1\/session\/broadcast\/ws\//);
  assert.doesNotMatch(page, /localStorage|sessionStorage|fetch\(|analytics|XMLHttpRequest/);
});
