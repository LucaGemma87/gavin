import { describe, expect, it } from "vitest";
import { launchPreviewLines, safeCommandSummary } from "$lib/agents/launchPreview";

describe("launch preview", () => {
  it("redacts raw command text and credentials", () => {
    const secretCommand = "claude --api-key sk-secret --prompt 'private prompt'";
    const summary = safeCommandSummary(secretCommand, "claude", "claude");

    expect(summary).toBe("claude [prompt and arguments redacted]");
    expect(summary).not.toContain("sk-secret");
    expect(summary).not.toContain("private prompt");
  });

  it("hides customized or unverified commands rather than exposing their arguments", () => {
    const summary = safeCommandSummary("custom --token secret", "claude", "claude");

    expect(summary).toContain("hidden");
    expect(summary).not.toContain("secret");
  });

  it("states unknown economics and distinguishes configured fallback from the selected profile", () => {
    const lines = launchPreviewLines({
      commandSummary: "claude [prompt and arguments redacted]",
      selectedProfile: "Claude Code",
      model: "sonnet",
      fallbackProfiles: ["Codex", "Gemini CLI"],
      inFlight: 3,
      maxInFlight: 4,
      memoryEstimate: "1 agent ≈ 1.5 GB",
      memoryWarning: null,
    });

    expect(lines).toContain("Provider: not verified by the available launch metadata.");
    expect(lines).toContain("Economic status: unknown; no current verified cost or quota evidence.");
    expect(lines).toContain("Configured fallback order: Codex → Gemini CLI.");
    expect(lines).toContain("Concurrency: 3 in flight; this launch adds 1; ceiling: 4 concurrent agents.");
  });
});
