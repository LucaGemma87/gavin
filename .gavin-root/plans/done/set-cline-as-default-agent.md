---
kind: plan
title: Set Cline as the default agent
status: Done
---
Ensure Cline CLI is Gavin's default agent across workspace and application settings while keeping Claude Code available as an explicitly selectable supported profile.

- [x] Trace every default, fallback, migration, and profile-selection path for workspace and app agent settings.
- [x] Update defaults and related tests/docs so missing or invalid values resolve to Cline without removing Claude Code support.
- [x] Run focused validation and record any environment limitation.

Validation: frontend tests passed (126/126) and `cargo check -p app --tests` passed. The focused Rust test could not run because another Cargo process held the shared build-directory lock; the test binary was not executed.
