// ============================================================
// Community Compatibility — Domain Types
// ============================================================

// --- Outcome & Reason ---

export const REPORT_OUTCOMES = ['success', 'failed'] as const
export type ReportOutcome = (typeof REPORT_OUTCOMES)[number]

export const REPORT_REASONS = [
  'incompatible_connector',
  'station_offline',
  'power_limit',
  'adapter_required',
  'unknown',
  'other',
] as const
export type ReportReason = (typeof REPORT_REASONS)[number]

// --- Verification Levels ---

export const VERIFICATION_LEVELS = {
  NO_DATA: 0,
  SINGLE_REPORT: 1,
  COMMUNITY_VERIFIED: 2,
  HIGHLY_VERIFIED: 3,
  STALE: 4,
} as const

export type VerificationLevel =
  (typeof VERIFICATION_LEVELS)[keyof typeof VERIFICATION_LEVELS]

export const VERIFICATION_LABEL: Record<VerificationLevel, string> = {
  [VERIFICATION_LEVELS.NO_DATA]: 'ไม่มีข้อมูล',
  [VERIFICATION_LEVELS.SINGLE_REPORT]: 'รายงานเดี่ยว',
  [VERIFICATION_LEVELS.COMMUNITY_VERIFIED]: 'ชุมชนยืนยัน',
  [VERIFICATION_LEVELS.HIGHLY_VERIFIED]: 'ยืนยันสูง',
  [VERIFICATION_LEVELS.STALE]: 'ข้อมูลเก่า',
}

// --- Stale threshold ---

/** Reports older than this (in months) degrade verification to STALE */
export const STALE_THRESHOLD_MONTHS = 6

// --- Row types ---

export interface CompatibilityReportRow {
  id: string
  user_id: string
  location_id: string
  vehicle_model_id: string
  connector_id: string | null
  outcome: ReportOutcome
  reason: ReportReason | null
  charging_speed_kw: number | null
  charge_duration_min: number | null
  battery_before_pct: number | null
  battery_after_pct: number | null
  adapter_used: boolean
  notes: string | null
  created_at: string
}

export interface CompatibilitySummaryRow {
  vehicle_model_id: string
  location_id: string
  total_reports: number
  success_count: number
  failed_count: number
  unique_reporters: number
  verification_level: VerificationLevel
  last_report_at: string | null
  last_success_at: string | null
  updated_at: string
}

// --- Extended types with joins ---

export interface CompatibilityReportWithDetails extends CompatibilityReportRow {
  reporter: { full_name: string | null; avatar_url: string | null }
  vehicle_model: { brand: string; model: string }
}

export interface CompatibilitySummaryWithModel extends CompatibilitySummaryRow {
  vehicle_model: { brand: string; model: string }
}

export interface CompatibilitySummaryWithStation extends CompatibilitySummaryRow {
  station: { name: string; province: string }
}
