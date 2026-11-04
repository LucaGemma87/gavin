use protocol::{LaunchCostPolicy, LaunchPolicyWorkspace};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, PoisonError};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Entitlement {
    FreeAllowance,
    IncludedQuota,
    Paid,
    Unknown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Verdict {
    Allow,
    ApprovalRequired,
    BlockedPaid,
}

pub fn verdict(policy: LaunchCostPolicy, entitlement: Entitlement, approved_once: bool) -> Verdict {
    match (policy, entitlement) {
        (LaunchCostPolicy::NoPaidRequests, Entitlement::Paid) => Verdict::BlockedPaid,
        (_, Entitlement::FreeAllowance | Entitlement::IncludedQuota) => Verdict::Allow,
        (LaunchCostPolicy::Ask, Entitlement::Paid | Entitlement::Unknown)
        | (LaunchCostPolicy::NoPaidRequests, Entitlement::Unknown)
            if !approved_once =>
        {
            Verdict::ApprovalRequired
        }
        _ => Verdict::Allow,
    }
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default)]
struct Record {
    app_policy: LaunchCostPolicy,
    workspaces: BTreeMap<String, Option<LaunchCostPolicy>>,
}

pub fn switch_path(state_dir: &Path, profile: protocol::BuildProfile) -> PathBuf {
    state_dir.join(protocol::profile_file_name(
        "launch-cost-policy",
        "json",
        profile,
    ))
}

fn key(workspace_path: &str) -> String {
    match std::fs::canonicalize(workspace_path) {
        Ok(path) => path.to_string_lossy().into_owned(),
        Err(_) => {
            let trimmed = workspace_path.trim_end_matches(['/', '\\']);
            if trimmed.is_empty() {
                workspace_path
            } else {
                trimmed
            }
            .to_string()
        }
    }
}

pub struct Switch {
    path: PathBuf,
    record: Mutex<Record>,
}

impl Switch {
    pub fn open(state_dir: &Path, profile: protocol::BuildProfile) -> Self {
        let path = switch_path(state_dir, profile);
        let record = crate::headroom::store::load(&path);
        Self {
            path,
            record: Mutex::new(record),
        }
    }

    pub fn replace(
        &self,
        app_policy: LaunchCostPolicy,
        workspaces: &[LaunchPolicyWorkspace],
    ) -> anyhow::Result<()> {
        let mut workspace_policies = BTreeMap::new();
        for workspace in workspaces {
            let policy = workspace.policy.unwrap_or(app_policy);
            let entry = workspace_policies
                .entry(key(&workspace.workspace_path))
                .or_insert(Some(policy));
            if policy == LaunchCostPolicy::NoPaidRequests {
                *entry = Some(LaunchCostPolicy::NoPaidRequests);
            }
        }
        let next = Record {
            app_policy,
            workspaces: workspace_policies,
        };
        let mut current = self.record.lock().unwrap_or_else(PoisonError::into_inner);
        crate::headroom::store::save(&self.path, &next)?;
        *current = next;
        Ok(())
    }

    pub fn policy_for(&self, workspace_path: &str) -> LaunchCostPolicy {
        let record = self.record.lock().unwrap_or_else(PoisonError::into_inner);
        record
            .workspaces
            .get(&key(workspace_path))
            .copied()
            .flatten()
            .unwrap_or(record.app_policy)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unknown_and_paid_routes_need_fresh_authorization() {
        for policy in [LaunchCostPolicy::Ask, LaunchCostPolicy::NoPaidRequests] {
            assert_eq!(
                verdict(policy, Entitlement::Unknown, false),
                Verdict::ApprovalRequired
            );
            assert_eq!(verdict(policy, Entitlement::Unknown, true), Verdict::Allow);
        }
        assert_eq!(
            verdict(LaunchCostPolicy::Ask, Entitlement::Paid, false),
            Verdict::ApprovalRequired
        );
        assert_eq!(
            verdict(LaunchCostPolicy::Ask, Entitlement::Paid, true),
            Verdict::Allow
        );
    }

    #[test]
    fn strict_policy_never_allows_a_known_paid_route() {
        assert_eq!(
            verdict(LaunchCostPolicy::NoPaidRequests, Entitlement::Paid, false),
            Verdict::BlockedPaid
        );
        assert_eq!(
            verdict(LaunchCostPolicy::NoPaidRequests, Entitlement::Paid, true),
            Verdict::BlockedPaid
        );
    }

    #[test]
    fn free_and_included_routes_need_no_approval_in_either_policy() {
        for policy in [LaunchCostPolicy::Ask, LaunchCostPolicy::NoPaidRequests] {
            assert_eq!(
                verdict(policy, Entitlement::FreeAllowance, false),
                Verdict::Allow
            );
            assert_eq!(
                verdict(policy, Entitlement::IncludedQuota, false),
                Verdict::Allow
            );
        }
    }

    #[test]
    fn workspace_policy_overrides_and_survives_restart() {
        let dir = tempfile::tempdir().unwrap();
        let policy = Switch::open(dir.path(), protocol::BuildProfile::Release);
        policy
            .replace(
                LaunchCostPolicy::Ask,
                &[LaunchPolicyWorkspace {
                    workspace_path: "/work/strict".into(),
                    policy: Some(LaunchCostPolicy::NoPaidRequests),
                }],
            )
            .unwrap();
        assert_eq!(
            policy.policy_for("/work/strict"),
            LaunchCostPolicy::NoPaidRequests
        );
        assert_eq!(policy.policy_for("/work/inherited"), LaunchCostPolicy::Ask);

        let next = Switch::open(dir.path(), protocol::BuildProfile::Release);
        assert_eq!(
            next.policy_for("/work/strict"),
            LaunchCostPolicy::NoPaidRequests
        );
    }

    #[test]
    fn duplicate_canonical_workspace_paths_keep_the_stricter_policy() {
        let dir = tempfile::tempdir().unwrap();
        let root = dir.path().to_string_lossy().into_owned();
        let alias = dir.path().join(".").to_string_lossy().into_owned();
        let policy = Switch::open(dir.path(), protocol::BuildProfile::Release);

        policy
            .replace(
                LaunchCostPolicy::Ask,
                &[
                    LaunchPolicyWorkspace {
                        workspace_path: root.clone(),
                        policy: Some(LaunchCostPolicy::Ask),
                    },
                    LaunchPolicyWorkspace {
                        workspace_path: alias,
                        policy: Some(LaunchCostPolicy::NoPaidRequests),
                    },
                ],
            )
            .unwrap();

        assert_eq!(policy.policy_for(&root), LaunchCostPolicy::NoPaidRequests);
    }
}
