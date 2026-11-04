import { describe, expect, it } from "vitest";
import {
  effectiveLaunchCostPolicy,
  launchPolicyVerdict,
  normalizeLaunchCostPolicy,
} from "$lib/agents/launchPolicy";
import { FEATURE_MIN_VERSION, featureBlockedReason } from "$lib/core/daemonCompat";

describe("launch cost policy", () => {
  it("requires a fresh approval for an unknown route under either policy", () => {
    for (const policy of ["ask", "no_paid_requests"] as const) {
      expect(launchPolicyVerdict(policy, "unknown", false)).toBe("approval_required");
      expect(launchPolicyVerdict(policy, "unknown", true)).toBe("allow");
    }
  });

  it("blocks known paid routes under No paid requests even when approved", () => {
    expect(launchPolicyVerdict("no_paid_requests", "paid", false)).toBe("blocked_paid");
    expect(launchPolicyVerdict("no_paid_requests", "paid", true)).toBe("blocked_paid");
    expect(launchPolicyVerdict("ask", "paid", false)).toBe("approval_required");
  });

  it("defaults unknown policy values to Ask and lets a workspace override the app", () => {
    expect(normalizeLaunchCostPolicy(undefined)).toBe("ask");
    expect(effectiveLaunchCostPolicy(null, "no_paid_requests")).toBe("no_paid_requests");
    expect(effectiveLaunchCostPolicy("ask", "no_paid_requests")).toBe("ask");
  });

  it("blocks launch creation on daemons older than the policy protocol", () => {
    const needed = FEATURE_MIN_VERSION.launchPolicy;
    expect(needed).toBe(81);
    expect(
      featureBlockedReason(
        { daemonVersion: needed - 1, appVersion: needed, degraded: true },
        "launchPolicy"
      )
    ).toContain(`v${needed}`);
    expect(
      featureBlockedReason(
        { daemonVersion: needed, appVersion: needed, degraded: false },
        "launchPolicy"
      )
    ).toBeNull();
  });
});
