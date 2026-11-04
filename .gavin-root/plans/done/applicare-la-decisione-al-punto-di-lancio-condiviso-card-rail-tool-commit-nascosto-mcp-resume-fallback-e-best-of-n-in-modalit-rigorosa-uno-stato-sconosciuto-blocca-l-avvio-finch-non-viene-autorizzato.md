---
agent: copilot
status: Done
kind: task
title: Applicare la decisione al punto di lancio condiviso: card, rail, tool, commit nascosto, MCP, resume/fallback e Best-of-N. In modalità rigorosa, uno stato sconosciuto blocca l'avvio finché non viene autorizzato.
parent: strategy-free-agent-ecosystem.md
---
Applicare la decisione al punto di lancio condiviso: card, rail, tool, commit nascosto, MCP, resume/fallback e Best-of-N. In modalità rigorosa, uno stato sconosciuto blocca l'avvio finché non viene autorizzato.

The human's decisions on the parent card are:
- "si chiedere conferma per ogni lancio pagato o sconosciuto"
- "chiedere un'autorizzazione esplicita per ogni lancio non classibicabile"

Implement the shared launch-policy enforcement, not a per-screen approximation:
- Default the app-wide policy to `Ask`; app and workspace settings may choose `Ask` or `No paid requests`, with a workspace choice overriding the app choice.
- `Ask` requires a fresh, one-launch human approval for each Paid or Unknown route.
- `No paid requests` blocks known Paid routes. Unknown routes, including custom commands/scripts that may invoke an external CLI, require explicit approval for that exact launch.
- Never remember an approval as route entitlement or reuse it for another launch, fallback candidate, resume, or Best-of-N member. If an unattended path cannot obtain approval, it must stop with a clear reason.
- Treat missing/stale evidence and unclassifiable commands as Unknown. Do not infer cost status from a model or executable name.
- Cover card, rail, tool, hidden commit, MCP, resume/fallback, and Best-of-N paths at the daemon boundary. Preserve the protocol compatibility rules: a wider existing request needs a feature-min-version gate and every producing UI surface must handle the block.

Keep the change scoped to enforcing the approved policy and add focused tests proving that no path starts without the required authorization. The parent's next checklist items separately cover the launch preview and run-record provenance.
