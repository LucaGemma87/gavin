export interface LaunchPreviewInput {
  commandSummary: string;
  selectedProfile: string | null;
  model: string | null;
  fallbackProfiles: string[];
  inFlight: number;
  maxInFlight: number | null;
  memoryEstimate: string | null;
  memoryWarning: string | null;
}

/// Never put a raw launch command in the preview: it may contain prompt
/// text, credentials, or arbitrary shell arguments.
export function safeCommandSummary(
  command: string | undefined,
  expectedPrefix: string | null,
  safeExecutable: string | null
): string {
  const rawCommand = command?.trim();
  if (!safeExecutable || !expectedPrefix || (rawCommand && !rawCommand.startsWith(expectedPrefix))) {
    return "Custom or unverified command hidden; arguments may contain credentials.";
  }
  return `${safeExecutable} [prompt and arguments redacted]`;
}

export function launchPreviewLines(input: LaunchPreviewInput): string[] {
  const selected = input.selectedProfile
    ? `Selected profile: ${input.selectedProfile}.`
    : "Selected profile: unknown.";
  const model = input.model
    ? `Model: ${input.model}.`
    : "Model: not verified for this launch.";
  const fallback = input.fallbackProfiles.length
    ? `Configured fallback order: ${input.fallbackProfiles.join(" → ")}.`
    : "Configured fallback order: none.";
  const ceiling =
    input.maxInFlight === null
      ? "no configured ceiling"
      : `${input.maxInFlight} concurrent agents`;
  const lines = [
    `Effective command: ${input.commandSummary}`,
    selected,
    "Provider: not verified by the available launch metadata.",
    model,
    "Economic status: unknown; no current verified cost or quota evidence.",
    fallback,
    `Concurrency: ${input.inFlight} in flight; this launch adds 1; ceiling: ${ceiling}.`,
  ];
  if (input.memoryEstimate) lines.push(`Memory estimate: ${input.memoryEstimate}`);
  if (input.memoryWarning) lines.push(input.memoryWarning);
  return lines;
}
