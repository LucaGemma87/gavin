// Versioned benchmark suite for evaluating model quality on Gavin tasks.
// 
// This module defines a fixed set of representative Gavin tasks, runs them
// in isolated worktrees (leveraging Best-of-N infrastructure), and measures
// quality metrics. Results are versioned so recommendations can be tied to
// a specific benchmark version and date.

/// Task types that represent the range of work Gavin handles.
/// Each type has a distinct difficulty profile and tooling need.
export const BENCHMARK_TASK_TYPES = [
  "simple-edit",       // Single file, one obvious change (rename, typo, version bump)
  "multi-file-change", // Few files, some judgement, clear shape
  "test-writing",      // Add tests for existing code, run them
  "plan-and-execute",  // Cross-cutting work needing a plan before code
  "mcp-tool-use",      // Task requiring MCP/tool calls (file ops, search, etc.)
] as const;

export type BenchmarkTaskType = (typeof BENCHMARK_TASK_TYPES)[number];

/// A single benchmark task definition.
/// Tasks are versioned so the same logical task can be updated without
/// breaking historical comparisons.
export interface BenchmarkTask {
  /// Stable identifier for this task (e.g., "simple-edit-rename-export").
  id: string;
  /// Human-readable name.
  name: string;
  /// Task type for grouping and comparison.
  type: BenchmarkTaskType;
  /// Version of this task definition. Increment when the prompt or acceptance
  /// criteria change in a way that affects comparability.
  version: number;
  /// The prompt given to the agent. Should be self-contained and not require
  /// external context beyond the repository at the base commit.
  prompt: string;
  /// Acceptance criteria: a checklist the evaluator verifies.
  acceptance: string[];
  /// Estimated difficulty (1-5) for weighting.
  difficulty: number;
  /// Whether this task requires a specific setup (e.g., a test framework).
  requiresSetup?: string;
}

/// A candidate model/profile being evaluated.
export interface BenchmarkCandidate {
  /// Profile ID (e.g., "claude", "opencode", "kimi").
  profileId: string;
  /// Model name as passed to the CLI.
  model: string;
  /// Human-readable label for display.
  label: string;
  /// Economic state: "free-quota" | "subscription" | "paid" | "local" | "unknown".
  economicState: "free-quota" | "subscription" | "paid" | "local" | "unknown";
  /// Source and date of economic state verification.
  economicStateSource: string;
  economicStateVerifiedAt: number; // epoch ms
}

/// Result of running one candidate on one task.
export interface TaskRunResult {
  taskId: string;
  candidate: BenchmarkCandidate;
  /// Whether the task completed (agent exited without error).
  completed: boolean;
  /// Whether all acceptance criteria passed.
  acceptancePassed: boolean;
  /// Number of acceptance criteria that passed.
  acceptancePassedCount: number;
  /// Total acceptance criteria.
  acceptanceTotal: number;
  /// Number of rework cycles (agent had to retry/fix).
  reworkCount: number;
  /// Number of retry attempts (including launch retries).
  retryCount: number;
  /// Wall-clock latency in milliseconds.
  latencyMs: number;
  /// Token usage if available.
  tokensUsed?: number;
  /// Quota/spend impact if measurable.
  quotaImpact?: number;
  /// Any error message if the run failed.
  error?: string;
  /// When this run was executed.
  runAt: number; // epoch ms
  /// Git commit the task was run against.
  baseCommit: string;
}

/// Aggregated results for a candidate across all tasks of a type.
export interface CandidateTypeSummary {
  candidate: BenchmarkCandidate;
  taskType: BenchmarkTaskType;
  runs: TaskRunResult[];
  /// Completion rate (0-1).
  completionRate: number;
  /// Acceptance pass rate (0-1).
  acceptanceRate: number;
  /// Average rework count.
  avgRework: number;
  /// Average retry count.
  avgRetries: number;
  /// Median latency in ms.
  medianLatencyMs: number;
  /// Total tokens used.
  totalTokens: number;
  /// Total quota/spend impact.
  totalQuotaImpact: number;
}

/// The full benchmark run result, versioned and dated.
export interface BenchmarkRun {
  /// Benchmark suite version. Increment when tasks change.
  benchmarkVersion: number;
  /// When this benchmark was run.
  runAt: number; // epoch ms
  /// Git commit all tasks ran against.
  baseCommit: string;
  /// All candidates evaluated.
  candidates: BenchmarkCandidate[];
  /// All individual task runs.
  runs: TaskRunResult[];
  /// Per-candidate, per-type summaries.
  summaries: CandidateTypeSummary[];
}

/// Quality threshold configuration. This is the "agreed quality threshold"
/// from the exit criterion. It defines what "good enough" means for a
/// recommendation.
export interface QualityThresholds {
  /// Completion rate must be strictly greater than this value (0-1).
  completionRateGreaterThan: number;
  /// Optional minimum acceptance pass rate (0-1).
  minAcceptanceRate?: number;
  /// Optional maximum average rework count.
  maxAvgRework?: number;
  /// Optional maximum median latency (ms).
  maxMedianLatencyMs?: number;
}

/// Human-agreed on 2026-11-04: a candidate must complete more than 90% of
/// benchmark tasks to qualify for a recommendation.
export const AGREED_QUALITY_THRESHOLDS: QualityThresholds = {
  completionRateGreaterThan: 0.9,
};

type ThresholdCheck = Record<
  string,
  { threshold: number; actual: number; passed: boolean; operator: ">" | ">=" | "<=" }
>;

/// A model recommendation for a specific task type.
export interface ModelRecommendation {
  taskType: BenchmarkTaskType;
  candidate: BenchmarkCandidate;
  /// The benchmark run this recommendation is based on.
  benchmarkRun: BenchmarkRun;
  /// Whether the candidate meets the quality thresholds for this task type.
  meetsThresholds: boolean;
  /// Which thresholds were checked and their values.
  thresholdCheck: ThresholdCheck;
  /// Human-readable reason for the recommendation (or why not recommended).
  reason: string;
  /// When this recommendation was generated.
  generatedAt: number; // epoch ms
  /// Benchmark version this recommendation is tied to.
  benchmarkVersion: number;
}

/// Check if a candidate meets quality thresholds for a task type.
export function checkQualityThresholds(
  summary: CandidateTypeSummary,
  thresholds: QualityThresholds = AGREED_QUALITY_THRESHOLDS
): { passed: boolean; details: ThresholdCheck } {
  assertQualityThresholds(thresholds);

  const details: ThresholdCheck = {
    completionRate: {
      threshold: thresholds.completionRateGreaterThan,
      actual: summary.completionRate,
      passed: summary.completionRate > thresholds.completionRateGreaterThan,
      operator: ">",
    },
  };

  if (thresholds.minAcceptanceRate !== undefined) {
    details.acceptanceRate = {
      threshold: thresholds.minAcceptanceRate,
      actual: summary.acceptanceRate,
      passed: summary.acceptanceRate >= thresholds.minAcceptanceRate,
      operator: ">=",
    };
  }
  if (thresholds.maxAvgRework !== undefined) {
    details.avgRework = {
      threshold: thresholds.maxAvgRework,
      actual: summary.avgRework,
      passed: summary.avgRework <= thresholds.maxAvgRework,
      operator: "<=",
    };
  }
  if (thresholds.maxMedianLatencyMs !== undefined) {
    details.medianLatencyMs = {
      threshold: thresholds.maxMedianLatencyMs,
      actual: summary.medianLatencyMs,
      passed: summary.medianLatencyMs <= thresholds.maxMedianLatencyMs,
      operator: "<=",
    };
  }
  const passed = Object.values(details).every((d) => d.passed);
  return { passed, details };
}

function assertQualityThresholds(thresholds: QualityThresholds): void {
  if (
    !Number.isFinite(thresholds.completionRateGreaterThan) ||
    thresholds.completionRateGreaterThan < 0 ||
    thresholds.completionRateGreaterThan > 1 ||
    (thresholds.minAcceptanceRate !== undefined &&
      (!Number.isFinite(thresholds.minAcceptanceRate) ||
        thresholds.minAcceptanceRate < 0 ||
        thresholds.minAcceptanceRate > 1)) ||
    (thresholds.maxAvgRework !== undefined &&
      (!Number.isFinite(thresholds.maxAvgRework) || thresholds.maxAvgRework < 0)) ||
    (thresholds.maxMedianLatencyMs !== undefined &&
      (!Number.isFinite(thresholds.maxMedianLatencyMs) || thresholds.maxMedianLatencyMs < 0))
  ) {
    throw new RangeError("Quality thresholds must contain finite, non-negative limits and rates between 0 and 1.");
  }
}

function summaryForRecommendation(recommendation: ModelRecommendation): CandidateTypeSummary | undefined {
  return recommendation.benchmarkRun.summaries.find(
    (item) =>
      item.taskType === recommendation.taskType &&
      item.candidate.profileId === recommendation.candidate.profileId &&
      item.candidate.model === recommendation.candidate.model
  );
}

/// Determine if a recommendation is "recent" (within the freshness window).
/// The exit criterion requires "evidenza recente" (recent evidence).
export function isRecommendationRecent(
  recommendation: ModelRecommendation,
  maxAgeMs: number = 30 * 24 * 60 * 60 * 1000,
  now: number = Date.now()
): boolean {
  const summary = summaryForRecommendation(recommendation);
  const timestamps = [
    recommendation.generatedAt,
    recommendation.benchmarkRun.runAt,
    ...(summary?.runs.map((run) => run.runAt) ?? []),
  ];

  return (
    Number.isFinite(maxAgeMs) &&
    maxAgeMs >= 0 &&
    Number.isFinite(now) &&
    Boolean(summary?.runs.length) &&
    timestamps.every((timestamp) => Number.isFinite(timestamp) && timestamp <= now && now - timestamp <= maxAgeMs)
  );
}

/// Filter recommendations to only those with recent evidence and meeting
/// quality thresholds. This enforces the exit criterion:
/// "nessuna etichetta 'consigliato' senza evidenza recente e una soglia
/// di qualità concordata"
export function filterValidRecommendations(
  recommendations: ModelRecommendation[],
  options: {
    maxAgeMs?: number;
    now?: number;
  } = {}
): ModelRecommendation[] {
  const {
    maxAgeMs = 30 * 24 * 60 * 60 * 1000,
    now = Date.now(),
  } = options;

  return recommendations.flatMap((rec) => {
    if (
      rec.benchmarkVersion !== rec.benchmarkRun.benchmarkVersion ||
      !rec.benchmarkRun.baseCommit ||
      !rec.benchmarkRun.candidates.some(
        (candidate) =>
          candidate.profileId === rec.candidate.profileId && candidate.model === rec.candidate.model
      ) ||
      !isRecommendationRecent(rec, maxAgeMs, now)
    ) {
      return [];
    }

    const summary = summaryForRecommendation(rec);
    if (!summary) return [];

    const result = checkQualityThresholds(summary);
    if (!result.passed) return [];

    return [{ ...rec, meetsThresholds: true, thresholdCheck: result.details }];
  });
}

/// Rank only recommendations with recent evidence and an explicitly agreed
/// threshold set. Quality measurements always take precedence over cost.
export function rankRecommendations(
  recs: ModelRecommendation[],
  options: Parameters<typeof filterValidRecommendations>[1] = {}
): ModelRecommendation[] {
  const valid = filterValidRecommendations(recs, options);
  const economicPriority: Record<BenchmarkCandidate["economicState"], number> = {
    local: 0,
    "free-quota": 1,
    subscription: 2,
    paid: 3,
    unknown: 4,
  };

  return [...valid].sort((a, b) => {
    const aSummary = summaryForRecommendation(a);
    const bSummary = summaryForRecommendation(b);
    if (!aSummary || !bSummary) throw new Error("A validated recommendation is missing its benchmark summary.");

    if (aSummary.acceptanceRate !== bSummary.acceptanceRate) {
      return bSummary.acceptanceRate - aSummary.acceptanceRate;
    }
    if (aSummary.completionRate !== bSummary.completionRate) {
      return bSummary.completionRate - aSummary.completionRate;
    }
    if (aSummary.avgRework !== bSummary.avgRework) {
      return aSummary.avgRework - bSummary.avgRework;
    }
    if (aSummary.medianLatencyMs !== bSummary.medianLatencyMs) {
      return aSummary.medianLatencyMs - bSummary.medianLatencyMs;
    }
    return economicPriority[a.candidate.economicState] - economicPriority[b.candidate.economicState];
  });
}

/// The current benchmark version. Increment when tasks change in a way that
/// affects comparability.
export const CURRENT_BENCHMARK_VERSION = 1;