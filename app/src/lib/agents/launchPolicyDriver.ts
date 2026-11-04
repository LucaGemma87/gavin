import { get, writable } from "svelte/store";
import { listen } from "@tauri-apps/api/event";
import * as backend from "$lib/core/backend";
import {
  daemonCompat,
  launchPolicyReady,
  layoutState,
} from "$lib/core/layoutState";
import { featureBlockedReason, type DaemonCompat } from "$lib/core/daemonCompat";
import { launchConfigStore } from "$lib/agents/launchQueue";
import {
  effectiveLaunchCostPolicy,
  type LaunchCostPolicy,
  type LaunchPolicyWorkspace,
} from "$lib/agents/launchPolicy";
import type { Workspace } from "$lib/core/workspace";

export { type LaunchPolicyWorkspace } from "$lib/agents/launchPolicy";

export function launchPolicyBlocked(compat: DaemonCompat | null): string | null {
  return featureBlockedReason(compat, "launchPolicy");
}

export function launchPolicyWorkspaces(
  workspaces: readonly Pick<Workspace, "rootPath" | "launchCostPolicy">[],
  appPolicy: LaunchCostPolicy
): LaunchPolicyWorkspace[] {
  const byPath = new Map<string, LaunchCostPolicy>();
  for (const workspace of workspaces) {
    const path = workspace.rootPath?.trim();
    if (!path) continue;
    const policy = effectiveLaunchCostPolicy(workspace.launchCostPolicy, appPolicy);
    const previous = byPath.get(path);
    byPath.set(path, previous === "no_paid_requests" || policy === "no_paid_requests"
      ? "no_paid_requests"
      : "ask");
  }
  return [...byPath.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([workspacePath, policy]) => ({ workspacePath, policy }));
}

export function launchPolicyKey(appPolicy: LaunchCostPolicy, workspaces: readonly LaunchPolicyWorkspace[]): string {
  return JSON.stringify([appPolicy, workspaces.map(({ workspacePath, policy }) => [workspacePath, policy])]);
}

export const launchPolicyError = writable<string | null>(null);

let told: string | null = null;
let telling = false;
let tellAgain = false;

async function tell(): Promise<void> {
  if (telling) {
    tellAgain = true;
    return;
  }
  telling = true;
  try {
    do {
      tellAgain = false;
      const state = get(layoutState);
      const compat = get(daemonCompat);
      if (state.status !== "ready" || !compat || launchPolicyBlocked(compat)) {
        launchPolicyReady.set(false);
        continue;
      }
      const appPolicy = get(launchConfigStore).costPolicy;
      const workspaces = launchPolicyWorkspaces(state.workspaces, appPolicy);
      const key = launchPolicyKey(appPolicy, workspaces);
      if (key === told) {
        launchPolicyReady.set(true);
        launchPolicyError.set(null);
        continue;
      }
      launchPolicyReady.set(false);
      try {
        await backend.setLaunchPolicies(appPolicy, workspaces);
        told = key;
        launchPolicyError.set(null);
        launchPolicyReady.set(true);
      } catch (error) {
        launchPolicyError.set(`Could not sync launch policy with the daemon: ${String(error)}`);
      }
    } while (tellAgain);
  } finally {
    telling = false;
  }
}

export function startLaunchPolicySwitch(): () => void {
  told = null;
  let stopped = false;
  let unlistenRemoteReady: (() => void) | null = null;
  void listen("remote-link-ready", () => {
    told = null;
    launchPolicyReady.set(false);
    void tell();
  })
    .then((unlisten) => {
      if (stopped) unlisten();
      else unlistenRemoteReady = unlisten;
    })
    .catch((error: unknown) => {
      launchPolicyReady.set(false);
      launchPolicyError.set(`Could not watch remote launch-policy changes: ${String(error)}`);
    });
  const stops = [
    layoutState.subscribe(() => void tell()),
    launchConfigStore.subscribe(() => void tell()),
    daemonCompat.subscribe(() => {
      told = null;
      launchPolicyReady.set(false);
      void tell();
    }),
  ];
  return () => {
    stopped = true;
    for (const stop of stops) stop();
    unlistenRemoteReady?.();
    launchPolicyReady.set(false);
  };
}
