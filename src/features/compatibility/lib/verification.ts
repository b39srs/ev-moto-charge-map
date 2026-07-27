import {
  VERIFICATION_LEVELS,
  STALE_THRESHOLD_MONTHS,
  type VerificationLevel,
} from '@/features/compatibility/types'

interface SummaryInput {
  total_reports: number
  success_count: number
  unique_reporters: number
  last_report_at: string | null
}

/**
 * Compute verification level from summary statistics.
 *
 * Levels:
 *   0 NO_DATA           — no reports exist
 *   1 SINGLE_REPORT     — only one reporter
 *   2 COMMUNITY_VERIFIED — 2+ reporters, 2+ successes
 *   3 HIGHLY_VERIFIED   — 5+ reporters, 5+ successes, ≥80% success rate
 *   4 STALE             — would qualify for 2+ but last report is too old
 */
export function computeVerificationLevel(
  summary: SummaryInput
): VerificationLevel {
  const { total_reports, success_count, unique_reporters, last_report_at } =
    summary

  if (total_reports === 0) {
    return VERIFICATION_LEVELS.NO_DATA
  }

  // Check staleness first — if the data is old, it can't be "verified"
  const isStale = last_report_at
    ? isOlderThanMonths(last_report_at, STALE_THRESHOLD_MONTHS)
    : true

  const successRate =
    total_reports > 0 ? success_count / total_reports : 0

  // Determine the "raw" level ignoring staleness
  let rawLevel: VerificationLevel = VERIFICATION_LEVELS.SINGLE_REPORT

  if (unique_reporters >= 5 && success_count >= 5 && successRate >= 0.8) {
    rawLevel = VERIFICATION_LEVELS.HIGHLY_VERIFIED
  } else if (unique_reporters >= 2 && success_count >= 2) {
    rawLevel = VERIFICATION_LEVELS.COMMUNITY_VERIFIED
  }

  // Apply stale downgrade for levels 2+
  if (
    isStale &&
    rawLevel >= VERIFICATION_LEVELS.COMMUNITY_VERIFIED
  ) {
    return VERIFICATION_LEVELS.STALE
  }

  return rawLevel
}

function isOlderThanMonths(dateStr: string, months: number): boolean {
  const date = new Date(dateStr)
  const threshold = new Date()
  threshold.setMonth(threshold.getMonth() - months)
  return date < threshold
}
