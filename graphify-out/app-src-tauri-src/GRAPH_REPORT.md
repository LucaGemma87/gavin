# Graph Report - src  (2026-11-01)

## Corpus Check
- 65 files · ~264,811 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3414 nodes · 9537 edges · 125 communities (110 shown, 15 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 423 edges (avg confidence: 0.79)
- Token cost: 13,574 input · 7,110 output

## Community Hubs (Navigation)
- Card Session Data
- Command Lane Concurrency
- Session Companion Notifications
- Command Execution
- Agent Setup Headless Profiles
- Session Activity Records
- Filesystem Event Watcher
- Workspace Deletion Safety
- Daemon Lifecycle
- Workspace Configuration
- Git Change Review
- Device Commit Handoff
- Daemon Keepalive
- Agent Usage Probe States
- Repository Data Parsing
- Session Agent Skill State
- Git Operation Runner
- Git Operations
- Workspace Settings State
- Process Memory Monitor
- Windows Interop
- Agent Setup Profile Installers
- Pull Request Monitoring
- Agent Setup Trust Storage
- Git Conflict Resolution
- Agent Token Transcript Search
- Session Version Compatibility
- Watcher Health Checks
- Workspace Git Tracking
- Agent Change Tracking
- Agent Setup Path Validation
- Workspace Webview Window
- Card Ignore Rules
- Agent Model Catalog
- Agent Setup Workspace Trust
- Command Confirmation Gate
- Agent Setup MCP Validation
- Remote Browser Stream Lifecycle
- Remote Workspace Bridge
- Typed Settings Validation
- Event Forwarding Types
- File Viewer Edge Expansion
- Agent Setup Launcher Tracking
- Agent Defaults Configuration
- Remote Git Routing
- Agent Skill Detection
- File Viewer Safe Creation
- Git Ignore Rules
- Device Browser Lease Management
- Git Activity History
- Agent Profile Catalog
- Browser Installation State
- Remote Browser Frame Delivery
- Browser Installation Assessment
- Agent Usage Limits
- Shell Process Management
- Browser Installation Flow
- Subscription Window Parsing
- Bounded File Reads
- File Viewer Root Security
- Agent Token Log Readers
- Browser Host Discovery
- Agent Usage Rate Limits
- Remote Connection Configuration
- Remote Workspace Linking
- Browser Dial Recovery
- File Attachment Trust
- Remote Filesystem Watches
- Session Client Admission
- File Change Watches
- Git Branch Baseline
- Agent Skill File Installation
- Custom Skill Trust
- Remote Handshake Protocol
- Device Browser Sessions
- File Viewer Root Allowlist
- Session Restart Safety
- Agent Usage Reset Cycles
- Daemon Event Reconnection
- Usage Probe Types
- File Change Detection
- Orchestration Event Relay
- Skill CLI Discovery
- Browser Stream Failure Recovery
- Companion Bundle Delivery
- Directory Listing
- Forwarded Request Routing
- Webview Navigation Security
- Worktree Setup Validation
- Custom Skill Installation
- Remote Browser Setup
- Forwarding App Adapters
- Workspace Layout
- Safe File Mutations
- Forwarded Input Lifecycle
- Remote File Operations
- Skill Binary Detection
- Command Registry Validation
- Attention State Management
- Browser Watch Lifecycle
- Browser Stream Reading
- Playwright MCP Entry
- Browser Local Working Directory
- Agent Skill State
- Skill CLI Invocation
- Agent Skill Trust State
- Agent Ask Timers
- Workspace Logging
- Process Memory Sampling
- Kimi Token Integrations
- Browser Availability State
- Workspace Removal State
- Inbound Request Lifecycle
- Playwright Entry Assertions
- Claude Transcript Parsing
- Gavin Develop Skill Links
- Agent Instruction Authoring
- Card Development Interview
- Rail Orchestration Workflow
- PRD Planning Interview
- Interrupted Card Recovery
- Restricted Commit Automation

## God Nodes (most connected - your core abstractions)
1. `DaemonCompatState` - 106 edges
2. `cwd()` - 105 edges
3. `CommandConnection` - 104 edges
4. `temp_repo()` - 94 edges
5. `off_main_thread()` - 68 edges
6. `run_integration()` - 66 edges
7. `WorkspaceFiles` - 64 edges
8. `run_git_ro()` - 60 edges
9. `lanes_for()` - 59 edges
10. `run_git()` - 50 edges

## Surprising Connections (you probably didn't know these)
- `read_lines()` --references--> `Read`  [INFERRED]
  git/run.rs → browser_view.rs
- `git_delete_branch()` --references--> `CommandConnection`  [INFERRED]
  git/commands.rs → session.rs
- `git_delete_branch()` --references--> `DaemonCompatState`  [INFERRED]
  git/commands.rs → session.rs
- `new_debouncer()` --references--> `ChangesOnly`  [EXTRACTED]
  git/watch.rs → changes_only.rs
- `start_debouncer()` --references--> `ChangesOnly`  [EXTRACTED]
  git/watch.rs → changes_only.rs

## Import Cycles
- 1-file cycle: `session.rs -> session.rs`
- 2-file cycle: `git/commands.rs -> git/ops.rs -> git/commands.rs`
- 2-file cycle: `git/commands.rs -> git/run.rs -> git/commands.rs`
- 2-file cycle: `browser_view.rs -> remote.rs -> browser_view.rs`
- 2-file cycle: `command_lane.rs -> session.rs -> command_lane.rs`
- 3-file cycle: `git/commands.rs -> git/ops.rs -> git/run.rs -> git/commands.rs`
- 5-file cycle: `browser_view.rs -> remote.rs -> command_lane.rs -> git/commands.rs -> git/run.rs -> browser_view.rs`
- 5-file cycle: `browser_view.rs -> session.rs -> command_lane.rs -> git/commands.rs -> git/run.rs -> browser_view.rs`

## Hyperedges (group relationships)
- **Gavin Card Lifecycle** — gavin_skill_work_cards, gavin_skill_plan_checklists, gavin_skill_nested_tasks, gavin_skill_board_status, gavin_skill_visible_agent_sessions, gavin_skill_human_decisions_and_tests [EXTRACTED 1.00]
- **Orchestration Execution Model** — gavin_orchestrate_skill_rail_stage_step, gavin_orchestrate_skill_worktree_isolation, gavin_orchestrate_skill_parallelize_workstreams, gavin_orchestrate_skill_tool_steps [EXTRACTED 1.00]

## Communities (125 total, 15 thin omitted)

### Community 0 - "Card Session Data"
Cohesion: 0.02
Nodes (121): GitTrackingDefault, HeadroomDefault, RequireReviewDefault, a_daemon_below_the_floor_is_rejected(), a_daemon_newer_than_the_app_is_rejected(), a_headroom_default_nobody_chose_is_absent_from_the_file_and_reads_as_unset(), a_hosts_device_and_remote_access_pushes_are_not_forwarded(), a_hosts_session_pushes_are_still_forwarded() (+113 more)

### Community 1 - "Command Lane Concurrency"
Cohesion: 0.05
Nodes (66): a_lane_fails_fast_while_swapping_and_moves_to_the_new_connection(), a_lane_names_the_process_serving_its_connection(), a_lane_with_no_redial_drops_a_late_answer_and_stays_usable(), a_lane_with_nothing_to_dial_sends_end_orphan_on_its_own_connection(), a_link_that_owes_an_answer_refuses_new_requests_until_it_arrives(), a_redial_refuses_a_daemon_whose_proof_does_not_match(), a_redial_says_hello_with_the_daemon_token(), a_redial_to_a_different_daemon_version_sends_nothing() (+58 more)

### Community 2 - "Session Companion Notifications"
Cohesion: 0.08
Nodes (93): activity_runs(), add_external_gavin_context(), adopt_session(), announce_run_written(), archive_card(), begin_pairing(), card_runs(), card_session() (+85 more)

### Community 3 - "Command Execution"
Cohesion: 0.06
Nodes (99): a_diff_past_the_cap_is_still_too_large_under_the_capped_read(), a_worktree_add_stopped_mid_checkout_leaves_nothing_behind(), a_worktree_in_gavin_worktrees_leaves_the_enclosing_checkout_clean(), a_worktrees_folder_below_the_git_root_ignores_itself_too(), abort_in_progress(), add_remote(), an_existing_worktrees_gitignore_is_left_as_the_human_wrote_it(), apply_patch() (+91 more)

### Community 4 - "Agent Setup Headless Profiles"
Cohesion: 0.03
Nodes (61): a_profile_less_root_composes_for_the_app_default_agent(), a_stale_hook_script_is_rewritten(), a_step_skill_lands_under_the_opencode_skill_root(), AGENT_FILE_SKILL_MD, agent_profile_dto(), agent_profile_dto_from_custom(), agent_profiles(), AgentProfileDto (+53 more)

### Community 5 - "Session Activity Records"
Cohesion: 0.07
Nodes (73): DaemonLanes, Column, a_command_the_daemon_predates_never_reaches_the_wire(), a_command_the_daemon_understands_still_reaches_the_wire(), a_custom_agent_with_no_api_family_sends_none(), a_custom_launch_names_the_api_family_its_settings_name(), a_file_tab_alongside_a_stale_session_leaves_the_file_tab_and_replaces_only_the_session(), a_file_tab_id_is_left_alone_not_replaced_with_a_fresh_session() (+65 more)

### Community 6 - "Filesystem Event Watcher"
Cohesion: 0.06
Nodes (44): a_batch_counts_when_any_path_in_it_does(), a_gitignore_edit_rearms_the_matcher(), a_gitignore_inside_an_ignored_folder_is_not_read(), a_new_top_level_directory_needs_rearming_before_its_contents_are_seen(), a_new_top_level_directory_symlink_is_not_rearmed(), a_rearmed_watch_reports_once_and_keeps_hearing(), a_top_level_directory_symlink_is_not_armed(), a_tracked_file_an_ignore_rule_matches_stays_relevant() (+36 more)

### Community 7 - "Workspace Deletion Safety"
Cohesion: 0.06
Nodes (64): expand_tilde(), expand_tilde_only_touches_a_leading_tilde_slash(), from_env(), from_env_on(), home_dir(), is_absolute_on(), neutral_cwd(), resolve() (+56 more)

### Community 8 - "Daemon Lifecycle"
Cohesion: 0.05
Nodes (46): path_words(), a_child_that_binds_nothing(), ask_daemon_to_stop(), connect_or_spawn(), connect_or_spawn_returns_immediately_if_already_listening(), connect_or_spawn_spawns_and_retries_until_listening(), connect_or_spawn_times_out_if_nothing_ever_listens(), CREATE_BREAKAWAY_FROM_JOB (+38 more)

### Community 9 - "Workspace Configuration"
Cohesion: 0.07
Nodes (62): absent_orchestration_agent_is_not_serialized(), absent_theme_loads_as_none(), agent_defaults_fallback_roundtrips(), agent_efforts_roundtrip_and_default_to_absent(), board_tabs_roundtrip_alongside_workspaces(), card_tabs_roundtrip_and_default_empty_for_a_config_that_predates_them(), CLINE, config_path() (+54 more)

### Community 10 - "Git Change Review"
Cohesion: 0.06
Nodes (69): commit_detail(), diff_at(), git_commit_detail(), git_diff(), git_stash_files(), local_branch_exists(), MAX_DIFF_BYTES, paths() (+61 more)

### Community 11 - "Device Commit Handoff"
Cohesion: 0.07
Nodes (37): a_refusal_comes_back_in_the_desks_words(), a_stop_on_its_way_is_answered_with_nothing(), a_windows_answer_is_the_devices_result(), agent_commit_for_device(), an_ask_nobody_answers_says_so_and_stops_waiting(), Answer, answer(), answer_agent_commit_request() (+29 more)

### Community 12 - "Daemon Keepalive"
Cohesion: 0.05
Nodes (41): a_hold_is_a_level_not_a_counter(), Activity, alpha_at(), apply_hold(), ask_before_quit(), ask_before_terminate(), begin(), CELL_PX (+33 more)

### Community 13 - "Agent Usage Probe States"
Cohesion: 0.04
Nodes (43): ANTHROPIC_USAGE_URL, b64url_decode(), BACKOFF_SECS, claude_token(), credentials_blob(), cursor_cookie(), cursor_cookie_is_sub_then_the_jwt(), cursor_state_vscdb() (+35 more)

### Community 14 - "Repository Data Parsing"
Cohesion: 0.07
Nodes (52): git_log(), git_refs(), git_status(), log(), refs(), remote_names(), status(), worktrees() (+44 more)

### Community 15 - "Session Agent Skill State"
Cohesion: 0.26
Nodes (50): AgentSkillsMark, Installed, Skipped, BoardTabRecord, CardTabRecord, LaunchConfig, AgentDefaults, AgentModels (+42 more)

### Community 16 - "Git Operation Runner"
Cohesion: 0.07
Nodes (44): checkout_commit(), cherry_pick(), continue_in_progress(), continue_rebase(), merge(), revert(), a_cancelled_action_stops_with_its_hook_says_cancelled_and_streams_until_then(), a_capped_read_keeps_one_byte_past_the_cap_and_lets_git_finish() (+36 more)

### Community 17 - "Git Operations"
Cohesion: 0.10
Nodes (35): git_checkout(), git_checkout_commit(), git_cherry_pick(), git_commit(), git_continue_in_progress(), git_continue_rebase(), git_create_branch(), git_delete_branch() (+27 more)

### Community 18 - "Workspace Settings State"
Cohesion: 0.12
Nodes (41): AgentCommitRecord, DevelopingCardRecord, GitViewPrefs, McpForeignServersChoice, OrchestrationAgentRecord, Workspace, a_layout_save_adds_removes_and_reorders_workspaces(), a_layout_save_cannot_turn_compression_off() (+33 more)

### Community 19 - "Process Memory Monitor"
Cohesion: 0.07
Nodes (33): all_pids(), child_pids(), daemon_pid(), footprint(), forget_root(), gavin_memory(), GavinMemory, interface_pids() (+25 more)

### Community 20 - "Windows Interop"
Cohesion: 0.06
Nodes (17): a_launch_line_says_who_asked_on_one_line(), Ancestor, ancestor_chain(), claim(), claim_or_exit(), image_path(), launch_line(), launch_log_path() (+9 more)

### Community 21 - "Agent Setup Profile Installers"
Cohesion: 0.11
Nodes (45): a_codex_root_gets_its_skills_and_mcp_entry(), a_cursor_root_gets_its_skills_and_mcp_entry(), a_custom_mcp_path_that_escapes_the_root_is_refused(), a_custom_profile_writes_the_config_its_own_settings_name(), a_foreign_playwright_server_or_a_missing_block_gets_no_browser_paragraph(), a_forged_gavin_checkout_gets_the_absolute_binary(), a_kimi_code_root_gets_its_skills_and_mcp_entry(), a_kimi_run_over_a_forged_checkout_trusts_only_the_absolute_binary() (+37 more)

### Community 22 - "Pull Request Monitoring"
Cohesion: 0.08
Nodes (32): a_pr_with_no_checks_is_ready(), a_report_serialises_the_field_names_the_frontend_reads(), check_name(), check_state(), check_url(), Entry, ERROR_INTERVAL_SECS, gh_binary() (+24 more)

### Community 23 - "Agent Setup Trust Storage"
Cohesion: 0.07
Nodes (27): a_disk_with_no_reachable_home_gets_no_trust_record(), a_kimi_code_home_override_moves_the_record(), a_launch_trust_needs_a_home_on_the_machine_kimi_runs_on(), a_learned_heading_outside_the_block_is_not_the_block_s_business(), a_remote_gavin_checkout_that_carries_the_launcher_is_named_by_relative_path(), block_with(), checkout_mark_key(), checkout_mark_matches() (+19 more)

### Community 24 - "Git Conflict Resolution"
Cohesion: 0.12
Nodes (39): checkout(), create_branch(), in_progress_at(), added_by_both_binary_and_crlf_kinds(), cherry_pick_label_names_the_commit(), commit_all(), conflict_info(), delete_modify_in_both_directions_and_keep_or_delete() (+31 more)

### Community 25 - "Agent Token Transcript Search"
Cohesion: 0.09
Nodes (24): a_codex_rollout_reports_its_last_cumulative_total_not_a_sum(), a_message_written_once_per_content_block_is_counted_once(), a_real_shaped_transcript_is_judged_by_type_and_usage_alone(), an_oddly_typed_field_costs_that_field_not_the_turn(), assistant(), card_run_tokens(), card_run_tokens_blocking(), claude_totals() (+16 more)

### Community 26 - "Session Version Compatibility"
Cohesion: 0.09
Nodes (35): a_daemon_reporting_version_34_is_refused(), a_daemon_that_never_answers_ends_the_probe_at_its_deadline(), a_handshake_presents_one_command_connection_and_one_push_connection(), a_peer_that_only_learns_the_token_from_hello_cannot_complete_handshake(), an_older_in_window_daemon_connects_degraded_instead_of_erroring(), app_handshake(), app_handshake_command(), app_handshake_stream() (+27 more)

### Community 27 - "Watcher Health Checks"
Cohesion: 0.09
Nodes (20): a_late_standing_watch_is_slow_not_deaf(), a_restart_reads_as_deaf_once_and_the_fresh_watch_stands(), arm(), drain(), events_lost_everywhere_are_not_a_dead_stream(), Fake, FolderSource, HEAR_TIMEOUT (+12 more)

### Community 28 - "Workspace Git Tracking"
Cohesion: 0.10
Nodes (33): a_file_holding_only_the_block_comes_back_empty(), a_folder_outside_a_repo_reports_no_repo(), a_fresh_repo_tracks_gavin_and_the_switch_turns_it_off_and_back_on(), a_hand_written_rule_survives_the_switch_and_keeps_ignoring(), a_nested_context_folder_is_covered_too(), adding_a_block_that_is_already_there_changes_nothing(), an_empty_file_becomes_the_block_alone(), block_span() (+25 more)

### Community 29 - "Agent Change Tracking"
Cohesion: 0.10
Nodes (29): a_record_under_another_root_is_not_this_checkouts(), a_run_with_no_conversation_id_is_unavailable(), a_symlinked_spelling_of_the_root_still_matches(), a_watched_command_is_judged_by_its_record_and_an_unwatched_one_by_its_text(), candidates_are_kept_by_what_the_run_named_and_nothing_else(), card_run_touched_files(), CLAUDE_EDIT_TOOLS, claude_edit_tools_and_shell_commands_are_read_and_every_other_tool_is_not() (+21 more)

### Community 30 - "Agent Setup Path Validation"
Cohesion: 0.07
Nodes (27): check_contained_dest(), contained_dest(), contained_dest_inner(), contained_under(), gavin_install(), gavin_install_falls_back_when_agent_file_escapes_the_root(), gavin_install_reports_the_agent_file_only_where_the_profile_has_one(), GavinInstall (+19 more)

### Community 31 - "Workspace Webview Window"
Cohesion: 0.12
Nodes (21): app_duty(), app_duty_now(), AppDuty, broadcast(), broadcast_duty(), cascade_from(), CASCADE_OFFSET, claim_workspace_window() (+13 more)

### Community 32 - "Card Ignore Rules"
Cohesion: 0.11
Nodes (28): a_card_ignored_by_someone_elses_rule_names_that_rule(), a_card_reads_tracked_until_it_is_ignored(), a_negation_is_reported_but_is_not_an_ignore(), a_workspace_root_below_the_toplevel_anchors_from_the_toplevel(), Card, card_git_ignore(), card_pattern(), CardIgnore (+20 more)

### Community 33 - "Agent Model Catalog"
Cohesion: 0.09
Nodes (19): CACHE, cached_catalog(), CODEX_CACHE, codex_home(), codex_models(), home_dir(), kimi_models(), KIMI_PROVIDER_LIST (+11 more)

### Community 34 - "Agent Setup Workspace Trust"
Cohesion: 0.08
Nodes (21): a_launch_in_a_gavin_worktree_vets_the_worktrees_own_mcp_file(), a_launch_trust_counts_the_playwright_entry_as_gavins(), a_launch_trust_is_withheld_by_shape_and_by_policy(), FolderTrust, KimiRecord, grant_folder_trust(), grant_kimi_launch_trust(), INTEGRATION_RUNS (+13 more)

### Community 35 - "Command Confirmation Gate"
Cohesion: 0.13
Nodes (28): a_cancelled_prompt_mints_nothing(), a_command_with_no_token_is_refused(), a_confirmed_prompt_mints_a_token_its_own_subject_can_spend(), a_pairing_token_is_bound_to_the_device_and_the_code(), a_prompt_can_only_be_answered_once(), a_restart_grant_cannot_stop_the_daemon(), a_subject_can_be_spent_only_once(), a_token_cannot_be_redirected_at_another_action() (+20 more)

### Community 36 - "Agent Setup MCP Validation"
Cohesion: 0.09
Nodes (25): is_gavins_entry(), CheckoutMarkOffer, foreign_mcp_servers(), foreign_mcp_servers_json(), foreign_mcp_servers_toml(), ForeignMcpServer, IntegrationResult, json_foreign_entry() (+17 more)

### Community 37 - "Remote Browser Stream Lifecycle"
Cohesion: 0.10
Nodes (26): a_device_stream_closes_when_its_last_view_lets_go_and_not_before(), a_device_stream_nobody_holds_is_read_to_the_end_and_offered_to_nobody(), a_device_streams_frames_are_offered_while_held_and_its_end_is_told(), a_devices_stream_dials_once_however_many_views_hold_it(), a_lease_nobody_renews_runs_out_and_closes_the_stream(), a_renewal_keeps_the_stream_and_one_phones_silence_does_not_end_anothers(), ago(), browsers_of() (+18 more)

### Community 38 - "Remote Workspace Bridge"
Cohesion: 0.09
Nodes (19): abandon_git_ops(), cancel_git_op_over_link(), finish_git_op(), GIT_ROUTER, link_lost(), NEXT_LINK_ID, PENDING_GIT_OPS, pending_git_ops() (+11 more)

### Community 39 - "Typed Settings Validation"
Cohesion: 0.16
Nodes (27): a_blank_key_clears_rather_than_storing_an_unusable_one(), a_workspace_save_does_not_wipe_the_key(), admitted(), an_enabled_verdict_with_no_key_asks_for_one_rather_than_calling(), change_attribution_has_its_own_switch(), config_dir(), Feature, ChangeAttribution (+19 more)

### Community 40 - "Event Forwarding Types"
Cohesion: 0.07
Nodes (12): DISPATCH_BUDGET, forward_hello_for_test(), forward_hello_names_the_forward_connection_kind(), FORWARDED_HEADER, FORWARDED_ORIGIN, FORWARDING_EPOCH, FORWARDING_MIN_VERSION, ORCHESTRATION_WRITTEN (+4 more)

### Community 41 - "File Viewer Edge Expansion"
Cohesion: 0.10
Nodes (11): already_at_the_screen_edge_is_a_no_op(), Edges, expanded_frame(), FRAME, go(), hit_edges(), Rect, SCREEN (+3 more)

### Community 42 - "Agent Setup Launcher Tracking"
Cohesion: 0.12
Nodes (27): a_changed_launcher_drops_the_mark(), a_marked_checkout_keeps_its_launcher(), a_repo_that_merely_ships_a_launcher_does_not_get_one_written(), antigravity_and_cursor_write_mcp_servers_at_their_own_paths(), antigravity_profile(), claude_layout(), codex_toml_merges_and_preserves_comments(), copilot_cli_writes_its_mcp_server_to_the_github_workspace_file() (+19 more)

### Community 43 - "Agent Defaults Configuration"
Cohesion: 0.11
Nodes (28): AgentDefaultsConfig, AgentPauseConfig, api_family_for_profile(), AppConfig, chain_map_references(), complexity_maps_reference(), ComplexityAgent, config_toml_profile_is_custom() (+20 more)

### Community 44 - "Remote Git Routing"
Cohesion: 0.12
Nodes (8): git_link_for_cwd(), hello_ack(), read_file_over_link(), RemoteLink, run_git_env_over_link(), run_git_op_over_link(), run_git_over_link(), write_file_over_link()

### Community 45 - "Agent Skill Detection"
Cohesion: 0.08
Nodes (12): ADD_MARKETPLACE, CLAUDE_LIST_ELSEWHERE, CLAUDE_LIST_PROJECT, CLAUDE_PLUGINS, DETECT_TIMEOUT, INSTALL_TIMEOUT, LOCK, NO_MARKETPLACE (+4 more)

### Community 46 - "File Viewer Safe Creation"
Cohesion: 0.10
Nodes (18): FILE_WATCH_DEBOUNCE, launch_handler_extension(), LAUNCH_HANDLER_EXTENSIONS, launch_refusal(), MAX_LISTED_ENTRIES, MAX_VIEWER_FILE_BYTES, open_externally_refuses_a_command_file_behind_a_markdown_symlink(), open_externally_refuses_an_app_bundle_but_opens_a_folder() (+10 more)

### Community 48 - "Git Ignore Rules"
Cohesion: 0.15
Nodes (22): a_missing_gitignore_reads_as_empty(), add_ignore_pattern(), add_pattern_appends_with_a_trailing_newline_even_over_a_file_missing_one(), add_pattern_never_duplicates_a_line_already_there(), add_pattern_on_an_empty_or_missing_file_writes_just_the_pattern(), an_unknown_kind_is_refused(), common_git_dir(), exclude_resolves_to_the_common_dir_from_a_linked_worktree() (+14 more)

### Community 49 - "Device Browser Lease Management"
Cohesion: 0.14
Nodes (19): a_device_stream_is_not_the_desks_and_the_desks_is_not_a_devices(), a_devices_watch_is_answered_in_camel_case_with_its_lease(), a_dial_let_go_of_meanwhile_hands_its_stream_back_to_be_closed(), a_local_session_dials_once_however_many_windows_watch_it(), a_view_joining_a_device_stream_is_handed_its_newest_frame(), a_window_joining_a_running_stream_is_handed_the_newest_frame(), BrowserFrame, Conn (+11 more)

### Community 50 - "Git Activity History"
Cohesion: 0.16
Nodes (19): a_folder_that_is_not_a_repo_answers_empty_lists(), a_push_after_a_fetch_moved_the_ref_starts_from_the_fetched_sha(), a_repo_with_a_bare_remote_answers_its_commits_files_and_pushes(), a_repo_with_no_commits_answers_empty_lists(), activity(), ActivityCommit, ActivityPush, commit_at() (+11 more)

### Community 51 - "Agent Profile Catalog"
Cohesion: 0.11
Nodes (23): AGENT_PROFILES, AgentProfile, claude_cause(), claude_detects(), CUSTOM_WRITE_PROFILE, detect_agent_binaries(), detect_agent_binaries_with(), detect_google_cli() (+15 more)

### Community 52 - "Browser Installation State"
Cohesion: 0.12
Nodes (4): Fake, findings(), Machine, ThisMachineWithBinary

### Community 53 - "Remote Browser Frame Delivery"
Cohesion: 0.13
Nodes (12): a_hosts_browser_reaches_a_device_at_the_phones_size_over_a_bridge_of_its_own(), a_keeper_whose_stream_was_replaced_stops_and_leaves_the_new_one_alone(), ask(), built_daemon(), cdp_call(), dial(), dial_host(), installed_browsers() (+4 more)

### Community 54 - "Browser Installation Assessment"
Cohesion: 0.18
Nodes (15): assess(), BINARY, Check, checks(), Conflict, CUSTOM_LABEL, Findings, install_command() (+7 more)

### Community 55 - "Agent Usage Limits"
Cohesion: 0.14
Nodes (21): a_spend_limit_over_a_hundred_survives(), a_window_past_its_reset_is_dropped(), anthropic_windows_are_normalised_and_labelled(), cursor_enterprise_overall_is_the_total_window(), cursor_on_demand_is_a_window_only_when_capped(), cursor_windows_come_from_current_period_usage(), cursor_windows_still_parse_usage_summary_plan(), gemini_buckets_collapse_to_pro_flash_and_lite() (+13 more)

### Community 56 - "Shell Process Management"
Cohesion: 0.19
Nodes (17): a_command_child_does_not_share_this_console(), a_name_that_already_has_an_extension_is_not_extended_again(), command(), CREATE_NO_WINDOW, DEFAULT_PATHEXT, join(), on_path(), os() (+9 more)

### Community 57 - "Browser Installation Flow"
Cohesion: 0.25
Nodes (18): a_browser_already_installed_is_not_downloaded_again(), a_custom_profile_is_unavailable_and_has_nothing_to_install(), a_fallback_browser_revision_lets_install_write_the_entry(), a_foreign_playwright_server_is_replaced_only_when_asked(), an_unreadable_config_is_unavailable_and_untouched(), cline_is_unavailable_without_a_workspace_mcp_layout(), every_mcp_capable_stock_profile_gets_its_entry_in_a_fresh_workspace(), Fake<'a> (+10 more)

### Community 58 - "Subscription Window Parsing"
Cohesion: 0.15
Nodes (20): anthropic_usage(), codex_sessions_dir(), cursor_token(), cursor_usage(), gemini_creds_path(), gemini_denied_reason(), gemini_post(), gemini_rate_limited() (+12 more)

### Community 59 - "Bounded File Reads"
Cohesion: 0.16
Nodes (20): a_50_mb_file_reads_no_more_than_one_byte_past_the_cap(), a_cut_that_splits_a_character_keeps_the_text_before_it(), a_file_exactly_at_the_cap_is_whole(), a_first_save_creates_the_parent_directory_it_needs(), a_truncated_file_with_a_bad_byte_before_the_cut_is_still_not_text(), read_file_for_viewer_impl(), read_file_for_viewer_refuses_a_path_outside_every_open_workspace(), read_file_for_viewer_refuses_a_symlink_that_leaves_every_open_workspace() (+12 more)

### Community 60 - "File Viewer Root Security"
Cohesion: 0.16
Nodes (19): canonical_root(), create_directory(), create_directory_impl(), create_file(), create_file_impl(), FileContent, inside_root(), read_file_for_viewer() (+11 more)

### Community 61 - "Agent Token Log Readers"
Cohesion: 0.15
Nodes (18): locate(), TokenLog, ClaudeSessionJsonl, CodexRollout, KimiWireJsonl, claude_projects_dir(), claude_transcript(), codex_sessions_dir() (+10 more)

### Community 62 - "Browser Host Discovery"
Cohesion: 0.14
Nodes (4): browser_at(), HostMachine, pinned_marker_path(), the_marker_is_the_pinned_revisions()

### Community 63 - "Agent Usage Rate Limits"
Cohesion: 0.22
Nodes (12): a_429_park_holds_a_forced_refresh(), a_forced_refresh_that_arrives_mid_probe_takes_that_probes_answer(), a_forced_refresh_with_nothing_in_flight_makes_a_real_call(), a_slow_probe_does_not_hold_up_another_profile(), Entry, is_cached(), ready_at(), UsageCache (+4 more)

### Community 64 - "Remote Connection Configuration"
Cohesion: 0.22
Nodes (12): SshConfig, Bridge, BridgeProcess, cfg(), open_link(), own_connection_from(), present_own(), spawn_bridge() (+4 more)

### Community 65 - "Remote Workspace Linking"
Cohesion: 0.20
Nodes (16): connect_remote_workspace(), host_for_workspace(), link_all(), link_by_host(), link_workspace(), remember_session(), Route, route_for_path() (+8 more)

### Community 66 - "Browser Dial Recovery"
Cohesion: 0.18
Nodes (9): a_failed_dial_is_tried_again_by_the_next_watch(), a_host_is_told_once_per_link_and_again_after_a_reconnect(), a_hosts_frames_reach_only_the_windows_watching_and_are_dropped_after(), a_reader_whose_watch_was_replaced_stops_and_leaves_the_new_one_alone(), a_tell_that_failed_is_sent_again(), read_watch(), Registry, the_session_ending_forgets_its_watch_and_what_the_host_was_told() (+1 more)

### Community 67 - "File Attachment Trust"
Cohesion: 0.14
Nodes (15): attachment_status(), attachment_status_classifies_by_where_a_symlink_inside_the_root_actually_leads(), attachment_status_from_stat(), attachment_status_impl(), attachment_status_resolves_against_the_root_and_classifies_by_location(), AttachmentLocation, ExtraContext, Outside (+7 more)

### Community 68 - "Remote Filesystem Watches"
Cohesion: 0.23
Nodes (15): a_relinked_host_is_asked_to_watch_again_and_only_under_its_own_root(), an_unwatched_cwd_is_not_re_asked_after_a_relink(), clear_git_host(), git_router(), host_for_path(), host_for_root(), linked_to(), path_is_under() (+7 more)

### Community 69 - "Session Client Admission"
Cohesion: 0.24
Nodes (13): an_answering_peer_with_no_token_file_is_refused(), DaemonConnection, parity_compat(), resize_session(), return_pty_size(), send_request(), snapshot_session(), the_streaming_connection_refuses_input_while_the_daemon_is_swapped() (+5 more)

### Community 70 - "File Change Watches"
Cohesion: 0.15
Nodes (6): ChangesOnly, a_sibling_files_change_does_not_fire_the_callback(), a_watched_files_change_fires_the_callback_once_after_debouncing(), reading_the_watched_file_does_not_fire_the_callback(), spawn_file_watcher(), truncates_a_file_larger_than_the_cap()

### Community 71 - "Git Branch Baseline"
Cohesion: 0.24
Nodes (8): a_branch_with_no_upstream_reports_no_deltas(), every_cwd_in_one_checkout_gets_that_checkouts_status(), git_baselines(), parse(), parse_porcelain_v2(), reads_branch_and_upstream_deltas(), repo_root(), status_for_root()

### Community 72 - "Agent Skill File Installation"
Cohesion: 0.19
Nodes (10): installed_in(), every_skill_is_written_and_overwritten(), isolate_refusal(), ManagedFile, ManagedWrite, McpLayout, ResolvedMcp, skill_slots_are_the_verified_set_and_do_not_share_a_root() (+2 more)

### Community 73 - "Custom Skill Trust"
Cohesion: 0.19
Nodes (14): a_custom_agent_is_unavailable_with_its_reason_until_vouched_for(), a_positive_check_is_verified_even_without_the_human_saying_so(), a_verified_check_outranks_the_humans_word(), cline_skills_status_uses_the_skills_cli_route(), command_for(), every_known_profile_has_an_install_route_and_custom_has_none(), overlay_profile_id_uses_the_named_profile_not_the_workspace_agent(), resolve() (+6 more)

### Community 74 - "Remote Handshake Protocol"
Cohesion: 0.20
Nodes (11): answer_handshake(), Banner, banner_parse_reads_what_the_bridge_prints(), banner_parse_refuses_anything_else_and_quotes_it(), banner_parse_tolerates_a_daemon_with_no_token(), banner_with(), establish(), establish_probes_the_version_then_presents_the_token_on_both_connections() (+3 more)

### Community 75 - "Device Browser Sessions"
Cohesion: 0.32
Nodes (10): DeviceBrowserWatch, get_playwright_pane_open(), gone(), lease_answer(), relay_gone(), start_device_stream(), watch_browser_for_device(), watch_for_device() (+2 more)

### Community 76 - "File Viewer Root Allowlist"
Cohesion: 0.26
Nodes (9): allowed_roots(), ensure_within_open_workspaces(), FileWatchers, open_path_externally(), resolve_path_under_cursor(), reveal_path_externally(), unwatch_file_for_viewer(), watch_and_unwatch_file_for_viewer_refuse_a_path_outside_every_open_workspace() (+1 more)

### Community 77 - "Session Restart Safety"
Cohesion: 0.19
Nodes (9): a_second_restart_is_refused_while_one_is_under_way(), DaemonRestart, DaemonRestartClaim, FrontendReady, reconnect(), restart_blocking(), restart_daemon(), signal_frontend_ready() (+1 more)

### Community 78 - "Agent Usage Reset Cycles"
Cohesion: 0.17
Nodes (11): a_cursor_cycle_that_has_already_reset_is_not_a_ready_report(), as_epoch_secs(), as_percent(), codex_limits_come_from_the_newest_event_that_has_them(), codex_usage(), collect_jsonl(), days_from_civil(), newest_codex_limits() (+3 more)

### Community 79 - "Daemon Event Reconnection"
Cohesion: 0.23
Nodes (6): a_connection_that_ends_is_dialled_again_and_served(), connect_forward(), Daemon, dial(), handshake_forward(), serving()

### Community 80 - "Usage Probe Types"
Cohesion: 0.18
Nodes (9): UsageProbe, AnthropicOauth, CodexRollout, CursorSession, GeminiCodeAssist, KimiOauth, OpencodeGo, agent_usage() (+1 more)

### Community 82 - "Orchestration Event Relay"
Cohesion: 0.40
Nodes (8): announce_orchestration_written(), attention_items(), emit(), keep_connected(), offer(), redial_delay(), serve(), start()

### Community 83 - "Skill CLI Discovery"
Cohesion: 0.24
Nodes (10): binary_for(), claude_list_says_installed(), detect(), detect_skills_cli(), Detected, locked_skills(), package_name(), skill_files_without_a_lock_entry_are_absent() (+2 more)

### Community 84 - "Browser Stream Failure Recovery"
Cohesion: 0.27
Nodes (8): a_failed_device_dial_takes_its_lease_with_it_and_the_next_watch_dials(), a_hosts_dial_that_failed_is_told_to_every_watch_until_one_succeeds(), a_hosts_failed_dial_keeps_the_views_leases_and_a_late_one_changes_nothing(), a_view_back_after_every_lease_ran_out_is_not_told_an_old_failure(), Start, Dial, Nothing, Tell

### Community 85 - "Companion Bundle Delivery"
Cohesion: 0.38
Nodes (5): answer(), carried(), describe(), manifest(), the_answer_is_the_manifest_and_a_slice_of_the_archive_it_names()

### Community 86 - "Directory Listing"
Cohesion: 0.27
Nodes (10): DirEntryInfo, DirListing, list_directory(), list_directory_impl(), list_directory_past_the_cap_keeps_the_trees_first_entries_and_counts_the_rest(), list_directory_refuses_a_path_outside_the_root(), list_directory_refuses_to_follow_a_symlinked_directory(), list_directory_reports_kind_size_and_link_for_every_entry() (+2 more)

### Community 87 - "Forwarded Request Routing"
Cohesion: 0.29
Nodes (6): a_forwarded_call_has_an_origin_no_desk_window_has(), a_forwarded_call_reaches_the_same_handler_as_webview_invoke(), an_orchestration_write_reaches_the_desk_only_when_a_device_made_it(), body_to_value(), dispatch(), invoke_url()

### Community 88 - "Webview Navigation Security"
Cohesion: 0.29
Nodes (4): dev_url_only_in_debug(), init(), navigation_allowed(), parse()

### Community 89 - "Worktree Setup Validation"
Cohesion: 0.31
Nodes (6): a_wrong_typed_setup_costs_only_the_entries_that_are_wrong(), read_setup(), reads_the_declared_commands_in_file_order(), root_with(), the_root_is_the_workspace_root_not_the_gavin_dir(), worktree_setup()

### Community 90 - "Custom Skill Installation"
Cohesion: 0.31
Nodes (9): a_custom_profile_has_nothing_to_install(), agent_skills_install(), agent_skills_status(), claude_plugin_runs_never_overlap_an_install(), install(), logging_claude(), overlay_profile_id(), said_installed() (+1 more)

### Community 91 - "Remote Browser Setup"
Cohesion: 0.29
Nodes (3): an_ssh_workspace_is_set_up_on_the_host(), BROWSER_INSTALLS, HostFiles

### Community 92 - "Forwarding App Adapters"
Cohesion: 0.25
Nodes (5): an_ask_that_lands_between_an_offer_and_its_ok_is_answered_and_the_connection_lives(), an_emitted_event_reaches_the_forwarding_connection(), mock_app_with(), ping_counter(), until()

### Community 93 - "Workspace Layout"
Cohesion: 0.29
Nodes (7): Page, sample_layout(), sample_page(), LayoutNode, Leaf, Split, leaf()

### Community 94 - "Safe File Mutations"
Cohesion: 0.36
Nodes (7): attachment_status_classifies_an_extra_context_and_refuses_a_sensitive_home_dir(), create_directory_makes_one_level_and_refuses_an_existing_entry(), create_file_makes_an_empty_file_and_refuses_to_clobber_one(), rename_moves_an_entry_and_refuses_to_overwrite_the_destination(), root_of(), sensitive_roots_of(), under()

### Community 95 - "Forwarded Input Lifecycle"
Cohesion: 0.46
Nodes (5): input_request(), is_forwarded(), origin(), ping_origin(), write_orchestration()

### Community 97 - "Skill Binary Detection"
Cohesion: 0.29
Nodes (6): a_missing_binary_names_itself(), combined_output_carries_both_streams(), live_claude_detector_agrees_with_the_cli(), plain_text(), Run, run()

### Community 99 - "Attention State Management"
Cohesion: 0.33
Nodes (3): Forwarding, set_companion_attention(), waiting()

### Community 100 - "Browser Watch Lifecycle"
Cohesion: 0.33
Nodes (5): BrowserWatches, keep_device_watch(), Lease, Held, Over

### Community 101 - "Browser Stream Reading"
Cohesion: 0.43
Nodes (6): next(), Read, Frame, Gone, Other, Refused

### Community 102 - "Playwright MCP Entry"
Cohesion: 0.47
Nodes (6): Entry, Absent, Conflict, Present, Unknown, read_entry()

### Community 104 - "Agent Skill State"
Cohesion: 0.33
Nodes (5): agent_skills_farewell(), dismiss_agent_skills_farewell(), dismiss_farewell_in(), farewell_due(), the_farewell_is_targeted_and_dismissed_once()

### Community 105 - "Skill CLI Invocation"
Cohesion: 0.33
Nodes (6): skills_cli_args(), skills_cli_argv_ignores_a_workspace_script_shell(), skills_cli_npx_does_not_take_npm_config_from_the_workspace(), skills_cli_spawn(), SkillsCliSpawn, the_shown_command_is_the_run_command()

### Community 106 - "Agent Skill Trust State"
Cohesion: 0.33
Nodes (5): State, Absent, Asserted, Unavailable, Verified

### Community 107 - "Agent Ask Timers"
Cohesion: 0.33
Nodes (3): Asked, ask_every_link(), every_link()

### Community 108 - "Workspace Logging"
Cohesion: 0.53
Nodes (3): workspace_log(), workspace_log_impl(), WorkspaceLogPage

### Community 109 - "Process Memory Sampling"
Cohesion: 0.47
Nodes (5): now_ms(), system_memory(), system_memory_reads_a_real_sample(), SystemMemory, unsupported_is_flagged_not_zeroed_into_data()

### Community 110 - "Kimi Token Integrations"
Cohesion: 0.40
Nodes (5): transcript_files(), kimi_agent_wires(), kimi_session_dir(), kimi_session_wires(), kimi_transcript()

### Community 111 - "Browser Availability State"
Cohesion: 0.40
Nodes (4): State, Absent, Unavailable, Verified

### Community 112 - "Workspace Removal State"
Cohesion: 0.60
Nodes (3): RemovedWorkspace, WorkspacesData, WorkspacesSync

### Community 113 - "Inbound Request Lifecycle"
Cohesion: 0.40
Nodes (4): Inbound, Answered, Daemon, Ended

### Community 116 - "Gavin Develop Skill Links"
Cohesion: 0.67
Nodes (3): Gavin workspace workflow, Gavin workspace workflow, Gavin workspace workflow

## Knowledge Gaps
- **84 isolated node(s):** `Ready`, `Unavailable`, `Verified`, `Absent`, `Unavailable` (+79 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 714 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `WorkspaceFiles` connect `Agent Setup Trust Storage` to `Remote File Operations`, `Agent Setup Workspace Trust`, `Agent Setup Headless Profiles`, `Agent Setup MCP Validation`, `Playwright MCP Entry`, `Browser Local Working Directory`, `Agent Skill File Installation`, `Agent Setup Launcher Tracking`, `Browser Installation State`, `Agent Setup Profile Installers`, `Browser Installation Assessment`, `Agent Setup Path Validation`, `Browser Installation Flow`, `Remote Browser Setup`, `Browser Host Discovery`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 61 inferred relationships involving `cwd()` (e.g. with `a_folder_that_is_not_a_repo_answers_empty_lists()` and `a_repo_with_a_bare_remote_answers_its_commits_files_and_pushes()`) actually correct?**
  _`cwd()` has 61 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Ready`, `Unavailable`, `Verified` to the rest of the system?**
  _84 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Card Session Data` be split into smaller, more focused modules?**
  _Cohesion score 0.021313081822635964 - nodes in this community are weakly interconnected._
- **Why does `McpFormat` connect `Agent Setup MCP Validation` to `Agent Skill File Installation`, `Agent Setup Launcher Tracking`, `Agent Setup Headless Profiles`, `Agent Setup Path Validation`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 52 inferred relationships involving `temp_repo()` (e.g. with `a_repo_with_a_bare_remote_answers_its_commits_files_and_pushes()` and `a_card_ignored_by_someone_elses_rule_names_that_rule()`) actually correct?**
  _`temp_repo()` has 52 INFERRED edges - model-reasoned connections that need verification._
- **Should `Command Lane Concurrency` be split into smaller, more focused modules?**
  _Cohesion score 0.05087857330186205 - nodes in this community are weakly interconnected._