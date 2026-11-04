# Gavin Architecture Documentation

*Generated from knowledge graph analysis (graphify-out/graph.json — 29,979 nodes, 76,346 edges)*

---

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Rust Workspace (Crates)](#rust-workspace-crates)
4. [Frontend (Tauri + Svelte)](#frontend-tauri--svelte)
5. [Protocol & Communication](#protocol--communication)
6. [Session & State Management](#session--state-management)
7. [Agent Orchestration](#agent-orchestration)
8. [Git Operations](#git-operations)
9. [Remote Access & Pairing](#remote-access--pairing)
10. [UI Layout System](#ui-layout-system)
11. [Data Flow](#data-flow)
12. [Key Design Principles](#key-design-principles)

---

## System Overview

Gavin is a **multi-device AI agent orchestration platform** with:

- **Rust backend** (daemon, protocol, relay, MCP server) — handles agent execution, git operations, device pairing
- **Tauri + Svelte frontend** — desktop app with pane-based layout, kanban boards, terminal integration
- **Companion shell** — mobile/web companion for remote access
- **Protocol-first design** — all communication via typed Request/Response messages over WebSocket/stdio

**Core Philosophy**: "The code is the protocol" — crates own their wire formats; no separate IDL.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GAVIN SYSTEM ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │  Frontend    │    │   Daemon     │    │   Relay      │    │  Push    │  │
│  │  (Tauri/     │◄──►│  (Rust)      │◄──►│  (Rust)      │◄──►│  Gateway │  │
│  │   Svelte)    │    │              │    │              │    │  (FCM/   │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘    │  APNs)   │  │
│         │                   │                   │            └──────────┘  │
│         │         ┌─────────┴─────────┐        │                          │
│         │         │    Protocol       │        │                          │
│         └────────►│    Crate          │◄───────┘                          │
│                   │  (Request/Response)│                                  │
│                   └────────────────────┘                                  │
│                          │                                                │
│         ┌────────────────┼────────────────┐                              │
│         ▼                ▼                ▼                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                      │
│  │  Git Ops     │ │  Agent       │ │  Session     │                      │
│  │  (worktrees, │ │  Orchestration│ │  Management  │                      │
│  │   commits)   │ │  (rails,     │ │  (layout,    │                      │
│  └──────────────┘ │   plans)     │ │   state)     │                      │
│                   └──────────────┘ └──────────────┘                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layer Separation

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| **Protocol** | Rust (`crates/protocol`) | Wire format: `Request`/`Response` enums, serialization |
| **Transport** | Rust (`crates/daemon/src/transport.rs`, `crates/gavin-relay`) | WebSocket, stdio, WebRTC framing |
| **Daemon Core** | Rust (`crates/daemon/src/server.rs`, `crates/daemon/src/gavin.rs`) | Request routing, session lifecycle, agent spawning |
| **Frontend Core** | TypeScript (`app/src/lib/core/`) | Layout state, backend connection, workspace management |
---

## Rust Workspace (Crates)

Located in `crates/` — Cargo workspace with **7 crates**:

### Crate Dependency Graph

```
protocol ◄──────────────────────┐
   │                            │
   ▼                            │
companion-core ◄────────────────┤
   │                            │
   ▼                            │
companion-wasm                  │
   │                            │
   ▼                            │
gavin-daemon ───────────────────┤
   │                            │
   ▼                            │
gavin-relay ◄───────────────────┘
   │
   ▼
gavin-mcp
   │
   ▼
push-gateway
```

### Crate Details

| Crate | Purpose | Key Modules |
|-------|---------|-------------|
| **`protocol`** | Wire format definitions | `Request`, `Response`, `ToolDef`, `DeviceWire`, serialization (`write_message`/`read_message`) |
| **`companion-core`** | Device pairing, crypto, test device | `pairing.rs` (noise protocol), `test_device.rs`, `connect.rs` |
| **`companion-wasm`** | WASM bindings for companion | Re-exports companion-core for web |
| **`gavin-daemon`** | Main daemon binary | `server.rs` (request handling), `gavin.rs` (root config), `headroom/` (agent version detection), `browser/` (Playwright), `git/` (commands) |
| **`gavin-relay`** | WebSocket relay server | `server.rs`, `direct.rs` (peer-to-peer), `client.rs` |
| **`gavin-mcp`** | MCP (Model Context Protocol) server | `main.rs` (stdio transport), `shell_writes.rs`, `playwright.rs` |
| **`push-gateway`** | FCM/APNs push notifications | `fcm.rs`, `jwt.rs`, `sender.rs` |

### Key Daemon Modules (`crates/daemon/src/`)

| Module | Responsibility |
|--------|----------------|
| `server.rs` | `handle_request()` — main request router (7,000+ lines) |
| `gavin.rs` | Workspace root discovery, config persistence |
| `session.rs` | Session lifecycle, agent defaults, workspace tracking |
| `command_lane.rs` | Agent process management (spawn, stdin/stdout, signals) |
| `pairing.rs` | Device admission, noise key exchange |
| `remote.rs` | Dial/relay connections, `RemoteLink` |
| `headroom/` | Agent version detection (`detect.rs`, `version.rs`) |
| `git/commands.rs` | Git operations (worktrees, commits, diffs, conflicts) |
| `browser/` | Playwright automation for web agents |
| **UI Components** | Svelte (`app/src/lib/**/*.svelte`) | Hub views, panes, modals, git toolbar |
| **Companion** | TypeScript (`app/companion/`, `app/companion-shell/`) | Mobile surfaces, pairing flows |
---

## Frontend (Tauri + Svelte)

### Project Structure

```
app/
├── src/
│   ├── lib/
│   │   ├── core/           # LayoutState, backend.ts, workspace.ts, keyboard.ts
│   │   ├── orchestration/  # Rails, nodes, loop, prompts, search
│   │   ├── agents/         # AttentionInbox, agentPrimary, turnVerdict
│   │   ├── board/          # KanbanBoard, pageBoard, planFilter
│   │   ├── cards/          # CardComposeModal, RunChangesModal, CardTabPane
│   │   ├── files/          # FileEditor, PlanExplorerHubView, FilesHubView
│   │   ├── git/            # GitToolbar, GitCommitDetail, GitWorktreeSwitcher
│   │   ├── hub/            # AppHubView, HomeHubView, DecisionsHubView
│   │   ├── panes/          # Pane.svelte, layout.ts, tabMenu.ts
│   │   ├── sessions/       # SessionsManagerModal, doneSessionReclaim
│   │   ├── scheduling/     # ScheduledHubView
│   │   ├── shell/          # DaemonCompatBanner, Modal, confirmClose
│   │   ├── sidebar/        # Sidebar.svelte, sidebarSummary
│   │   ├── terminal/       # TerminalPane.svelte
│   │   └── ui/             # IconButton, ActivityCalendar
│   ├── routes/
│   │   └── +page.svelte    # Main entry (renders hub views)
│   └── tauri/              # Tauri Rust bindings (session.rs, remote.rs, etc.)
├── companion/              # Mobile companion (SvelteKit)
│   └── src/
│       ├── companion/
│       │   ├── state/      # workstation.ts, browser.ts, rails.ts
│       │   ├── surfaces/   # PhoneCard, PhoneRails, PhoneTerminal, PhoneGit
│       │   ├── demo/       # sampleData, railCommands
│       │   └── seam/       # agentCommit (e2e tests)
│       └── routes/+page.svelte
└── companion-shell/        # Pairing/inbox shell (SvelteKit)
    └── src/
        ├── shell/
        │   ├── pairing/    # pairing.e2e.ts, PairingSheet.svelte
        │   └── surfaces/   # InboxList.svelte, Hub.svelte
        └── routes/+layout.svelte
```

### Key Frontend Modules

| Module | Purpose |
|--------|---------|
| `backend.ts` | Daemon connection lifecycle, request/response handling, reconnection |
| `layoutState.ts` | **Central UI state** — `LayoutState` class manages panes, splits, tabs, persistence |
| `workspace.ts` | Workspace root management, SSH workspaces, `WorkspaceRootControl` |
| `orchestration.ts` | Rail orchestration loop, `Orchestration` class, node execution |
| `orchestrationLoop.ts` | Turn-based agent execution, `nextActions` driver |
| `attentionInbox.ts` | Agent attention requests (human-in-the-loop) |
| `sessionsManager.ts` | Session CRUD, `GavinTree` persistence |
| `gitState.ts` | Git status, worktree tracking, commit workflow |
| `remoteAccess.ts` | Device pairing UI, relay connection management |

---

## Protocol & Communication

### Message Format (crates/protocol/src/lib.rs)

```rust
// Request — client → daemon
pub enum Request {
    // Session management
    CreateSession { ... },
    ListSessions,
    CloseSession { session_id },
    
    // Agent orchestration
    SpawnAgent { session_id, agent_config },
    AgentInput { session_id, input },
    GetAgentStatus { session_id },
    
    // Git operations
    GitStatus { repo_path },
    GitCommit { repo_path, message, ... },
    GitWorktreeAdd { repo_path, branch },
    GitDiff { repo_path, ... },
    
    // File operations
    ReadFile { path },
    WriteFile { path, content },
    ListDirectory { path },
    
    // Remote access
    PairDevice { ... },
    ListDevices,
    RelayConnect { ... },
    
    // MCP
    McpListServers,
    McpCallTool { server, tool, args },
    ...
}

// Response — daemon → client
pub enum Response {
    Ok { data },
    Error { code, message },
    SessionCreated { session_id },
    AgentSpawned { agent_id },
    GitStatus { ... },
    FileContent { ... },
    DevicePaired { device_id },
    ...
}
```

### Serialization

- **Binary**: `write_message()` / `read_message()` — length-prefixed JSON over WebSocket/stdio
- **Transport**: 
  - **Desktop**: Tauri IPC → `session.rs` → WebSocket to daemon
  - **MCP**: stdio transport (`gavin-mcp/src/main.rs`)
  - **Relay**: WebSocket (`gavin-relay/src/server.rs`)
  - **Mobile**: WebSocket via relay + FCM/APNs push

### Version Negotiation

- `FEATURE_MIN_VERSION` in `daemonCompat.ts` — frontend declares minimum protocol version
- Daemon responds with supported version; incompatible clients show compat banner (`DaemonCompatBanner.svelte`)
---

## Session & State Management

### Session Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Create    │────►│  Initialize │────►│   Running   │────►│   Closed    │
│  Session    │     │  (git,      │     │  (agents,   │     │  (archive,  │
│  (backend)  │     │   config)   │     │   orchestr.)│     │   reclaim)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
  CreateSession      SetAgentDefaults    OrchestrationLoop    CloseSession
  Request            (session.rs)        (orchestrationLoop.ts) Request
```

### State Stores

| Store | Location | Persists |
|-------|----------|----------|
| **LayoutState** | `app/src/lib/core/layoutState.ts` | Pane tree, splits, active tabs, sidebar width |
| **SessionManager** | `app/src/lib/sessions/sessionsManager.ts` | Session list, `GavinTree` (workspace → sessions) |
| **OrchestrationState** | `app/src/lib/orchestration/orchestrationState.ts` | Rail nodes, execution history, `findSessionLocation` |
| **GitState** | `app/src/lib/git/gitState.ts` | Repo status, worktrees, staged/unstaged changes |
| **AgentPauseState** | `app/src/lib/agents/agentPauseState.ts` | Paused agents, resume conditions |
| **AttentionInbox** | `app/src/lib/agents/attentionInbox.ts` | Pending human-review items |

### Persistence

- **LayoutState**: `persistWorkspaces()` → localStorage (per workspace root)
- **Sessions**: `GavinTree` → `.gavin-root/sessions/` (JSON per session)
- **Agent defaults**: `session.rs` → `.gavin-root/config.toml`
---

## Agent Orchestration

### Rail-Based Architecture

Agents run on **rails** — named execution contexts with their own state:

```
┌────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LOOP                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │  Rail   │───►│  Node   │───►│  Agent  │───►│  Turn   │  │
│  │  Queue  │    │  Select │    │  Spawn  │    │  Verdict│  │
│  └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘  │
│       │              │              │              │        │
│       ▼              ▼              ▼              ▼        │
│  orchestrationNodes  railConfirm   command_lane   turnVerdict
│  .ts                 .ts           .rs              Driver
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | File | Role |
|-----------|------|------|
| **Orchestration** | `orchestration.ts` | Main loop, rail queue management |
| **OrchestrationLoop** | `orchestrationLoop.ts` | Turn execution, `nextActions` driver |
| **OrchestrationNodes** | `orchestrationNodes.ts` | Node registry, `OrchestrationNode` type |
| **RailConfirm** | `railConfirm.ts` | Human confirmation for rail transitions |
| **OrchestrationPrompts** | `orchestrationPrompts.ts` | System prompts per rail type |
| **AttentionInbox** | `attentionInbox.ts` | Blocks execution until human responds |
| **TurnVerdictDriver** | `turnVerdictDriver.ts` | Classifies agent turn outcome (continue/pause/done) |

### Rail Types

- **`plan`** — Planning/exploration (read-only)
- **`implement`** — Code changes (write access)
- **`review`** — Human review of changes
- **`git`** — Commit/push operations
- **`terminal`** — Direct shell access

### Mobile Companion Rails

- `phoneRails.ts` — `PhoneRails.svelte` surface
- `rails.ts` — Shared rail state (`Rail`, `RailTrigger`, `RailTriggerVerdict`)
---

## Git Operations

### Daemon-Side (Rust)

**Module**: `crates/daemon/src/git/commands.rs` (3,000+ lines)

| Operation | Function | Tests |
|-----------|----------|-------|
| Status | `status_lists_staged_unstaged_and_untracked()` | ✅ |
| Diff | `diff_unstaged_staged_and_untracked()` | ✅ |
| Commit | `stage_all_and_unstage_all_including_on_an_unborn_head()` | ✅ |
| Worktree add | `a_worktree_in_gavin_worktrees_leaves_the_enclosing_checkout_clean()` | ✅ |
| Worktree remove | `a_worktree_add_stopped_mid_checkout_leaves_nothing_behind()` | ✅ |
| Cherry-pick | `cherry_pick_conflict_revert_and_reset_modes()` | ✅ |
| Log | `log_pages_over_all_branches_with_decorations()` | ✅ |
| Refs snapshot | `refs_snapshot_from_a_real_repo_with_a_stash()` | ✅ |
| Repo info | `repo_info_detects_unborn_and_detached_heads()` | ✅ |
| `.claude.md` excludes | `write_claude_md_excludes_merges_into_an_existing_file_but_never_touches_an_existing_key()` | ✅ |

### Frontend-Side

| Component | File | Purpose |
|-----------|------|---------|
| **GitToolbar** | `GitToolbar.svelte` | Commit UI, agent commit control, worktree switcher |
| **GitCommitDetail** | `GitCommitDetail.svelte` | Commit inspection, diff view |
| **GitWorktreeSwitcher** | `GitWorktreeSwitcher.svelte` | Worktree navigation |
| **GitConflictView** | `GitConflictView.svelte` | Merge conflict resolution |
| **GitNav** | `GitNav.svelte` | Branch/tag navigation |
| **gitState.ts** | `gitState.ts` | Reactive git status, worktree tracking |

### Worktree Strategy

- Gavin creates **isolated worktrees** per session/agent
- `.gavin-worktrees/` folder auto-ignored
- Parent checkout stays clean
- `.claude.md` excludes merged per worktree
---

## Remote Access & Pairing

### Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Mobile    │────────►│   Relay     │────────►│   Desktop   │
│  Companion  │  WS     │  (gavin-    │  WS     │   Daemon    │
│  (SvelteKit)│         │   relay)    │         │  (Rust)     │
└─────────────┘         └─────────────┘         └─────────────┘
       │                      │                      │
       │         ┌────────────┴────────────┐        │
       └────────►│      Push Gateway       │◄───────┘
                 │   (FCM/APNs)            │
                 └─────────────────────────┘
```

### Pairing Flow (Noise Protocol)

1. **Mobile** generates Noise keypair → shows QR code
2. **Desktop** scans QR → `pairing.rs` performs Noise handshake
3. **Admission token** issued → stored in `companion-core`
4. **Relay connection** established via `gavin-relay`
5. **FCM/APNs** registered for push notifications

### Key Modules

| Module | File | Purpose |
|--------|------|---------|
| **Pairing** | `crates/companion-core/src/pairing.rs` | Noise XX handshake, admission tokens |
| **Test Device** | `crates/companion-core/src/test_device.rs` | E2E test harness (`.dial()`, `.pair_with()`) |
| **Remote Access** | `app/src/lib/core/remoteAccess.ts` | Device list, pairing UI, relay status |
| **Relay Client** | `crates/gavin-relay/src/client.rs` | `RemoteLink`, `.dial()`, connection pooling |
| **Push Gateway** | `crates/push-gateway/src/` | FCM (Android), APNs (iOS), JWT auth |
| **Session Ownership** | `app/src/lib/core/sessionOwnership.ts` | Prevents concurrent mobile/desktop editing |

### Device Presence

- `devicePresence.ts` — Tracks connected devices, typing indicators
- `keepRunningState.ts` — Prevents daemon sleep during active mobile session
---

## UI Layout System

### Pane Tree (LayoutState)

```
LayoutState (root)
├── Pane (split: horizontal)
│   ├── Pane (type: hub) → OrchestrationHubView
│   └── Pane (split: vertical)
│       ├── Pane (type: board) → KanbanBoard
│       └── Pane (type: terminal) → TerminalPane
├── Pane (type: sidebar) → Sidebar
└── Pane (type: modal) → CardComposeModal
```

### Key Types

```typescript
// app/src/lib/panes/layout.ts
type LayoutNode = 
  | { type: 'leaf'; paneId: string; component: ComponentType }
  | { type: 'split'; direction: 'horizontal' | 'vertical'; children: LayoutNode[]; sizes: number[] }

// app/src/lib/core/layoutState.ts
class LayoutState {
  root: LayoutNode
  paneRegistry: Map<string, PaneInstance>
  activePaneId: string
  sidebarWidth: number
  
  splitPane(paneId, direction, newComponent)
  closePane(paneId)
  setActivePane(paneId)
  persistWorkspaces()  // → localStorage
}
```

### Preset Layouts

| Preset | Function | Layout |
|--------|----------|--------|
| Single | `presetSingle()` | One pane |
| Side-by-side | `presetSideBySide()` | 50/50 vertical split |
| 2×2 Grid | `presetGrid2x2()` | 4 equal panes |

### Keyboard Shortcuts

- `keyboard.ts` — `handleShortcutKeydown()` maps keys to pane actions
- Split: `Ctrl+Shift+←/→/↑/↓`
- Navigate: `Ctrl+Tab` (pane), `Ctrl+Shift+Tab` (tab)
- Close: `Ctrl+W`
---

## Data Flow

### Request Flow (Frontend → Daemon)

```
User Action (Svelte)
       │
       ▼
backend.ts.sendRequest(Request)
       │
       ▼
session.rs.send_request()  (Tauri IPC)
       │
       ▼
WebSocket → gavin-relay (if remote) OR direct to daemon
       │
       ▼
daemon/src/server.rs.handle_request()
       │
       ├──► Git ops → git/commands.rs
       ├──► Agent spawn → command_lane.rs.spawn_with()
       ├──► Session mgmt → session.rs
       ├──► File ops → std::fs
       └──► Remote → remote.rs / pairing.rs
       │
       ▼
Response serialized via write_message()
       │
       ▼
WebSocket → Frontend → backend.ts handles Response
       │
       ▼
State updated (LayoutState, GitState, etc.)
       │
       ▼
Svelte reactivity → UI re-renders
```

### Agent Turn Flow

```
OrchestrationLoop.nextActions()
       │
       ▼
Select rail node → railConfirm() if needed
       │
       ▼
command_lane.rs.spawn_with(agent_config)
       │
       ▼
Agent process runs (stdio/PTY)
       │
       ├──► stdout/stderr → stream_writer.rs → frontend
       ├──► Tool calls → MCP (gavin-mcp) → daemon
       └──► Exit code → turnVerdictDriver.classify()
       │
       ▼
TurnVerdict: Continue | Pause | Done | Error
       │
       ▼
OrchestrationLoop schedules next action OR pushes to AttentionInbox
```

### Mobile Sync Flow

```
Desktop: Session state change
       │
       ▼
daemon/src/server.rs broadcasts SessionUpdate
       │
       ▼
gavin-relay → Push Gateway → FCM/APNs
       │
       ▼
Mobile: Push received → WebSocket reconnect → Request full state
       │
       ▼
Mobile UI updates (PhoneCard, PhoneRails, PhoneTerminal)
---

## Key Design Principles

### 1. Protocol-First, Code-Owns-Wire-Format
- No separate IDL (Protobuf/Cap'n Proto)
- `crates/protocol` is the single source of truth
- Crates that emit/consume messages own their variants

### 2. Daemon as Authority
- All state mutations go through daemon
- Frontend is a **view** — optimistic updates only for latency hiding
- Mobile companion is a **remote view** — same protocol

### 3. Worktree Isolation
- Every agent session gets its own git worktree
- Parent repo stays clean
- Enables concurrent agents without conflicts

### 4. Rail-Based Orchestration
- Explicit execution contexts (rails) with typed transitions
- Human confirmation gates (`railConfirm`) for risky operations
- Turn verdicts drive automatic continuation

### 5. Attention as First-Class Citizen
- `AttentionInbox` blocks orchestration until human responds
- Mobile push notifications for attention requests
- Unified across desktop/mobile

### 6. Persistent, Portable Layout
- `LayoutState` serializes to JSON
- Restored per workspace root
- Survives daemon restart, device switch

### 7. Test-Driven Protocol
- `companion-core/test_device.rs` provides scriptable test harness
- E2E tests in `pairing.e2e.ts`, `agentCommit.test.ts`
- Daemon fixtures in `crates/daemon/tests/fixtures/daemon.rs`

### 8. MCP Integration
- `gavin-mcp` exposes daemon as MCP server
- Agents can call tools via stdio (Claude Code, Codex, etc.)
- Foreign MCP servers auto-detected (`agent_setup.rs`)
---

## Directory Map (Key Files)

```
.gavin-root/                 # Workspace root marker
├── PRD.md                   # Product requirements
├── plans/                   # Archived feature plans
├── sessions/                # Session persistence (JSON)
└── config.toml              # Agent defaults

crates/
├── protocol/src/lib.rs      # Request/Response definitions
├── companion-core/src/
│   ├── pairing.rs           # Noise protocol
│   └── test_device.rs       # Test harness
├── daemon/src/
│   ├── server.rs            # handle_request() — 7k lines
│   ├── gavin.rs             # Workspace root, config
│   ├── session.rs           # Session lifecycle
│   ├── command_lane.rs      # Agent process management
│   ├── git/commands.rs      # Git operations
│   ├── headroom/            # Agent version detection
│   └── browser/             # Playwright automation
├── gavin-relay/src/         # WebSocket relay
├── gavin-mcp/src/main.rs    # MCP stdio server
└── push-gateway/src/        # FCM/APNs

app/
├── src/lib/core/
│   ├── backend.ts           # Daemon connection
│   ├── layoutState.ts       # Pane tree + persistence
│   ├── workspace.ts         # Workspace management
│   ├── remoteAccess.ts      # Pairing, devices
│   └── daemonCompat.ts      # Version negotiation
├── src/lib/orchestration/   # Rails, nodes, loop, prompts
├── src/lib/agents/          # Attention, turn verdicts
├── src/lib/board/           # Kanban, plans
├── src/lib/git/             # Toolbar, commit, worktrees
├── src/lib/panes/           # Layout primitives
├── src/routes/+page.svelte  # Main desktop entry
├── src-tauri/src/
│   ├── session.rs           # Tauri ↔ daemon bridge
│   ├── remote.rs            # Relay dial
│   ├── git/commands.rs      # Git FFI (if any)
│   └── agent_setup.rs       # MCP config, agent profiles
├── companion/src/           # Mobile companion (SvelteKit)
└── companion-shell/src/     # Pairing shell (SvelteKit)
```

---

## Extension Points

| Extension | How |
|-----------|-----|
| **New Request/Response** | Add variant to `crates/protocol/src/lib.rs`, handle in `server.rs.handle_request()` |
| **New Rail Type** | Add to `OrchestrationNode` registry (`orchestrationNodes.ts`), add prompt (`orchestrationPrompts.ts`) |
| **New Git Command** | Add function to `git/commands.rs`, expose via `Request::Git*` |
| **New MCP Tool** | Implement in `gavin-mcp/src/main.rs` or register foreign server in `agent_setup.rs` |
| **New UI Hub** | Create Svelte component in `src/lib/hub/`, register in `workspaceViews.ts` |
| **New Platform** | Implement transport in `gavin-relay` or `session.rs`, add push gateway support |

---

## Related Documentation

- `graphify-out/GRAPH_REPORT.md` — Full community analysis
- `graphify-out/graph.html` — Interactive graph visualization
- `docs/superpowers/specs/` — Feature specifications
- `docs/dev-setup.md` — Local development setup
- `.gavin-root/PRD.md` — Product requirements

---

*Generated: 2026-11-02 | Graph commit: `4a29c6be` | Run `graphify . --update` after code changes*