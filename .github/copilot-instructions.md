# Copilot instructions

## Project shape

Gavin is a Rust workspace plus a SvelteKit/Svelte 5 desktop app. The Rust daemon owns PTYs and durable state; the Tauri host in `app/src-tauri` and the `gavin-mcp` server are clients of it. `crates/protocol` defines their shared wire types. `crates/gavin-relay` carries remote Device connections, while `crates/companion-core` and `crates/companion-wasm` implement the Device side. `app/companion` reuses desktop UI and logic behind a remote shim; `app/companion-shell` is the Capacitor app that pairs Devices and hosts that bundle.

Read `.gavin-root/PRD.md` first. Before changing an established behavior, read its relevant decision in `docs/adr/` or design in `docs/superpowers/specs/`; `CONTEXT.md` is the shared domain glossary. The `app/src/lib/README.md` describes the frontend's domain organization.

## Build and verification

Run Rust commands from the repository root. CI builds with `cargo build --workspace --locked`. For tests, CI isolates the daemon filesystem-watcher tests because they are timing-sensitive under full-suite parallelism:

```sh
cargo test -p gavin-daemon gavin:: --locked -- --test-threads=1
cargo test --workspace --locked --no-fail-fast -- --skip gavin::
```

For a focused Rust test, use `cargo test -p <crate> <name-filter>`; for an integration test, add its target, for example `cargo test -p gavin-daemon --test device_wire <name-filter>`. Check Rust formatting with `cargo fmt --all -- --check`.

The wasm portability checks used by CI are `cargo check -p protocol --no-default-features --target wasm32-unknown-unknown --locked`, `cargo check -p companion-core --target wasm32-unknown-unknown --locked`, and `cargo build -p companion-wasm --target wasm32-unknown-unknown --profile companion-wasm --locked`.

Run app commands from `app/` after `npm ci`:

```sh
npm test
npm run check
npm run build
npm run companion:test
npm run companion:check
npm run companion:build
npm run companion-shell:test
npm run companion-shell:check
npm run companion-shell:build
```

For one Vitest file and test, use `npm test -- src/lib/<domain>/<file>.test.ts -t "<test name>"`. The Companion shell also needs its Capacitor dependencies installed once with `cd app/companion-shell && npm ci`; its test/build scripts compile the Companion core to wasm, so install `wasm32-unknown-unknown` with rustup.

## Repository-specific conventions

- **Protocol compatibility:** `protocol::min_version_for` gates request variants, not added fields. When widening an existing request payload, add the corresponding `FEATURE_MIN_VERSION` entry in `app/src/lib/core/daemonCompat.ts` and gate every UI surface that can send it with `featureBlockedReason`. Keep cross-language rules in sync through shared fixtures where available; Relay URL cases belong in `test-fixtures/relay-urls/cases.json`.
- **Rust portability:** `protocol`'s OS-specific code belongs behind its default `os` feature. `companion-core` stays free of I/O, OS randomness, and signing so it can compile to wasm; the phone supplies signatures.
- **Database changes:** a new SQLite column needs an `ALTER TABLE ... ADD COLUMN` migration as well as the fresh-schema definition. Test the migration against a database created with the old schema, not only a new temporary database.
- **Frontend structure:** put reusable logic in a plain `.ts` module with nearby unit tests; keep `.svelte` files as thin templates. Svelte 5 `$state` objects are proxies, so use a token/counter rather than object identity to reject superseded async work. Tauri runs in WKWebView; Node-green behavior is not proof of rendered UI behavior.
- **Companion boundary:** desktop modules imported by `app/companion` must have a matching remote shim in `app/companion/src/companion/remote/`. Preserve the shell/bundle channel boundary and run the Companion suites when changing shared desktop modules or wire messages.
- **Transport identity:** in the daemon's shared connection loop, a transport-provided `ClientIdentity` is final; `Hello` only resolves an identity when the transport did not provide one.
- **Dialogs:** Tauri permits only the native file picker. Use the app's `askConfirm` / `showAlert` helpers from `dialog.ts` or `ConfirmPrompt` for confirmations and alerts.
- **Shared checkout:** other sessions may have uncommitted changes. Preserve them, stage only files you changed, and leave commits, merges, and checkout changes to the human. For daemon/MCP integration tests, use an isolated temporary home; never stop daemons by process name. A protocol bump requires a rebuild and daemon restart before runtime behavior changes.
