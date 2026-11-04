import { describe, expect, it } from "vitest";
import {
  AGREED_QUALITY_THRESHOLDS,
  checkQualityThresholds,
  filterValidRecommendations,
  rankRecommendations,
  type BenchmarkCandidate,
  type BenchmarkRun,
  type CandidateTypeSummary,
  type ModelRecommendation,
  type TaskRunResult,
} from "$lib/agents/modelBenchmark";

const NOW = 1_800_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

function candidate(
  economicState: BenchmarkCandidate["economicState"],
  profileId: string = economicState
): BenchmarkCandidate {
  return {
    profileId,
    model: `${profileId}-model`,
    label: profileId,
    economicState,
    economicStateSource: "provider docs",
    economicStateVerifiedAt: NOW - DAY,
  };
}

function taskRun(candidate: BenchmarkCandidate, runAt: number): TaskRunResult {
  return {
    taskId: "simple-edit",
    candidate,
    completed: true,
    acceptancePassed: true,
    acceptancePassedCount: 1,
    acceptanceTotal: 1,
    reworkCount: 0,
    retryCount: 0,
    latencyMs: 1_000,
    runAt,
    baseCommit: "abc123",
  };
}

function recommendation(
  options: {
    candidate?: BenchmarkCandidate;
    completionRate?: number;
    runAt?: number;
    generatedAt?: number;
    acceptanceRate?: number;
  } = {}
): ModelRecommendation {
  const selectedCandidate = options.candidate ?? candidate("free-quota");
  const runAt = options.runAt ?? NOW - DAY;
  const result = taskRun(selectedCandidate, runAt);
  const summary: CandidateTypeSummary = {
    candidate: selectedCandidate,
    taskType: "simple-edit",
    runs: [result],
    completionRate: options.completionRate ?? 0.91,
    acceptanceRate: options.acceptanceRate ?? 0.9,
    avgRework: 1,
    avgRetries: 0,
    medianLatencyMs: 1_000,
    totalTokens: 1_000,
    totalQuotaImpact: 0,
  };
  const benchmarkRun: BenchmarkRun = {
    benchmarkVersion: 1,
    runAt,
    baseCommit: "abc123",
    candidates: [selectedCandidate],
    runs: [result],
    summaries: [summary],
  };

  return {
    taskType: "simple-edit",
    candidate: selectedCandidate,
    benchmarkRun,
    meetsThresholds: true,
    thresholdCheck: {},
    reason: "benchmark result",
    generatedAt: options.generatedAt ?? NOW - DAY,
    benchmarkVersion: 1,
  };
}

describe("model recommendations", () => {
  it("uses the agreed, strict completion threshold", () => {
    const exactlyAtThreshold = recommendation({ completionRate: 0.9 });
    const aboveThreshold = recommendation({ completionRate: 0.901 });

    expect(AGREED_QUALITY_THRESHOLDS.completionRateGreaterThan).toBe(0.9);
    expect(checkQualityThresholds(exactlyAtThreshold.benchmarkRun.summaries[0], AGREED_QUALITY_THRESHOLDS).passed)
      .toBe(false);
    expect(checkQualityThresholds(aboveThreshold.benchmarkRun.summaries[0], AGREED_QUALITY_THRESHOLDS).passed)
      .toBe(true);
  });

  it("does not return a recommendation when recent benchmark evidence misses the threshold", () => {
    expect(
      filterValidRecommendations(
        [recommendation({ completionRate: 0.9 }), recommendation({ completionRate: 0.91 })],
        { now: NOW }
      )
    ).toHaveLength(1);
  });

  it("rejects stale benchmark evidence even when the recommendation was just generated", () => {
    const rec = recommendation({
      runAt: NOW - 31 * DAY,
      generatedAt: NOW,
    });

    expect(filterValidRecommendations([rec], { now: NOW })).toEqual([]);
  });

  it("does not let cheaper economics outrank better measured quality", () => {
    const lowerQualityFree = recommendation({
      candidate: candidate("free-quota", "free"),
      completionRate: 0.91,
      acceptanceRate: 0.91,
    });
    const higherQualityPaid = recommendation({
      candidate: candidate("paid", "paid"),
      completionRate: 0.99,
      acceptanceRate: 0.99,
    });

    expect(rankRecommendations([lowerQualityFree, higherQualityPaid], { now: NOW }).map((rec) => rec.candidate.profileId))
      .toEqual(["paid", "free"]);
  });
});
