# Gavin

A desktop workspace where a human runs and steers coding agents in terminals, led by a PRD and a board of cards. This glossary names the concepts the code and the design documents share.

## Language

### Agents

**Integration**:
What Gavin writes into an agent's own configuration so the agent can use Gavin: its MCP server and its instructions file.
_Avoid_: setup (that is the whole wizard), install

**Agent tooling**:
A third-party tool Gavin sets up to run alongside the agents, such as Matt Pocock's skills or Headroom. Gavin can check whether it is there, and when it cannot, it takes the human's word.
_Avoid_: integration (that is Gavin wiring itself into an agent), plugin, add-on, extension

**Headroom**:
The agent tooling that compresses what an agent sends to its model, so the same work spends fewer tokens of a subscription's limits.
_Avoid_: proxy (on its own), the compressor, token saver

**Compressed session**:
A session whose agent sends its model traffic through Headroom. Whether a session is compressed is settled when its agent launches.
_Avoid_: routed session, proxied session, headroom session

### Agent economics

**Provider free allowance**:
Inference covered by a provider's free quota, with that quota's limits and scope. It is not proof of continuous availability.
_Avoid_: free model

**Included subscription quota**:
Inference covered by an account's subscription allowance rather than a per-request cash charge. The allowance can be shared or limited.
_Avoid_: free quota

**Paid route**:
A provider/model path that can incur a cash charge for inference.
_Avoid_: metered model (unless the provider specifically meters by model)

**Unknown entitlement**:
A route whose current cost class Gavin cannot verify from authoritative evidence. Missing, stale, unsupported, or failed evidence remains unknown.
_Avoid_: free by default

**Entitlement evidence**:
The authoritative provider source and time Gavin checked that support a route's cost class. A model name alone is not evidence.
_Avoid_: model metadata

**Launch cost policy**:
The rule applied before an agent launch based on its verified cost class. The app-wide default asks before every paid or unknown launch; app and workspace settings can choose `Ask` or `No paid requests`, with a workspace choice overriding the app choice. `No paid requests` blocks known paid routes and still asks before each unknown launch.
_Avoid_: model preference

**One-run authorization**:
A human approval to proceed with one paid or unknown launch. It is not remembered for later launches and does not change the route's entitlement.
_Avoid_: free entitlement

### Board

**Nested task**:
A task card that belongs to a plan and has no status of its own: its status is its plan's, it is drawn inside the plan's card, and it goes wherever the plan goes. When it runs on its own, it is finished when its line in the plan is ticked.
_Avoid_: subtask, child card (when meaning one that has its own status), promoted item

**Orchestrated plan**:
A plan whose Nested tasks each run as their own agent session, one after another or all at once, before the plan's own session runs to finish what is left.
_Avoid_: auto-plan, plan rail, parent run

### Scheduling

**Scheduled task**:
A copy of a task card that lives off the board and runs unattended on its own schedule, once or repeatedly. Copying it leaves the original card where it was; the two do not follow each other's edits.
_Avoid_: scheduled card (the card itself is never scheduled), cron job, recurring card

**Fire**:
One moment a Scheduled task's schedule comes due. A fire either launches a run or is skipped with a reason, and either way it counts toward the schedule's runs.
_Avoid_: tick (that is the scheduler checking, not the schedule coming due), trigger (that arms a rail)

**Run report**:
The markdown file the agent writes at the end of a Scheduled task's run, saying what it did and what came of it. It is what the human reads afterwards in place of the terminal.
_Avoid_: log (that is the raw terminal output), summary

### Remote access

**Workstation**:
A computer running the Gavin desktop app and its daemon. It is what a Device pairs with, and what the Companion works on.
_Avoid_: host (that is an ssh workspace's machine), instance, server, Mac

**Companion**:
The phone app a human uses to watch and steer their Workstations while away from the desk.
_Avoid_: mobile client, phone app, mobile app

**Device**:
One install of the Companion, identified by its own keys to every Workstation it has paired with. An iPhone and an iPad are two Devices, and a reinstall is a new Device.
_Avoid_: phone, client, paired phone

**Presence**:
Where a Device is on a Workstation and what it is doing there: the workspace it last worked in, the session it is typing into, and the sessions it started. The daemon reads it off the commands the Device has the desktop app run, so a Device never reports its own.
_Avoid_: activity, status (that is a session's), online (that is being connected)

**Owner**:
The one Device whose input a session takes, or the desk when no Device holds it. A Device becomes the owner of a session it starts, or of a session the desk holds that it sends input to. A courtesy, not a security boundary: anyone who can type can take the session in one tap.
_Avoid_: holder, controller, lock holder, driver

**Locked**:
How a session looks to everyone but its owner: they can read and scroll it, but their input is refused until they take it.
_Avoid_: read-only (the terminal still scrolls and selects), busy, disabled

**Take over**:
Making yourself a session's owner while someone else owns it. At the desk it is called **Take back**. If the owner typed a moment ago, you are asked to confirm.
_Avoid_: steal, grab, claim (that is what typing into a session nobody owns does)

**Hand over**:
The owner passing a session on purpose to another connected Device, or to the desk.
_Avoid_: transfer, share, give

**Release**:
The owner giving a session back to the desk. It also happens without being asked: when the session ends, when the owning Device is revoked, and after a short grace once the owning Device has no connection.
_Avoid_: unlock, drop

**Workstations hub**:
The Companion's home screen: every paired Workstation with its state, and one attention inbox across all of them.
_Avoid_: hub (on its own, that is the desktop app's view one level above any workspace), home, dashboard

**Demo Workstation**:
A simulated Workstation built into the Companion, with sample sessions, cards and rails, for exploring the app before any real Workstation is paired.
_Avoid_: demo mode, sample data, offline mode

**Workstation UI bundle**:
The web UI a Device runs to work on one Workstation, built from the same commit as that Workstation's desktop app, signed by the publisher, shipped inside the desktop app and served to the Device over its connection. The Companion runs one only once its signature checks against the publisher key it pins, and keeps it by content hash.
_Avoid_: remote UI, web app, the Companion's UI (that is the shell's own hub)

**Publisher key**:
The key that signs every Workstation UI bundle a release ships, whose public half the Companion pins. Separate from the updater's key. A debug build of the Companion also trusts a dev key made on the developer's machine.
_Avoid_: bundle key (on its own), signing key (which one?)

**Landing**:
Where a Workstation UI bundle opens when the human tapped an inbox item: the item's workspace, and the card it names or the card whose agent is the session it names.
_Avoid_: deep link, route

**Unlock**:
One authentication on a Device (a biometric, or the phone's passcode), together with how long it lasts: until the Companion goes to the background or the phone locks.
_Avoid_: session (that is a terminal), login

**Remote role**:
What a Workstation lets a connection from an unlocked Device do: everything its desktop app can do, except manage Devices.
_Avoid_: mobile permissions, remote access (as the name of the permission)

**Relay**:
The server that carries encrypted traffic between a Workstation and its Devices without being able to read it.
_Avoid_: proxy, tunnel, server

**Direct connection**:
A Device reaching its Workstation with no Relay, over the same network or a Tailscale tailnet, through a listener the daemon runs itself. Opt-in, and tried before the Relay.
_Avoid_: LAN mode, local relay, embedded relay

**Push gateway**:
The publisher's service that delivers encrypted notifications to Devices through Apple and Google, and the only holder of the publisher's push credentials.
_Avoid_: notification server, push server

**Send permission**:
What a Device gives one Workstation so that the Push gateway will deliver that Workstation's notifications to it. The Push gateway signs it, and the Device can cancel it.
_Avoid_: push token (that is Apple's or Google's address for the Device), grant, subscription

### Distribution

**Preview build**:
An unsigned desktop installer published from every push to `main` that passes CI, replacing the previous one at a single download address. What a person installs before Gavin has a signed version, not a version of its own.
_Avoid_: release (that is the session term above, and the signed tag build is a different thing), nightly, main build

### Activity

**Activity**:
What happened in a workspace, counted by when it happened: agent runs (of a card or a tool), commits, pushes, and the files those commits changed. Read from the record that already exists; nothing is kept for its own sake.
_Avoid_: usage (that is a subscription's limits), history (that is one card's runs, or the Git log)

**Activity calendar**:
Activity drawn over time, for one workspace or for every workspace on a Workstation, which zooms from a year down to a single hour.
_Avoid_: heatmap (that is only its year view), contribution graph, timeline

**Workspace log**:
Everything that happened in one workspace, one entry per thing, written down as it happens and kept until someone clears it. Unlike Activity, it is a record of its own: most of what it holds (a card deleted, a rail paused, a decision answered) leaves no other trace.
_Avoid_: backlog (that is work not yet started), activity (that is counted from records that already exist), history, audit log

**Log entry**:
One thing that happened, in the Workspace log: what it was, when, and the card or rail it was about.
_Avoid_: event (too wide: pushes, watcher wake-ups and PTY output are events too)
