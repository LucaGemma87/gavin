// What the desk can honestly say about a route's cost, from readings it
// already takes.
//
// The daemon asks a human before every launch it cannot place (ADR 0013).
// The usage panel's probes are the one source the desk has that names a
// plan: a signed-in agent with a subscription window open is spending its
// included quota, and says so through the CLI's or the provider's own
// interface. This module turns such a reading into the evidence a launch
// carries; the daemon alone decides whether it is still good
// (`launch_policy::classify`), so nothing here authorizes anything.
//
// **Absence is not evidence.** A profile with no probe, a probe that
// failed, a reading with an overage window, or one older than the
// daemon will accept, all come back null, and null means the human is
// asked as before. Names prove nothing: no profile or model is
// classified by what it is called.

import { get } from "svelte/store";
import type { AgentUsageReport } from "$lib/agents/agentUsage";
import { agentUsageStore } from "$lib/agents/agentPauseState";
import { agentProfilesStore, daemonCompat } from "$lib/core/layoutState";
import { featureBlockedReason } from "$lib/core/daemonCompat";

export interface LaunchEvidence {
  entitlement: "free_allowance" | "included_quota";
  source: string;
  /// Epoch SECONDS of the data, as `UsageReport.observedAt` has it.
  observedAt: number;
}

/// Mirrors `MAX_EVIDENCE_AGE_SECS` in `launch_policy.rs`. The daemon is
/// the authority; this copy only avoids sending what it would refuse.
export const EVIDENCE_MAX_AGE_SECS = 15 * 60;

/// Windows that only exist for an account on a plan whose requests draw
/// from included quota. Everything else a probe can return (`total`,
/// `auto`, `api`, `on_demand`, `pro`, `flash`, ...) is pooled, pay-as-you-go
/// or ambiguous, and is deliberately absent: a window that might bill must
/// not read as one that does not.
const INCLUDED_WINDOWS = new Set([
  "five_hour",
  "seven_day",
  "primary",
  "secondary",
  "weekly",
  "rolling",
  "kimi-5h",
  "kimi-7d",
]);

/// A window that means requests can be charged beyond the plan.
const OVERAGE_WINDOWS = new Set(["spend_limit", "on_demand", "api"]);

export function evidenceFromUsage(
  profileId: string,
  report: AgentUsageReport | undefined,
  nowMs: number
): LaunchEvidence | null {
  if (!report || report.state !== "ready") return null;
  const nowS = Math.floor(nowMs / 1000);
  if (!Number.isFinite(report.observedAt) || report.observedAt <= 0) return null;
  if (report.observedAt > nowS + 60) return null;
  if (nowS - report.observedAt > EVIDENCE_MAX_AGE_SECS) return null;
  if (report.windows.some((w) => OVERAGE_WINDOWS.has(w.id))) return null;
  const included = report.windows.filter((w) => INCLUDED_WINDOWS.has(w.id));
  if (included.length === 0) return null;
  // A spent window is where included quota ends and billing may begin.
  if (included.some((w) => w.usedPercent >= 100)) return null;
  const plan = report.plan?.trim();
  return {
    entitlement: "included_quota",
    source: `${profileId} usage windows${plan ? ` (${plan})` : ""}`,
    observedAt: report.observedAt,
  };
}

/// The evidence for a stock profile's launch right now, or undefined.
/// Undefined for a custom profile, an unknown one, and a daemon too old
/// to read the field.
export function launchEvidenceFor(
  profileId: string | undefined,
  nowMs: number = Date.now()
): LaunchEvidence | undefined {
  if (!profileId) return undefined;
  if (featureBlockedReason(get(daemonCompat), "launchEvidence")) return undefined;
  if (!get(agentProfilesStore).some((profile) => profile.id === profileId)) return undefined;
  return evidenceFromUsage(profileId, get(agentUsageStore)[profileId], nowMs) ?? undefined;
}
