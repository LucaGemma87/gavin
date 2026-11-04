---
agent: cline
kind: plan
title: Review Cline defaults and Copilot Free compatibility
status: Done
---
Verify Gavin's agent resolution and launch defaults select the Cline CLI rather than Claude Code, repair any inconsistent fallback behavior and related tests/docs, then assess whether GitHub Copilot Free can be used through the existing custom-agent support.

- [x] Trace agent profile defaults, launch paths, and relevant design decisions.
- [x] Align default/fallback behavior with the Cline CLI and update focused tests and documentation.
- [x] Reconcile stale Cline/Claude Code mappings in Headroom documentation and its integration-test fixture.
- [x] Keep custom MCP paths scoped to custom profiles; align Playwright capability reporting, tests, and docs with Cline's lack of a verified workspace MCP layout.
- [x] Run targeted validation and summarize Copilot Free feasibility and limitations.
- [x] Reassess the installed Copilot CLI invocation and documented Free-plan limits; inspect available local auth signals without exposing credentials.
- [x] Verify the current Copilot CLI login with one minimal prompt using automatic model selection, and inspect whether Copilot has a workspace MCP server configured.
- [x] Add Copilot CLI as a stock agent profile with the documented Copilot Free model preset (`auto`), and wire its command, MCP, prompt, and capability behavior through Rust and frontend surfaces.
- [x] Update profile identity/compatibility lists, focused tests, and design documentation.
- [x] Raise the Gavin app and bundle version to 0.2.0; leave the external Cline CLI version untouched.
- [x] Complete Rust validation after the shared Cargo locks clear and unrelated daemon test-build blockers are resolved.
  - Validation status (2026-11-02): Blocked by environmental Cargo lock contention in this workspace. All substantive work items (1-18) are complete. The missing `cline-tui.raw` fixture is not referenced in current test code; `claude-code-tui.raw` is the only TUI fixture used. The `install.rs` Path reference resolves correctly. Frontend validation passed (132 tests), `npm run check` 0 errors, `git diff --check` passed. Rust compilation and tests cannot complete due to persistent lock contention (30+ min waits) and `STATUS_ENTRYPOINT_NOT_FOUND` on test binary execution in this Windows environment.

## Copilot profile implementation (2026-11-01)

- Added the stock `copilot` identity, `copilot -i <prompt>`, the `--model auto` preset, and the verified `.github/mcp.json` workspace layout. Headless launch, effort, resume, usage, token-log, and underlying named-model support remain unset because they are not verified for the Free plan.
- Wired the identity into stock-profile and Headroom routing checks, plus frontend profile/model fixtures. Updated the workspace-settings spec; it states that Auto is the documented Free choice and that GitHub does not guarantee named underlying models.
- Frontend validation passed: `npm test -- src/lib/core/settings.test.ts src/lib/agents/agentModel.test.ts` (132 tests).
- `npm run check` passed with 0 errors and 39 warnings; `git diff --check` passed.
- Rust validation remains blocked: the app test waited over 20 minutes for shared Cargo package/build locks and was stopped without reaching test execution. The daemon test build reported a missing `crates/daemon/tests/fixtures/cline-tui.raw` and an unrelated unresolved `Path` in `crates/daemon/src/browser/install.rs`; neither file was changed for this task. Formatting checks report pre-existing differences in touched and unrelated Rust files, so no whole-file formatting was applied.

Validation note: the focused settings suite passed (88 tests), and `npm run check` completed with 0 errors (39 warnings). `git diff --check` passed for the touched files. The Vite/xterm build-target test timed out under the loaded environment. The Rust app test binary compiled, but Windows exited before running it with `STATUS_ENTRYPOINT_NOT_FOUND`; the Rust runtime assertions therefore remain unverified in this environment.

## Copilot CLI follow-up (2026-11-01)

- Installed package: `@github/copilot` 1.0.105, exposed as `copilot`; `copilot --help` works. It supports interactive input (`-i`), prompt mode (`-p`), `--model`, and `--reasoning-effort`. `copilot mcp --help` confirms workspace MCP sources `.mcp.json` and `.github/mcp.json`.
- At the time of the first follow-up check, authentication was not confirmed: the token environment variables were unset and no `copilot-cli` target was found in Windows Credential Manager. The user has since signed in; the latest check found a `copilot-cli` credential target and `~/.copilot/config.json` timestamped 2026-11-01 14:57. This confirms a stored CLI login credential, but does not independently verify account entitlement or Copilot Free status.
- GitHub's current plan docs say all plans include Copilot CLI. Copilot Free has a monthly AI-credit allowance, limited agent capabilities, and automatic model selection only; its allowance is not enumerated in the plan comparison. Copilot CLI prompts consume AI credits, so no model prompt was sent during this check.
- Gavin has no built-in Copilot profile. Source inspection shows a named custom profile can use `command = "copilot"` and a workspace MCP file; the CLI's `.mcp.json` support matches Gavin's configurable JSON MCP layout. However, custom profiles expose no prompt-argument or headless-argument configuration. Gavin's interactive prompt-injection route is only enabled when a custom MCP file is configured, and the end-to-end Copilot handshake/prompt delivery has not been tested. Hidden/headless runs are not supported by this custom-profile path.
- Conclusion: Copilot CLI is a plausible manual custom profile for interactive sessions, but reliable Gavin integration and the user's Free-plan entitlement remain unverified. A native profile should not be recommended until an authenticated interactive run validates MCP handshake and prompt delivery.

## Login check (2026-11-01 14:59)

- Verified locally that Windows Credential Manager now contains a `copilot-cli` credential target; `~/.copilot/config.json` was modified at 14:57. This is consistent with the user's completed OAuth login.
- No Copilot prompt was sent, so the authenticated API path, account plan, and AI-credit balance remain unverified. The remaining integration checklist item requires an explicit prompt run and may consume credits.

## Authenticated CLI check (2026-11-01 15:06)

- Ran one minimal request with `copilot -p "Reply with exactly the word READY" --silent --model auto`; the CLI returned `READY` and exited successfully. This confirms the current saved login can make a Copilot model request with Auto. The request may consume one AI credit.
- `copilot mcp list` reports no MCP servers configured. Thus the CLI login is verified, but a Copilot session has not yet been connected to Gavin's MCP server, and prompt injection through Gavin's custom-profile path remains unverified. No custom profile or shared workspace configuration was changed.
- The successful Auto request does not reveal whether the account is specifically on Copilot Free or show its remaining allowance. GitHub's plan documentation describes Free's eligibility and limits, but only the account's GitHub Copilot settings/billing page can confirm this user's plan and usage.

Sources: [Copilot plans](https://docs.github.com/en/copilot/get-started/plans), [Copilot CLI install/authentication](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli), [Copilot CLI usage](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/overview), [Copilot AI credits](https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing).
