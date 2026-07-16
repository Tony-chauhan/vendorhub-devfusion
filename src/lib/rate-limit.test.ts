import { describe, it, expect } from "vitest";
import { checkRateLimit } from "./rate-limit";

// No UPSTASH_REDIS_REST_URL/_TOKEN are set in the test environment, so these
// exercise the in-memory sliding-window fallback exclusively.
describe("checkRateLimit (in-memory fallback)", () => {
  const config = { maxRequests: 3, windowMs: 60_000 };

  it("allows requests up to the configured maximum", async () => {
    const id = `test-allow-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      const result = await checkRateLimit(id, config);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks the request once the limit is exceeded", async () => {
    const id = `test-block-${Math.random()}`;
    await checkRateLimit(id, config);
    await checkRateLimit(id, config);
    await checkRateLimit(id, config);
    const fourth = await checkRateLimit(id, config);
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks each identifier independently", async () => {
    const a = `test-independent-a-${Math.random()}`;
    const b = `test-independent-b-${Math.random()}`;

    await checkRateLimit(a, config);
    await checkRateLimit(a, config);
    await checkRateLimit(a, config);

    const bResult = await checkRateLimit(b, config);
    expect(bResult.allowed).toBe(true);
  });

  it("reports decreasing remaining count", async () => {
    const id = `test-remaining-${Math.random()}`;
    const first = await checkRateLimit(id, config);
    const second = await checkRateLimit(id, config);
    expect(first.remaining).toBe(2);
    expect(second.remaining).toBe(1);
  });
});
