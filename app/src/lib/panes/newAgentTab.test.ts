import { describe, it, expect, vi } from "vitest";
import {
  agentTabChoices,
  newAgentTabEntries,
  DEFAULT_AGENT_DETAIL,
  NEW_AGENT_TAB_TITLE,
} from "$lib/panes/newAgentTab";
import { isHeading, isMenuItem } from "$lib/core/contextMenu";
import type { AgentProfileInfo } from "$lib/core/settings";
import type { DetectedAgent } from "$lib/agents/agentDetect";

function profile(id: string, command = id): AgentProfileInfo {
  return { id, label: id.toUpperCase(), command } as AgentProfileInfo;
}

function found(id: string, isFound: boolean): DetectedAgent {
  return { id, label: id, command: id, found: isFound, path: isFound ? `/bin/${id}` : null };
}

const PROFILES = [profile("cline"), profile("codex"), profile("cursor"), profile("custom", ""), profile("mine")];

describe("agentTabChoices", () => {
  it("drops built-ins the PATH sweep did not find, keeps customs it never swept", () => {
    const ids = agentTabChoices(
      PROFILES,
      [found("cline", true), found("codex", false), found("cursor", true)],
      "cline"
    ).map((p) => p.id);
    expect(ids).toEqual(["cline", "cursor", "mine"]);
  });

  it("never offers a profile with nothing to launch", () => {
    expect(agentTabChoices(PROFILES, null, "cline").map((p) => p.id)).not.toContain("custom");
  });

  it("offers every launchable profile when the sweep has no answer", () => {
    expect(agentTabChoices(PROFILES, null, "cline").map((p) => p.id)).toEqual([
      "cline",
      "codex",
      "cursor",
      "mine",
    ]);
  });

  it("keeps the workspace default even when its CLI was not found", () => {
    const ids = agentTabChoices(PROFILES, [found("codex", false)], "codex").map((p) => p.id);
    expect(ids).toContain("codex");
  });
});

describe("newAgentTabEntries", () => {
  it("leads with the title and ticks the default", () => {
    const entries = newAgentTabEntries([profile("cline"), profile("codex")], "codex", () => {});
    expect(isHeading(entries[0]) && entries[0].heading).toBe(NEW_AGENT_TAB_TITLE);
    const items = entries.filter(isMenuItem);
    expect(items.map((i) => [i.label, !!i.active, i.detail])).toEqual([
      ["cline", false, undefined],
      ["CODEX", true, DEFAULT_AGENT_DETAIL],
    ]);
  });

  it("picks the row's profile id", () => {
    const onPick = vi.fn();
    const items = newAgentTabEntries([profile("cline"), profile("codex")], "cline", onPick).filter(
      isMenuItem
    );
    items[1].onPick?.();
    expect(onPick).toHaveBeenCalledWith("codex");
  });
});
