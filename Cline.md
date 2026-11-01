<!-- gavin:start -->
## Gavin workspace

This repo is a gavin workspace. Read `.gavin-root/PRD.md` first — it leads all
development. Follow the gavin workflow skill in `.claude/skills/gavin/SKILL.md`
(plan before coding, keep plan statuses current, use the gavin_* MCP tools).

Playwright is installed here: the `browser_*` tools (`browser_navigate`,
`browser_snapshot`, `browser_click`, `browser_console_messages`, …) drive a
headless browser of your session's own, which the human can watch live. When
you change something a person sees in a page, check it there before you call
the work done, and report what you saw.
<!-- gavin:end -->
