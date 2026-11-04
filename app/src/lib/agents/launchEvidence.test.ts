import { describe, expect, it } from "vitest";
import type { AgentUsageReport } from "$lib/agents/agentUsage";
import { EVIDENCE_MAX_AGE_SECS, evidenceFromUsage } from "$lib/agents/launchEvidence";

const NOW_MS = 2_000_000_000_000;
const NOW_S = NOW_MS / 1000;

function ready(
  windowIds: string[],
  over: Partial<{ observedAt: number; plan: string | null; used: number }> = {}
): AgentUsageReport {
  return {
    state: "ready",
    windows: windowIds.map((id) => ({ id, label: id, usedPercent: over.used ?? 10, resetsAt: null })),
    plan: over.plan === undefined ? "Max" : over.plan,
    observedAt: over.observedAt ?? NOW_S - 30,
    cached: false,
  };
}

describe("evidenceFromUsage", () => {
  it("places a signed-in plan's fresh subscription window as included quota", () => {
    expect(evidenceFromUsage("claude-code", ready(["five_hour", "seven_day"]), NOW_MS)).toEqual({
      entitlement: "included_quota",
      source: "claude-code usage windows (Max)",
      observedAt: NOW_S - 30,
    });
  });

  it("says nothing without a ready reading", () => {
    expect(evidenceFromUsage("cline", undefined, NOW_MS)).toBeNull();
    expect(evidenceFromUsage("cline", { state: "unsupported" }, NOW_MS)).toBeNull();
    expect(
      evidenceFromUsage("cline", { state: "unavailable", reason: "x", retryAfter: null }, NOW_MS)
    ).toBeNull();
  });

  it("refuses a reading older than the daemon would accept, or from the future", () => {
    const stale = ready(["five_hour"], { observedAt: NOW_S - EVIDENCE_MAX_AGE_SECS - 1 });
    const edge = ready(["five_hour"], { observedAt: NOW_S - EVIDENCE_MAX_AGE_SECS });
    expect(evidenceFromUsage("claude-code", stale, NOW_MS)).toBeNull();
    expect(evidenceFromUsage("claude-code", edge, NOW_MS)).not.toBeNull();
    expect(
      evidenceFromUsage("claude-code", ready(["five_hour"], { observedAt: NOW_S + 61 }), NOW_MS)
    ).toBeNull();
    expect(
      evidenceFromUsage("claude-code", ready(["five_hour"], { observedAt: 0 }), NOW_MS)
    ).toBeNull();
  });

  it("does not trust windows that can bill beyond the plan or are not subscription windows", () => {
    expect(evidenceFromUsage("claude-code", ready(["five_hour", "on_demand"]), NOW_MS)).toBeNull();
    expect(evidenceFromUsage("claude-code", ready(["five_hour", "spend_limit"]), NOW_MS)).toBeNull();
    expect(evidenceFromUsage("cursor", ready(["auto", "api"]), NOW_MS)).toBeNull();
    expect(evidenceFromUsage("gemini", ready(["pro", "flash"]), NOW_MS)).toBeNull();
  });

  it("stops counting once the plan's window is spent", () => {
    expect(evidenceFromUsage("claude-code", ready(["five_hour"], { used: 100 }), NOW_MS)).toBeNull();
    expect(evidenceFromUsage("claude-code", ready(["five_hour"], { used: 99.9 }), NOW_MS)).not.toBeNull();
  });

  it("names the source without a plan when the probe gave none", () => {
    expect(evidenceFromUsage("codex", ready(["primary"], { plan: null }), NOW_MS)?.source).toBe(
      "codex usage windows"
    );
  });
});
