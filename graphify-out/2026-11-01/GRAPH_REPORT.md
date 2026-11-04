# Graph Report - plans  (2026-11-01)

## Corpus Check
- Corpus is ~33,721 words - fits in a single context window. You may not need a graph.

## Summary
- 198 nodes · 159 edges · 46 communities (20 shown, 26 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token usage: unavailable (agent extraction did not report token totals)

## Community Hubs (Navigation)
- Nested orchestration ticks
- Playwright browser integration
- Scheduled task planning
- Companion browser views
- Companion request pipelining
- Daemon command responsiveness
- Activity calendar tasks
- Cline and Copilot compatibility
- Activity calendar architecture
- Git and diff tabs
- Companion push notifications
- Agent model attribution
- Headroom savings attribution
- Scheduled task surfaces
- Git ignore card tracking
- Theme contrast system
- Windows desktop reliability
- Workspace activity journal
- Cursor usage parsing
- MCP card refresh
- SSH cross-platform verification
- Workspace Git history
- Windows MCP pipe handling
- Decision session visibility
- Orchestration layout
- Nested task execution
- Scheduled task copying
- SSH Git watcher
- Headroom platform support
- Fallback settings persistence
- CodeMirror enhancements
- Linux porting
- Playwright integration docs
- Daemon test isolation
- Windows codesign entitlements
- macOS host verification
- Linux host verification
- Windows host verification
- Recycle bin restore validation

## God Nodes (most connected - your core abstractions)
1. `[perf] main-thread command audit` - 9 edges
2. `[orch-nested] scheduler expands an orchestrated plan's step` - 8 edges
3. `Review Cline defaults and Copilot Free compatibility` - 8 edges
4. `[orch-nested] daemon: children: field, gavin_tick_item, nested-run rows` - 7 edges
5. `[orch-nested] Companion parity for orchestrated plans` - 7 edges
6. `Playwright browser broker in the daemon + gavin-mcp shim` - 7 edges
7. `Companion live view of an agent's browser` - 7 edges
8. `Activity Calendar` - 7 edges
9. `[orch-nested] desk: Children toggle, nested run state on the plan's card` - 6 edges
10. `Playwright install per agent profile + wizard step + Home catchup` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Activity Calendar` --semantically_similar_to--> `Workspace Log Tab`  [INFERRED] [semantically similar]
  tbd-feat-activity-calendar.md → workspace-log-tab.md
- `[perf] companion request pipelining` --semantically_similar_to--> `[perf] companion workspace sync`  [INFERRED] [semantically similar]
  done/perf-companion-request-pipelining.md → done/perf-companion-workspace-sync.md
- `Resizable diff file-list pane` --semantically_similar_to--> `Resizable commit and diff panes`  [INFERRED] [semantically similar]
  done/ui-diff-tab.md → done/ui-git-tab.md
- `The daemon's git watcher watches only for an SSH desk` --conceptually_related_to--> `SSH support`  [INFERRED]
  memory-daemon-git-watch-is-ssh-only.md → feat-ssh-support.md
- `A Device command needs a desk window open` --conceptually_related_to--> `Companion push end-to-end chain`  [INFERRED]
  memory-device-commands-need-a-desk-window.md → companion-ios-push-is-not-wired-end-to-end.md

## Hyperedges (group relationships)
- **Activity calendar sources and Companion/desktop surfaces** — _gavin_root_plans_activity_calendar_desktop_activity_calendar_core_and_desktop_surfaces, _gavin_root_plans_activity_calendar_companion_activity_calendar_companion, _gavin_root_plans_activity_calendar_runs_activity_calendar_runs_by_time_range, _gavin_root_plans_activity_calendar_git_activity_calendar_commits_pushes_files [EXTRACTED 1.00]
- **Orchestrated nested-plan implementation** — gavin_root_plans_orch_nested_01_daemon_plan, gavin_root_plans_orch_nested_02_scheduler_plan, gavin_root_plans_orch_nested_03_desk_ui_plan, gavin_root_plans_orch_nested_04_companion_plan, gavin_root_plans_orch_nested_05_skills_plan [EXTRACTED 1.00]
- **Playwright browser integration across daemon, desktop, and phone** — gavin_root_plans_playwright_browser_broker_plan, gavin_root_plans_playwright_companion_view_plan, gavin_root_plans_playwright_install_wizard_plan, gavin_root_plans_playwright_live_pane_plan, gavin_root_plans_playwright_phone_view_ssh_sessions_plan, gavin_root_plans_playwright_spike_plan [EXTRACTED 1.00]
- **Scheduled-task protocol, execution, and hub delivery** — gavin_root_plans_scheduled_01_daemon_protocol_plan, gavin_root_plans_scheduled_02_app_scheduler_plan, gavin_root_plans_scheduled_03_hub_tab_plan [EXTRACTED 1.00]
- **Inputs to the Activity Calendar** — gavin_root_plans_tbd_feat_activity_calendar_activity_calendar, gavin_root_plans_tbd_feat_activity_calendar_activity_sources, gavin_root_plans_tbd_feat_activity_calendar_zoomable_time_bucketing [EXTRACTED 1.00]
- **Workspace Log Collection, Storage, and Protocol** — gavin_root_plans_workspace_log_journal_workspace_log_journal, gavin_root_plans_workspace_log_journal_workspace_log_table, gavin_root_plans_workspace_log_journal_protocol_v79_log_requests [EXTRACTED 1.00]
- **Companion workspace connection performance improvements** — _gavin_root_plans_done_perf_companion_workspace_sync_card, _gavin_root_plans_done_perf_companion_request_pipelining_card, _gavin_root_plans_done_perf_companion_request_pipelining_fifo_request_pipelining [INFERRED 0.95]

## Communities (46 total, 26 thin omitted)

### Community 0 - "Nested orchestration ticks"
Cohesion: 0.10
Nodes (18): [orch-nested] daemon: children: field, gavin_tick_item, nested-run rows, docs/adr/0012-a-nested-task-finishes-by-its-tick.md, feat-plan-orchestrates-nested-tasks.md, [orch-nested] scheduler expands an orchestrated plan's step, CONTEXT.md, docs/adr/0012-a-nested-task-finishes-by-its-tick.md, feat-plan-orchestrates-nested-tasks.md, docs/superpowers/specs/2026-08-21-orchestration-tab-design.md (+10 more)

### Community 1 - "Playwright browser integration"
Cohesion: 0.11
Nodes (14): Playwright browser broker in the daemon + gavin-mcp shim, docs/superpowers/specs/2026-10-08-playwright-integration-design.md, feat-tbdeveloped-playwright-integration.md, Playwright install per agent profile + wizard step + Home catchup, app/src-tauri/src/agent_skills.rs, docs/superpowers/specs/2026-10-08-playwright-integration-design.md, feat-tbdeveloped-playwright-integration.md, docs/superpowers/specs/2026-10-05-mattpocock-skills-install-matrix.md (+6 more)

### Community 2 - "Scheduled task planning"
Cohesion: 0.15
Nodes (11): Scheduled tasks: daemon + protocol, docs/adr/0010-a-scheduled-task-is-a-copy.md, feat-scheduled-tasks-plans.md, CONTEXT.md, Scheduled tasks: app scheduler + headless fire, docs/adr/0010-a-scheduled-task-is-a-copy.md, feat-scheduled-tasks-plans.md, CONTEXT.md (+3 more)

### Community 3 - "Companion browser views"
Cohesion: 0.18
Nodes (9): Companion live view of an agent's browser, app/companion/README.md, device-wire docs, docs/superpowers/specs/2026-10-08-playwright-integration-design.md, feat-tbdeveloped-playwright-integration.md, Phone live view of an agent's browser in an ssh workspace, c4b6b703, docs/superpowers/specs/2026-10-08-playwright-integration-design.md (+1 more)

### Community 4 - "Companion request pipelining"
Cohesion: 0.20
Nodes (10): [perf] companion request pipelining, Companion wire timing, FIFO request pipelining, Late-reply and timeout handling, mcpForeignChoice.ts pure choice module, [perf] companion workspace sync, Device request-reply pairing, Prioritize session names and baselines (+2 more)

### Community 5 - "Daemon command responsiveness"
Cohesion: 0.20
Nodes (10): [perf] main-thread command audit, Daemon command connection mutex, Device-push command-reply desynchronization, Main-thread Tauri command blocking, Non-atomic workspace config persistence, Orchestration reply after plan push, Daemon redial Hello identity, async and spawn_blocking migration (+2 more)

### Community 6 - "Activity calendar tasks"
Cohesion: 0.20
Nodes (8): Activity Calendar, Activity Calendar Companion Task, Activity Calendar Desktop Task, Activity Calendar Git Task, Activity Calendar Runs Task, Live Pushes and Paged Log List, Pure Workspace Log Module, Workspace Log Tab

### Community 7 - "Cline and Copilot compatibility"
Cohesion: 0.22
Nodes (5): Review Cline defaults and Copilot Free compatibility, GitHub Copilot CLI installation and authentication documentation, GitHub Copilot CLI usage documentation, GitHub Copilot AI credits documentation, GitHub Copilot plans documentation

### Community 8 - "Activity calendar architecture"
Cohesion: 0.38
Nodes (5): Activity calendar: Companion, Activity calendar: core and desktop surfaces, Activity calendar: commits, pushes and files, Activity calendar: runs by time range, Workspace log

### Community 9 - "Git and diff tabs"
Cohesion: 0.29
Nodes (7): [ui] diff tab, Resizable diff file-list pane, Tooltip for truncated file paths, [ui] Git tab, Constrained split sizing and reset, Persisted per-workspace Git split shares, Resizable commit and diff panes

### Community 10 - "Companion push notifications"
Cohesion: 0.40
Nodes (5): Companion iOS push notifications are not wired end-to-end, Companion push end-to-end chain, Companion on a real iPhone: smoke test lists, Re-run airplane-mode test from Control Center, A Device command needs a desk window open

### Community 12 - "Headroom savings attribution"
Cohesion: 0.40
Nodes (3): The hub credits Headroom savings to the workspace's default agent, not the agent that ran, app/src/lib/agents/headroomSavings.ts, app/src/lib/hub/AppHubView.svelte

### Community 13 - "Scheduled task surfaces"
Cohesion: 0.40
Nodes (4): ADR 0003, Companion Scheduled Surface, Scheduled Tasks Parent Plan, Scheduled Hub Tab Prerequisite

### Community 14 - "Git ignore card tracking"
Cohesion: 0.50
Nodes (3): [feat] gitignore/git exclude cards, Index untracking when ignoring a committed card, Git ignore and exclude modes for cards

### Community 15 - "Theme contrast system"
Cohesion: 0.50
Nodes (3): Companion Muted Text Contrast Card, Inkless Fills Contrast Guard, Theme Text and Fill Contrast Audit

### Community 16 - "Windows desktop reliability"
Cohesion: 0.50
Nodes (3): Terminal Path Link Fix Card, Windows Terminal Path Tokenizer Failure, Windows Desktop Pass

### Community 17 - "Workspace activity journal"
Cohesion: 0.50
Nodes (4): Workspace Card and Human-Item Snapshot Diff, Protocol v79 Workspace Log Requests, Workspace Log Journal, Workspace Log Table

### Community 18 - "Cursor usage parsing"
Cohesion: 0.67
Nodes (3): [bug] Cursor usage summary stale, Cursor DashboardService usage endpoint, Legacy usage-summary parsing fallback

### Community 19 - "MCP card refresh"
Cohesion: 0.67
Nodes (3): [bug] MCP card generation not working, Filesystem watcher re-arming, Live kanban and Git refresh

### Community 21 - "Workspace Git history"
Cohesion: 0.67
Nodes (3): Per-Reflog Cursor and Shrink Reset, Workspace Log Git Entries, Workspace Log Journal Task

## Knowledge Gaps
- **112 isolated node(s):** `Fallback limits ignored after restart`, `Windows gavin-mcp hangs on tools/list`, `Re-run airplane-mode test from Control Center`, `CodeMirror autocomplete and light formatting`, `Linux port: the half that needs a Linux machine` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 153 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Playwright browser broker in the daemon + gavin-mcp shim` connect `Playwright browser integration` to `Companion browser views`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `Fallback limits ignored after restart`, `Windows gavin-mcp hangs on tools/list`, `Re-run airplane-mode test from Control Center` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Nested orchestration ticks` be split into smaller, more focused modules?**
  _Cohesion score 0.09881422924901186 - nodes in this community are weakly interconnected._
- **Why does `Companion live view of an agent's browser` connect `Companion browser views` to `Playwright browser integration`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Should `Playwright browser integration` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
