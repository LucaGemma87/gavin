---
order: 7200
kind: plan
title: Queued work resumes by itself when an agent's usage window resets
status: To Do
labels: needs-triage
complexity: moderate
---
Claude Code is the default agent, and its 5-hour and 7-day windows are the limit that decides when work can run. Gavin already watches those windows; this card closes the last gap between "the window reset" and "the next piece of work starts".

## What already exists (read the code before changing it)

- `agentUsage.ts` / `agent_usage.rs` read each agent's windows; `agentPauseState.ts` polls them every three minutes and keeps the newest reading, a history and a projection (`usageProjection.ts`) that says when a window will be full.
- `agentPause.ts` holds STARTS (never running work) when a window is at the configured percentage or inside a duty cycle. The scheduler, card runs and auto-resume all ask `mayStartWork` / `startBlockedReason`, so a held rail waits instead of failing.
- `AgentUsageModal.svelte` and the sidebar strip show how close each window is and when it resets.

## What this card adds

- [x] At the instant a window closes, drop the stale reading, push the clock so every held start is asked again, and read the agent live (`profilesPastReset`, `wakeAtReset` in `agentPauseState.ts`). Before, the gate ran on "no reading" until the next poll.
- [ ] A Scheduled task whose fire time is "when `<agent>`'s `<window>` next resets", for work the human wants queued rather than held. Needs a schedule kind beside the clock-time ones in `schedule.ts`, the daemon's fire claim (ADR 0010) and the dialog. Decide first whether the trigger is a `resetsAt` read at fire time or a stored absolute instant, because a window's reset moves when the agent is used.
- [ ] A notification at the critical band (`usageSeverity`) saying how long until the reset, so a human can decide to wait instead of stop.
- [ ] Human test: with a window above the pause percentage, a rail's next step starts within a minute of the reset without pressing anything.

Constraints that must hold: an absolute instant, never a duration left (the machine sleeps); nothing running is stopped; a reading that cannot be taken is not zero.
