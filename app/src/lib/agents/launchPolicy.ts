export type LaunchCostPolicy = "ask" | "no_paid_requests";
export type LaunchEntitlement = "free_allowance" | "included_quota" | "paid" | "unknown";

export interface LaunchPolicyWorkspace {
  workspacePath: string;
  policy: LaunchCostPolicy | null;
}

export function normalizeLaunchCostPolicy(value: unknown): LaunchCostPolicy {
  return value === "no_paid_requests" ? "no_paid_requests" : "ask";
}

export function effectiveLaunchCostPolicy(
  workspacePolicy: unknown,
  appPolicy: unknown
): LaunchCostPolicy {
  return workspacePolicy == null
    ? normalizeLaunchCostPolicy(appPolicy)
    : normalizeLaunchCostPolicy(workspacePolicy);
}

export type LaunchPolicyVerdict = "allow" | "approval_required" | "blocked_paid";

export function launchPolicyVerdict(
  policy: LaunchCostPolicy,
  entitlement: LaunchEntitlement,
  approvedOnce: boolean
): LaunchPolicyVerdict {
  if (policy === "no_paid_requests" && entitlement === "paid") return "blocked_paid";
  if (entitlement === "free_allowance" || entitlement === "included_quota") return "allow";
  if ((entitlement === "paid" || entitlement === "unknown") && !approvedOnce) return "approval_required";
  return "allow";
}

export function unknownLaunchReason(policy: LaunchCostPolicy): string {
  return policy === "no_paid_requests"
    ? "This route is Unknown. No paid requests is enabled, so this launch needs explicit one-run approval."
    : "This route is Unknown. Approve this launch once to continue.";
}
