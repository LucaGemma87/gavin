import { get } from "svelte/store";
import { askConfirm } from "$lib/core/dialog";
import {
  agentDefaultsStore,
  agentForProfile,
  agentProfilesStore,
  daemonCompat,
  launchPolicyReady,
  layoutState,
  profilesForWorkspace,
  resolvedAgentFor,
} from "$lib/core/layoutState";
import { featureBlockedReason } from "$lib/core/daemonCompat";
import { effectiveFallbackChain } from "$lib/agents/agentFallback";
import { estimateFor, inFlightCount, launchConfigStore } from "$lib/agents/launchQueue";
import { effectiveLaunchCostPolicy, launchPolicyVerdict, unknownLaunchReason } from "$lib/agents/launchPolicy";
import { launchPolicyError } from "$lib/agents/launchPolicyDriver";
import type { LaunchProfile } from "$lib/agents/compression";
import { launchPreviewLines, safeCommandSummary } from "$lib/agents/launchPreview";
import type { LaunchEvidence } from "$lib/agents/launchEvidence";

export async function authorizeLaunch(
  workspaceRoot: string | undefined,
  command?: string,
  launchProfile?: LaunchProfile,
  workspaceAgent?: boolean,
  workspaceId?: string,
  evidence?: LaunchEvidence
): Promise<boolean> {
  const blocked = featureBlockedReason(get(daemonCompat), "launchPolicy");
  if (blocked) throw new Error(blocked);
  const policyReady = get(launchPolicyReady);
  const policyNotReadyReason = policyReady
    ? null
    : get(launchPolicyError) ?? "Launch policy is not synchronized with the Workstation.";

  const root = workspaceRoot?.trim();
  const workspace = root
    ? get(layoutState).workspaces.find((candidate) => candidate.rootPath?.trim() === root)
    : get(layoutState).workspaces.find((candidate) => candidate.id === workspaceId);
  const resolvedWorkspaceId = workspace?.id;
  const policy = effectiveLaunchCostPolicy(
    workspace?.launchCostPolicy,
    get(launchConfigStore).costPolicy
  );
  const requestedProfileId =
    typeof launchProfile === "string" ? launchProfile : launchProfile?.profileId;
  const primaryAgent = resolvedWorkspaceId ? resolvedAgentFor(resolvedWorkspaceId) : undefined;
  const selectedProfileId =
    requestedProfileId ?? (workspaceAgent ? primaryAgent?.profileId : undefined);
  const selectedAgent =
    resolvedWorkspaceId && selectedProfileId
      ? agentForProfile(resolvedWorkspaceId, selectedProfileId)
      : workspaceAgent
        ? primaryAgent
        : undefined;
  const builtinProfile = selectedProfileId
    ? get(agentProfilesStore).find((profile) => profile.id === selectedProfileId)
    : undefined;
  const effectiveProfile = selectedProfileId && resolvedWorkspaceId
    ? profilesForWorkspace(resolvedWorkspaceId).find((profile) => profile.id === selectedProfileId)
    : undefined;
  const trustedExecutable =
    selectedAgent &&
    builtinProfile &&
    effectiveProfile?.command === builtinProfile.command &&
    selectedAgent.command === builtinProfile.command
      ? builtinProfile.command
      : null;
  const commandMatchesAgent =
    !command?.trim() ||
    Boolean(selectedAgent?.launchCommand && command.startsWith(selectedAgent.launchCommand));
  const safeExecutable = commandMatchesAgent ? trustedExecutable : null;
  // Evidence places the route only for the stock agent's own command: a
  // quota reading says nothing about an arbitrary command line.
  const placed = Boolean(evidence) && Boolean(safeExecutable);
  const verdict = launchPolicyVerdict(policy, placed ? evidence!.entitlement : "unknown", false);
  if (verdict === "blocked_paid") {
    throw new Error("Launch blocked by the no-paid-requests policy.");
  }
  const fallbackProfiles =
    resolvedWorkspaceId && primaryAgent
      ? effectiveFallbackChain(
          workspace?.fallbackChains,
          get(agentDefaultsStore).fallbackChains,
          primaryAgent.profileId
        ).map((id) => profilesForWorkspace(resolvedWorkspaceId).find((profile) => profile.id === id)?.label ?? id)
      : [];
  const estimate = estimateFor(resolvedWorkspaceId ?? null, 1, selectedProfileId ?? null);
  const model =
    commandMatchesAgent &&
    selectedAgent?.model &&
    builtinProfile?.models.includes(selectedAgent.model)
      ? selectedAgent.model
      : null;
  const preview = launchPreviewLines({
    commandSummary: safeCommandSummary(command, builtinProfile?.command ?? null, safeExecutable),
    selectedProfile: effectiveProfile?.label ?? selectedProfileId ?? null,
    model,
    fallbackProfiles,
    inFlight: get(inFlightCount),
    maxInFlight: get(launchConfigStore).maxInFlight,
    memoryEstimate: estimate.line,
    memoryWarning: estimate.warning,
  });
  const approved = await askConfirm({
    title: verdict === "approval_required" ? "Unknown launch cost" : "Launch preview",
    lines: [
      ...(verdict === "approval_required"
        ? [
            unknownLaunchReason(policy),
            policyNotReadyReason
              ? `${policyNotReadyReason} This route remains unknown; approval applies to this launch only.`
              : "Gavin has no current evidence to classify this route. Approval applies to this launch only.",
          ]
        : []),
      ...(placed
        ? [
            `Economic status: ${evidence!.entitlement === "free_allowance" ? "free allowance" : "included quota"} (${evidence!.source}).`,
          ]
        : []),
      ...preview,
    ],
    confirmLabel: verdict === "approval_required" ? "Approve this launch once" : "Start launch",
    cancelLabel: "Cancel",
  });
  if (!approved) throw new Error("Launch cancelled; no session was started.");
  return verdict === "approval_required";
}
