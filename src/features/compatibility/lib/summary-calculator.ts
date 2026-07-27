import type { VerificationLevel } from '@/features/compatibility/types'
import { computeVerificationLevel } from '@/features/compatibility/lib/verification'

// --- Input/Output types ---

export interface ReportAggregate {
  outcome: string
  user_id: string
  created_at: string
}

export interface SummaryStats {
  total_reports: number
  success_count: number
  failed_count: number
  unique_reporters: number
  last_report_at: string | null
  last_success_at: string | null
}

export interface ComputedSummary extends SummaryStats {
  verification_level: VerificationLevel
}

/**
 * Pure function: compute summary statistics from an array of report rows.
 * No DB access — takes raw data in, returns computed stats out.
 */
export function computeSummaryStats(reports: ReportAggregate[]): SummaryStats {
  const total_reports = reports.length
  const success_count = reports.filter((r) => r.outcome === 'success').length
  const failed_count = reports.filter((r) => r.outcome === 'failed').length
  const unique_reporters = new Set(reports.map((r) => r.user_id)).size

  let last_report_at: string | null = null
  let last_success_at: string | null = null

  for (const report of reports) {
    if (!last_report_at || report.created_at > last_report_at) {
      last_report_at = report.created_at
    }
    if (report.outcome === 'success') {
      if (!last_success_at || report.created_at > last_success_at) {
        last_success_at = report.created_at
      }
    }
  }

  return {
    total_reports,
    success_count,
    failed_count,
    unique_reporters,
    last_report_at,
    last_success_at,
  }
}

/**
 * Pure function: compute full summary including verification level.
 */
export function computeFullSummary(
  reports: ReportAggregate[]
): ComputedSummary {
  const stats = computeSummaryStats(reports)
  const verification_level = computeVerificationLevel({
    total_reports: stats.total_reports,
    success_count: stats.success_count,
    unique_reporters: stats.unique_reporters,
    last_report_at: stats.last_report_at,
  })

  return { ...stats, verification_level }
}
