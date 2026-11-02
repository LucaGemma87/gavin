---
kind: plan
title: Restoring Ctrl+V in Windows terminals
status: Done
---

- [x] Add a regression test for clipboard-read fallback during terminal paste.
- [x] Implement a fallback that still pastes text when the Tauri clipboard read fails.
- [x] Run the focused clipboard and keyboard tests, then update the card.
