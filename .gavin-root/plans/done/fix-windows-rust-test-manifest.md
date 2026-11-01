---
kind: plan
title: Fix Windows Rust test manifest
status: Done
---
Ensure Windows test executables from the Tauri app package activate Common Controls 6, so test startup can resolve `TaskDialogIndirect`.

- [x] Embed a Common Controls 6 manifest in Windows-linked app-package targets.
- [x] Run the previously failing focused Rust test and verify other targets remain unchanged.

Validation: the focused unit test passed, `cargo build -p app --bin Gavin` passed, and both resulting executables embed the Common Controls 6 manifest. A repository-wide `git diff --check` also reports pre-existing trailing whitespace in `crates/daemon/src/gavin.rs`; the changed build script passes its scoped check.
