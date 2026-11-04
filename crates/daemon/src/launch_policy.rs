use protocol::{EvidencedEntitlement, LaunchCostPolicy, LaunchEvidence, LaunchPolicyWorkspace};
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

/// How long a reading of a route's quota may be trusted. A subscription
/// window is read off a CLI or an account endpoint; fifteen minutes is
/// about one agent turn on a five-hour window, long enough to cover
/// the gap between the panel's last probe and a click on Start, short
/// enough that a plan cancelled or downgraded since stops counting.
pub const MAX_EVIDENCE_AGE_SECS: u64 = 15 * 60;

/// How far ahead of this daemon's clock a reading may claim to be. A
/// little skew between the app's clock and ours is normal; a reading from
/// the future is not evidence of anything.
const MAX_EVIDENCE_SKEW_SECS: u64 = 60;

const MAX_EVIDENCE_SOURCE_LEN: usize = 200;

/// Places a route from the evidence a launch carried. Everything that
/// cannot be vouched for is `Unknown`, never `Paid`: this function can
/// only clear a launch, and a missing, stale, future-dated or anonymous
/// reading clears nothing. Approval does not pass through here -- it stays
/// a separate, one-launch answer to `Unknown` (ADR 0013).
pub fn classify(evidence: Option<&LaunchEvidence>, now_secs: u64) -> Entitlement {
    let Some(evidence) = evidence else {
        return Entitlement::Unknown;
    };
    let source = evidence.source.trim();
    if source.is_empty() || source.len() > MAX_EVIDENCE_SOURCE_LEN {
        return Entitlement::Unknown;
    }
    if evidence.observed_at > now_secs.saturating_add(MAX_EVIDENCE_SKEW_SECS) {
        return Entitlement::Unknown;
    }
    if now_secs.saturating_sub(evidence.observed_at) > MAX_EVIDENCE_AGE_SECS {
        return Entitlement::Unknown;
    }
    match evidence.entitlement {
        EvidencedEntitlement::FreeAllowance => Entitlement::FreeAllowance,
        EvidencedEntitlement::IncludedQuota => Entitlement::IncludedQuota,
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

    fn evidence(entitlement: EvidencedEntitlement, source: &str, observed_at: u64) -> LaunchEvidence {
        LaunchEvidence { entitlement, source: source.into(), observed_at }
    }

    #[test]
    fn fresh_evidence_places_the_route_and_nothing_else_does() {
        let now = 1_000_000;
        assert_eq!(classify(None, now), Entitlement::Unknown);
        assert_eq!(
            classify(Some(&evidence(EvidencedEntitlement::IncludedQuota, "claude-code usage windows", now - 30)), now),
            Entitlement::IncludedQuota
        );
        assert_eq!(
            classify(Some(&evidence(EvidencedEntitlement::FreeAllowance, "provider docs", now)), now),
            Entitlement::FreeAllowance
        );
    }

    #[test]
    fn stale_future_or_anonymous_evidence_is_unknown() {
        let now = 1_000_000;
        let stale = now - MAX_EVIDENCE_AGE_SECS - 1;
        let edge = now - MAX_EVIDENCE_AGE_SECS;
        assert_eq!(
            classify(Some(&evidence(EvidencedEntitlement::IncludedQuota, "x", stale)), now),
            Entitlement::Unknown
        );
        assert_eq!(
            classify(Some(&evidence(EvidencedEntitlement::IncludedQuota, "x", edge)), now),
            Entitlement::IncludedQuota
        );
        assert_eq!(
            classify(Some(&evidence(EvidencedEntitlement::IncludedQuota, "x", now + 61)), now),
            Entitlement::Unknown
        );
        assert_eq!(
            classify(Some(&evidence(EvidencedEntitlement::IncludedQuota, "  ", now)), now),
            Entitlement::Unknown
        );
        let long = "s".repeat(MAX_EVIDENCE_SOURCE_LEN + 1);
        assert_eq!(
            classify(Some(&evidence(EvidencedEntitlement::IncludedQuota, &long, now)), now),
            Entitlement::Unknown
        );
    }

    #[test]
    fn evidence_never_overrides_a_known_paid_route() {
        // The verdict for Paid ignores evidence by construction: classify
        // cannot return Paid, so the strict policy's block is untouched.
        assert_eq!(
            verdict(LaunchCostPolicy::NoPaidRequests, Entitlement::Paid, true),
            Verdict::BlockedPaid
        );
    }
}
