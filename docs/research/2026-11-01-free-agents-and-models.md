# Gavin and free agents/models: product analysis and plan

**Research date:** 2026-11-01  
**Scope:** Gavin's current agent/model functionality; selected competing coding-agent products; a prioritized product and implementation plan for using no-cash/free-quota agents and models safely.  
**Implementation status:** Research and recommendations only. No source code was changed.

Local repository citations below use repo-root-relative paths from `C:\Users\lucag\Desktop\gavin`.

## Executive summary

Gavin already has a strong *fleet* foundation: real, visible agent sessions; persistent work cards; complexity-based model routing; account-limit monitoring and fallback for profiles with verified quota sources; token-use reporting where an agent exposes a readable transcript; and Best-of-N runs in separate worktrees. This positions Gavin as a fleet coordinator rather than a model marketplace. The missing layer is a trustworthy **free-use policy**: Gavin currently has model names and some account-limit facts, but not a provider-neutral answer to “will this run make a cash charge, spend a shared free quota, or stay local?” (`LucaGemma87/gavin:.gavin-root/PRD.md:6-30,51-96`; `LucaGemma87/gavin:app/src/lib/cards/complexity.ts:81-109`; `LucaGemma87/gavin:app/src-tauri/src/agent_setup.rs:739-789,997-1043`).

The recommended differentiator is **“the agent fleet that can prove it stayed inside your chosen cost/entitlement boundary,”** not simply “a list of free models.” Start with an explicit no-paid mode and trustworthy local-model onboarding through an existing provider such as OpenCode + Ollama; then add provider/quota metadata only where an official, supportable source exists. Treat “local,” “free quota,” “subscription allowance,” and “unknown” as different states. Never silently move a user from a free route to a paid model. Keep model/provider claims dated and sourced because quotas, prices, and model availability are volatile.

## What Gavin does today

### Agent fleet, not a model marketplace

- The product's core work object is a durable markdown card, shared by the human and agents. Sessions live in real terminals, and the daemon owns PTYs and durable state independently of the desktop window (`LucaGemma87/gavin:.gavin-root/PRD.md:6-30`).
- The product already combines workspaces/pages/tabs, a Kanban board, a launch wall, orchestration rails, reusable tools, review, and an attention inbox. The PRD describes agent economics as usage/cost/limit tracking, complexity-to-model routing, and Best-of-N (`LucaGemma87/gavin:.gavin-root/PRD.md:51-96`).
- Gavin launches agent CLIs via profiles. A profile can define command, model flag, effort, prompt and provider-specific setup; custom profiles let users bring another command and configure its flags/API family (`LucaGemma87/gavin:app/src-tauri/src/agent_setup.rs:502-620`; `LucaGemma87/gavin:app/src/lib/agents/agentsHub.ts:40-46`).

### Model choice and routing

- Model settings allow a per-profile default, workspace overrides, stable presets where verified, and a custom text entry. Runtime model lists are merged behind stable presets rather than replacing them (`LucaGemma87/gavin:app/src/lib/agents/agentModel.ts:189-256`).
- Model-catalog discovery is deliberately selective: Codex reads its cache, OpenCode runs `opencode models`, and Kimi reads its CLI; those lists are loaded best-effort at app startup. Gavin does not label these entries by price, free entitlement, tool capability, or quota (`LucaGemma87/gavin:app/src-tauri/src/agent_setup.rs:997-1043`; `LucaGemma87/gavin:app/src-tauri/src/agent_models.rs:1-80`).
- A card can be assigned one of five complexity levels, and a per-profile table can route each level to an agent, model, effort, or advisor. The UX already explains the intended economy: a one-line task need not consume the strongest model (`LucaGemma87/gavin:app/src/lib/cards/complexity.ts:1-109`; `LucaGemma87/gavin:app/src/lib/agents/AgentPrimaryPanel.svelte:175-215`).

### Quotas, fallbacks and token reporting

- Gavin distinguishes a ready quota reading from unsupported and unavailable. It shows warnings at 75% and critical at 90%; unavailable data is not rendered as “plenty left.” It also avoids treating a probe failure as proof that a limit is exhausted (`LucaGemma87/gavin:app/src/lib/agents/agentUsage.ts:1-95,145-236`).
- Usage probes exist only for routes Gavin has verified. The profile table documents probes for several subscriptions/services, while BYO-provider OpenCode accounts have no single account-wide usage endpoint; Cline has no usage probe (`LucaGemma87/gavin:app/src-tauri/src/agent_setup.rs:739-920,1058-1092`).
- Usage-based fallback walks an ordered profile chain when the resolved agent is near its limit; the default threshold is 90%. When a complexity-routed profile is exhausted, Gavin may first try the workspace's active profile; if the active profile itself is exhausted and there is no configured chain, it pauses. An unknown/failed probe is not treated as an exhausted quota (`LucaGemma87/gavin:app/src/lib/agents/agentFallback.ts:1-13,114-149,195-262`).
- Gavin can report per-run token totals and model names only for profiles with a readable transcript. The token report separates input, output, cache-read and cache-write totals and explicitly distinguishes unsupported from unavailable; this is token accounting, not by itself a promise of zero dollars (`LucaGemma87/gavin:app/src-tauri/src/agent_tokens.rs:1-90`; `LucaGemma87/gavin:app/src/lib/cards/runHistory.ts:49-80,268-354`).
- For Cline specifically, Gavin recognizes explicit daily free-model-limit messages as a usage-limit failure, but does not automatically select or switch Cline models. The repo's 2026-11-01 design note says Cline's free-model list is served by an undocumented internal endpoint, no supported account-quota query was found, and no fallback to a paid model is allowed (`LucaGemma87/gavin:app/src-tauri/src/agent_setup.rs:1058-1092`; `LucaGemma87/gavin:docs/superpowers/specs/2026-08-25-agent-default-model-design.md:24-43`).

### Best-of-N

Best-of-N runs the same card on multiple agents/models in separate worktrees, on a shared base, with visible sessions and a human choosing the winner. The chooser can have up to six rows. Picking a winner explicitly discards the losing candidate folders and any uncommitted work, so it is a useful quality-comparison primitive with meaningful resource and UX costs; parallel runs can also consume shared provider quotas much faster (`LucaGemma87/gavin:app/src/lib/cards/bestOfN.ts:1-12,130-210,300-330`; `LucaGemma87/gavin:app/src/lib/cards/BestOfNDialog.svelte:88-110`; `LucaGemma87/gavin:app/src/lib/cards/bestOfNActions.ts:1-15,69-100`).

## Competitors and adjacent products

The comparison focuses on official product documentation for OpenCode, Cline, Continue and Roo Code—tools that expose model/provider choice or agent orchestration. A product's ability to connect to a model does not mean it pays for inference or grants free quota.

| Product | Strengths relevant to Gavin | Weaknesses / UX cautions relevant to Gavin |
|---|---|---|
| **OpenCode** | Documents a broad provider/model configuration surface, local models, and agents/subagents, including parallel delegated work. This is the closest adjacent model-agnostic harness and makes it a practical first integration path for local models ([Models](https://opencode.ai/docs/models/), [Providers](https://opencode.ai/docs/providers/), [Agents](https://opencode.ai/docs/agents/)). | Permissions are powerful and configurable; `--auto` approves requests that would otherwise prompt except explicit denies. The reviewed docs describe permission controls, not a cross-agent no-spend guarantee or account-wide quota ledger. Gavin should preserve its own launch gates, cost policy and visible-session model rather than treating an agent CLI's approval mode as financial safety ([Permissions](https://opencode.ai/docs/permissions/)). |
| **Cline** | Supports many model/provider options, local models, parallel desktop sessions and scheduled tasks. Its Kanban preview adds parallel worktrees and task dependencies—overlapping with Gavin's card/rail/worktree strengths ([Desktop](https://docs.cline.bot/usage/cline-desktop.md), [Kanban](https://docs.cline.bot/usage/kanban.md), [local models](https://docs.cline.bot/running-models-locally/overview.md)). | Cline's free-model offers are quota-limited and rotating; the official docs describe changing availability and distinguish those offers from API usage. Multiple sessions/tasks can burn shared capacity quickly. Gavin's own design research found no supported Cline quota query, so it should keep free status and model selection explicit rather than scraping a private endpoint or guessing from a model name ([Free models](https://docs.cline.bot/getting-started/free-models.md), [Cline provider](https://docs.cline.bot/getting-started/cline-provider.md); Gavin decision: `LucaGemma87/gavin:docs/superpowers/specs/2026-08-25-agent-default-model-design.md:24-43`). |
| **Continue** | Offers Plan (read-only) and Agent (tool-using) modes, model roles and an Ollama provider; it also has a terminal CLI. Its model-role framing is useful for showing that “best” depends on task, not just model name ([Agent quick start](https://docs.continue.dev/ide-extensions/agent/quick-start), [Models](https://docs.continue.dev/customize/models), [Ollama](https://docs.continue.dev/customize/model-providers/top-level/ollama), [CLI](https://docs.continue.dev/cli/quickstart)). | Agent/Plan behavior depends on tool support from the selected model/provider. The reviewed CLI docs include `--auto` (allow all tools) and a `--readonly` alternative, but do not describe the multi-session fleet coordination Gavin provides. Continue's setup flexibility is a feature for experts and a setup burden for a free-model novice. |
| **Roo Code** | Boomerang/Orchestrator mode delegates to specialized modes and passes a summary back to the parent. Subtasks are distinct conversations, a useful pattern for role specialization ([Boomerang Tasks](https://docs.roocode.com/features/boomerang-tasks)). | The documented orchestration is a paused parent/subtask handoff rather than Gavin-style visible parallel fleet scheduling. Auto-approval removes prompts and Roo warns it can cause data loss or worse, especially for terminal actions ([Boomerang Tasks](https://docs.roocode.com/features/boomerang-tasks), [Auto-Approving Actions](https://docs.roocode.com/features/auto-approving-actions)). |

### What “free” means in practice (official provider sources)

- **Local inference:** Ollama's pricing page lists local model running with no subscription/service fee. This avoids an inference-provider bill, not hardware, electricity, time, or quality costs. Ollama Cloud is a separate hosted route and requires sign-in; do not label it local ([Ollama pricing](https://ollama.com/pricing), [cloud models](https://ollama.com/blog/cloud-models)).
- **Free provider allowance:** Google's Gemini API pricing describes free access to certain models with limits; its docs say free-tier content may be used to improve Google products. Rate limits are applied per project, not per API key, and vary by model ([Pricing](https://ai.google.dev/gemini-api/docs/pricing), [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)).
- **Free model variants:** OpenRouter documents `:free` model variants with platform rate caps, plus provider-side availability/rate limits. At the checked page, the platform limits were 20 requests/minute and 50/day below the all-time credit threshold, or 20/minute and 1,000/day above it; `GET /api/v1/key` reports free-model daily requests used/limit/remaining and key budgets, but not the per-minute counter. A negative credit balance can also make free-model requests fail; additional keys/accounts do not create a larger platform cap ([Limits](https://openrouter.ai/docs/api_reference/limits.md), [Models](https://openrouter.ai/docs/guides/overview/models.md)).

**Volatility:** These are live official pages checked on 2026-11-01, not durable entitlements. Availability, limits, prices, acceptable-use terms, and data handling can change; re-check the linked source before shipping or promising a quota. “Free” should never be inferred from a model ID alone.

## Gavin's differentiators to defend

- **Work is durable, not trapped in a chat.** A card/plan in the repo survives the session and is the shared human/agent work object (`LucaGemma87/gavin:.gavin-root/PRD.md:6-30,51-70`).
- **Fleet operations span the whole workflow.** Gavin connects profiles, cards, rails, reusable tools, visible terminal sessions, usage/fallback and review. A provider/model choice can therefore be governed across parallel work, not only in one editor panel (`LucaGemma87/gavin:.gavin-root/PRD.md:51-96`).
- **Human control is an architectural rule.** Sessions are visible; committing, merging and switching a dirty checkout ask rather than proceed; attention tools surface waits. This should remain intact when free-only mode adds stricter cost gates (`LucaGemma87/gavin:.gavin-root/PRD.md:14-30,51-96`).
- **Model choice is already task-shaped.** Complexity routing and isolated Best-of-N provide a foundation for measuring which low-cost model is good at which task, instead of promoting a universal “best free model” (`LucaGemma87/gavin:app/src/lib/cards/complexity.ts:1-109`; `LucaGemma87/gavin:app/src/lib/cards/bestOfN.ts:1-12,130-210`).

## Product recommendation

Make Gavin the **cost/entitlement-aware coordinator for a visible agent fleet**. A good first release does not need to own a model marketplace or proxy provider APIs. It needs to reliably answer, before launch:

1. What agent command, provider, and model will actually run?
2. Is the route **local**, **free provider quota**, **subscription allowance**, **paid**, or **unknown**—and what evidence supports that label?
3. If this work is retried, fanned out, or rate-limited, can it cross the user's chosen spend boundary?

### Prioritized implementation roadmap

#### P0 — Define the no-surprise contract (product/design; prerequisite)

1. Add a small, explicit entitlement vocabulary: **Local/no provider inference charge**, **Provider free allowance**, **Included subscription quota**, **Paid**, **Unknown**. Do not collapse free allowance and local into a green “free” badge.
2. Define policy scopes: app default, workspace override, and one-run override. A strict **No paid requests** policy must apply to every launch path—card, rail, tool, hidden commit agent, MCP-spawned work and Best-of-N—not just the visible model picker. Gavin's PRD already treats those as one fleet and a shared launch seam (`LucaGemma87/gavin:.gavin-root/PRD.md:51-96`).
3. Specify what counts as an allowed route when entitlement evidence is missing. In strict mode, unknown should be blocked pending human choice; in ordinary mode, clearly say “Gavin cannot verify free access.”
4. Preserve provider/model/source/check time, policy, selected model and effective launch command in the run record. Do not store or expose API keys in the entitlement record.

**Acceptance:** a written contract and tests enumerate every launch entry point and demonstrate that strict mode cannot launch a model without an allowed entitlement class.

#### P1 — Ship a local-model path first (integration; low entitlement ambiguity)

1. Start with an existing installed local provider—OpenCode configured for Ollama is the shortest path because Gavin already discovers OpenCode's configured model list at startup and OpenCode documents local providers. Validate the actual host/base URL before displaying “Local”; a hosted URL must not inherit that label.
2. Provide an in-app setup/check flow: find or install provider, test local endpoint, enumerate installed models, verify the chosen model supports the tools Gavin requires, and show resource requirements/limitations before enabling it.
3. Add a local-only choice to the launch policy; don't silently download large model weights. Ask before download and show size, disk impact and RAM estimate.
4. Measure launch success and quality on each supported OS. Local inference avoids per-request provider charges, but may be slow or incapable on the user's hardware.

**Acceptance:** with local-only enabled, a test suite observes no request to a remote inference host; the UI names the actual local runtime/model, reports readiness truthfully, and fails closed if it cannot verify that route.

#### P2 — Add a provider/model catalog with evidence (after P0)

1. Extend Gavin's existing `ModelOption`/catalog pattern with separate provider, model, capability and entitlement metadata rather than overloading a model-name string (`LucaGemma87/gavin:app/src/lib/agents/agentModel.ts:11-14,189-240`; `LucaGemma87/gavin:app/src-tauri/src/agent_models.rs:1-80`).
2. Start with user-configured/official routes: existing OpenCode model list; a documented Gemini API setup; and OpenRouter's official free variant metadata. OpenRouter's authenticated `GET /api/v1/key` returns free-model daily-request usage and spend-budget data; the model list API also exposes supported parameters for filtering tool-capable models. Use the user's configured credential without displaying or logging it, and treat provider-side limits as a separate source of 429s. The provider owns quota/price truth; Gavin owns the explanation and policy enforcement ([Limits](https://openrouter.ai/docs/api_reference/limits.md), [Models API](https://openrouter.ai/docs/guides/overview/models.md)).
3. Record an official source URL, checked timestamp, refresh interval and confidence for every entitlement claim. Expired/unavailable metadata becomes **Unknown**, not “free.” Keep free model access opt-in and separate from any paid fallback.
4. Do not query Cline's undocumented free-model endpoint. Continue to let users choose Cline models manually and recognize its explicit daily-limit failure; no paid-model fallback.
5. Add a provider health/capability check for tool calling, context, streaming, model availability and rate limits. A catalog entry is not proof that the model can execute Gavin's agent workflow.

**Acceptance:** every listed model has provenance and a freshness state; every unsupported/unknown case is visible; a changed provider response cannot silently reclassify a model as free.

#### P3 — Enforce bounded spend, quotas and safe fallback (fleet policy)

1. Separate provider cash spend, account quota, per-run tokens and local compute. Gavin already models quota windows independently from per-conversation token totals; extend that distinction rather than multiplying tokens by an assumed price (`LucaGemma87/gavin:app/src/lib/agents/agentUsage.ts:15-53`; `LucaGemma87/gavin:app/src-tauri/src/agent_tokens.rs:55-90`).
2. Add a user-set hard spend ceiling (including `$0`) and a free-quota ceiling per provider/project/account where the source exposes one. Keep the existing “unsupported/unavailable” states and stale-data ages visible.
3. Add provider-aware launch queues/semaphores so parallel rails and Best-of-N do not accidentally exceed shared per-project limits. Google's project-level rate limit is a concrete example of why per-key assumptions are unsafe.
4. Extend fallback only with a **user-approved allow-list** of routes that satisfy the active policy. Never switch from free/local/unknown to paid. For provider 429s, distinguish a documented quota exhaustion from generic throttling/outage; ask before switching models when model behavior or context could change the result.
5. Show and confirm the candidate count, provider/model, expected quota exposure, and any deletion/discard behavior before Best-of-N. Keep it bounded by the user's remaining budget and concurrency settings.

**Acceptance:** integration tests run synthetic 429, unknown quota, stale catalog, provider outage and local endpoint failure through card/rail/Best-of-N/hidden launch paths. Under strict no-paid mode, no transition can reach an unapproved or billable route.

#### P4 — Make free-model quality legible (evaluation and iteration)

1. Create a small, versioned set of representative Gavin tasks (simple edit, multi-file change, tests, plan, MCP/tool use). Run candidate models in isolated worktrees from the same commit, as Best-of-N already does.
2. Score task completion, tests, review findings, retries, wall time, token use, quota use, and user acceptance. Compare local/free routes to a paid baseline; don't equate “first response” or “free” with successful work.
3. Present model recommendations as task-specific evidence (“passed 8/10 tool-use tasks; median 3m”) rather than vague “best” labels. Keep score and sample size visible and let users disable recommendations.

**Acceptance:** recommendations have reproducible eval version, source model, sample count, confidence/recency, and an opt-out; no model is marked suitable for tool use without passing the relevant test category.

## UX guardrails

- **Say what “free” means.** Use “Local—no inference provider charge,” “Free provider allowance—quota applies,” “Included in subscription—shared limit,” “Paid,” or “Unknown.” Link the first-party evidence and display its check date.
- **Preview the effective launch.** Before a card/rail/fan-out, show agent CLI, provider, model, entitlement state, whether quota is shared, any fallback target, and the number of concurrent requests. Never show a selected model when the command already overrides it; Gavin's model composition already gives the user's explicit command precedence (`LucaGemma87/gavin:app/src/lib/agents/agentModel.ts:23-32,201-211`).
- **Make strict mode literal.** “No paid requests” must forbid unknown routes, advisors, subagents, auto-resume, fallback and background tools unless they are on the allow-list. A visible exception dialog is better than silently weakening the promise.
- **Treat missing data as missing.** A disconnected provider, unsupported CLI, expired quota snapshot or failed probe must not look like 0% used or unlimited free access (`LucaGemma87/gavin:app/src/lib/agents/agentUsage.ts:1-13,155-171,212-236`).
- **Warn about shared quotas and fan-out.** Explain that parallel runs spend multiple requests and can draw from one provider/project pool; default Best-of-N to a small count and require a policy-aware confirmation.
- **Make data terms visible.** Show whether prompts may be used for provider product improvement where the provider says so. Label local vs cloud routes clearly, and never imply local privacy for a hosted model.
- **Prevent capability surprises.** Detect when the chosen model/provider cannot satisfy tool-use or context needs; offer a safer alternative only if it respects the same cost policy.
- **Keep the wheel.** Require consent for downloads, external providers, paid routes, increased limits and any model switch that changes the task's execution semantics. Gavin's existing human-owned launch confirmation and visible terminal tabs are assets to keep.

## Success measures

Establish a baseline in dogfood before broad release; the following are proposed launch gates:

| Measure | Proposed target |
|---|---|
| Strict no-paid correctness | **0** billable/unapproved requests in automated end-to-end tests across every launch path; **100%** of policy-unknown launches blocked before dispatch. |
| Entitlement honesty | **100%** of model rows show a sourced, timestamped entitlement state or “Unknown”; **0** stale/unsupported rows presented as free. |
| Local-only proof | **0** inference requests to a remote host during local-only test runs; successful first local test run on each supported OS without manual config editing for at least 90% of test users. |
| Setup usability | Median time from opening setup to first successful allowed run under five minutes; at least 80% of target users finish without external documentation. |
| Safe rate-limit recovery | 100% of simulated provider quota exhaustion cases either stay within the allow-list or ask the human; no automatic paid fallback. |
| Work quality | Track completion/test-pass rate, rework, retries and median/p95 time for free/local vs paid baseline, segmented by task type and model capability. Do not ship “recommended” badges until the free/local path meets an agreed minimum quality threshold. |
| Economic value | Report provider cash cost, free quota consumed, tokens and local runtime separately per accepted card; trend cost per accepted task rather than raw token totals. |
| Transparency/consent | Track explicit approval of non-local providers, fallback switches and Best-of-N; opt-in aggregate telemetry only, with no prompts or secrets. |

## Risks and open questions

1. **Free tiers change.** Provider limits and model offers can rotate without a Gavin release. A stale promise is worse than a conservative “unknown”; plan for source refresh, expiry and user-visible degradation.
2. **Provider-specific API fragility.** Private endpoints, undocumented local files, token scraping and UI parsing can break or violate user expectations. Gavin's existing verified-route posture is a useful constraint, not needless caution.
3. **“Free” does not mean safe or capable.** Free-tier data terms can differ; local models can be slow or poor at tool use; provider caps may be shared across machines/users.
4. **Fallback changes correctness.** A different model may have different context, tools, output quality or safety. A 429 is not automatically proof of exhausted quota; generic rate limiting and outages should not trigger a free-model switch.
5. **Concurrency multiplies consumption.** Rails and Best-of-N can overwhelm per-project request/minute or daily limits. Keep these controls in the shared launch path, not scattered across individual dialogs.
6. **Financial truth is provider-owned.** Gavin can enforce a user-defined allow-list and show measured tokens/known quota, but cannot promise an account will never be charged if the provider's entitlement endpoint is unavailable or the account changes outside Gavin. For strict no-spend, favor verified local routes and make the boundary explicit.
7. **Market coverage should remain bounded.** Start with a few first-party, testable providers and local inference. Supporting every model registry creates ongoing metadata and support burden without proving task quality.

## Primary sources

### Gavin repository

- `LucaGemma87/gavin:.gavin-root/PRD.md:6-30,51-96` — product vision and built feature inventory.
- `LucaGemma87/gavin:app/src-tauri/src/agent_setup.rs:502-620,739-920,997-1092`, `LucaGemma87/gavin:app/src-tauri/src/agent_models.rs:1-80` — profile, quota and model-catalog integration seams.
- `LucaGemma87/gavin:app/src/lib/agents/agentModel.ts:189-256`, `LucaGemma87/gavin:app/src/lib/agents/agentUsage.ts:1-95,145-236`, `LucaGemma87/gavin:app/src/lib/agents/agentFallback.ts:114-149,195-262`; `LucaGemma87/gavin:app/src/lib/cards/complexity.ts:1-109`, `LucaGemma87/gavin:app/src/lib/cards/bestOfN.ts:1-12,300-330`, `LucaGemma87/gavin:app/src/lib/cards/bestOfNActions.ts:1-15,69-100` — model selection, economics-related behavior, routing and parallel-run UX.
- `LucaGemma87/gavin:docs/superpowers/specs/2026-08-25-agent-default-model-design.md:24-43` — model-setting decisions and the 2026-11-01 Cline free-model constraints.
- Existing report convention: date-prefixed Markdown files in `docs/research/` (for example `LucaGemma87/gavin:docs/research/2026-09-27-app-store-downloaded-code.md:1-18` and `LucaGemma87/gavin:docs/research/2026-09-28-companion-device-keys.md:1-16`).

### Official competitor and provider documentation (checked 2026-11-01)

- OpenCode: [Models](https://opencode.ai/docs/models/), [Providers](https://opencode.ai/docs/providers/), [Agents](https://opencode.ai/docs/agents/), [Permissions](https://opencode.ai/docs/permissions/).
- Cline: [Free models](https://docs.cline.bot/getting-started/free-models.md), [Cline provider](https://docs.cline.bot/getting-started/cline-provider.md), [Desktop](https://docs.cline.bot/usage/cline-desktop.md), [Kanban](https://docs.cline.bot/usage/kanban.md), [local models](https://docs.cline.bot/running-models-locally/overview.md).
- Continue: [Agent quick start](https://docs.continue.dev/ide-extensions/agent/quick-start), [Models](https://docs.continue.dev/customize/models), [Ollama provider](https://docs.continue.dev/customize/model-providers/top-level/ollama), [CLI quick start](https://docs.continue.dev/cli/quickstart).
- Roo Code: [Boomerang Tasks](https://docs.roocode.com/features/boomerang-tasks), [Auto-Approving Actions](https://docs.roocode.com/features/auto-approving-actions).
- Ollama: [Pricing](https://ollama.com/pricing), [Cloud models](https://ollama.com/blog/cloud-models).
- Google: [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).
- OpenRouter: [Rate limits, budgets and free-request counter](https://openrouter.ai/docs/api_reference/limits.md), [models and supported-parameter filters](https://openrouter.ai/docs/guides/overview/models.md).
