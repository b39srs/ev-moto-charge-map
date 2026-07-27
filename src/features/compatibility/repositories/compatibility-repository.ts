import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type {
  CompatibilityReportRow,
  CompatibilityReportWithDetails,
  CompatibilitySummaryRow,
  CompatibilitySummaryWithModel,
  CompatibilitySummaryWithStation,
  VerificationLevel,
} from '@/features/compatibility/types'
import type { ReportAggregate } from '@/features/compatibility/lib/summary-calculator'

// ============================================================
// Raw join result types (what Supabase actually returns)
// ============================================================

type ReportWithJoins =
  Database['public']['Tables']['compatibility_reports']['Row'] & {
    profiles: { full_name: string | null; avatar_url: string | null } | null
    vehicle_models: { brand: string; model: string } | null
  }

type ReportWithStationJoins =
  Database['public']['Tables']['compatibility_reports']['Row'] & {
    charging_locations: { name: string; province: string } | null
    vehicle_models: { brand: string; model: string } | null
  }

type SummaryWithModelJoins =
  Database['public']['Tables']['compatibility_summaries']['Row'] & {
    vehicle_models: { brand: string; model: string } | null
  }

type SummaryWithStationJoins =
  Database['public']['Tables']['compatibility_summaries']['Row'] & {
    charging_locations: { name: string; province: string } | null
  }

// ============================================================
// Reports
// ============================================================

export async function insertReport(
  supabase: SupabaseClient<Database>,
  report: Database['public']['Tables']['compatibility_reports']['Insert']
): Promise<{ error: { code: string; message: string } | null }> {
  const { error } = await supabase
    .from('compatibility_reports')
    .insert(report)

  return {
    error: error ? { code: error.code, message: error.message } : null,
  }
}

export async function getReportsByLocation(
  supabase: SupabaseClient<Database>,
  locationId: string,
  options?: { vehicleModelId?: string; limit?: number; offset?: number }
): Promise<CompatibilityReportWithDetails[]> {
  let query = supabase
    .from('compatibility_reports')
    .select(
      '*, profiles!compatibility_reports_user_id_fkey(full_name, avatar_url), vehicle_models!compatibility_reports_vehicle_model_id_fkey(brand, model)'
    )
    .eq('location_id', locationId)
    .order('created_at', { ascending: false })

  if (options?.vehicleModelId) {
    query = query.eq('vehicle_model_id', options.vehicleModelId)
  }

  if (options?.limit) {
    const offset = options.offset ?? 0
    query = query.range(offset, offset + options.limit - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching compatibility reports:', error)
    return []
  }

  return ((data ?? []) as unknown as ReportWithJoins[]).map(
    mapReportWithDetails
  )
}

export async function getReportsByUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<
  (CompatibilityReportRow & {
    station: { name: string; province: string }
    vehicle_model: { brand: string; model: string }
  })[]
> {
  const { data, error } = await supabase
    .from('compatibility_reports')
    .select(
      '*, charging_locations!compatibility_reports_location_id_fkey(name, province), vehicle_models!compatibility_reports_vehicle_model_id_fkey(brand, model)'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user compatibility reports:', error)
    return []
  }

  return ((data ?? []) as unknown as ReportWithStationJoins[]).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    location_id: row.location_id,
    vehicle_model_id: row.vehicle_model_id,
    connector_id: row.connector_id,
    outcome: row.outcome as CompatibilityReportRow['outcome'],
    reason: row.reason as CompatibilityReportRow['reason'],
    charging_speed_kw: row.charging_speed_kw,
    charge_duration_min: row.charge_duration_min,
    battery_before_pct: row.battery_before_pct,
    battery_after_pct: row.battery_after_pct,
    adapter_used: row.adapter_used,
    notes: row.notes,
    created_at: row.created_at,
    station: row.charging_locations ?? { name: '', province: '' },
    vehicle_model: row.vehicle_models ?? { brand: '', model: '' },
  }))
}

export async function getReportAggregates(
  supabase: SupabaseClient<Database>,
  locationId: string,
  vehicleModelId: string
): Promise<ReportAggregate[]> {
  const { data, error } = await supabase
    .from('compatibility_reports')
    .select('outcome, user_id, created_at')
    .eq('location_id', locationId)
    .eq('vehicle_model_id', vehicleModelId)

  if (error) {
    console.error('Error fetching reports for summary:', error)
    return []
  }

  return (data ?? []) as unknown as ReportAggregate[]
}

// ============================================================
// Summaries
// ============================================================

export async function upsertSummary(
  supabase: SupabaseClient<Database>,
  summary: Database['public']['Tables']['compatibility_summaries']['Insert']
): Promise<void> {
  const { error } = await supabase
    .from('compatibility_summaries')
    .upsert(summary, { onConflict: 'vehicle_model_id,location_id' })

  if (error) {
    console.error('Error upserting compatibility summary:', error)
  }
}

export async function getSummariesByLocation(
  supabase: SupabaseClient<Database>,
  locationId: string
): Promise<CompatibilitySummaryWithModel[]> {
  const { data, error } = await supabase
    .from('compatibility_summaries')
    .select(
      '*, vehicle_models!compatibility_summaries_vehicle_model_id_fkey(brand, model)'
    )
    .eq('location_id', locationId)
    .gt('total_reports', 0)
    .order('total_reports', { ascending: false })

  if (error) {
    console.error('Error fetching compatibility summaries:', error)
    return []
  }

  return ((data ?? []) as unknown as SummaryWithModelJoins[]).map((row) => ({
    vehicle_model_id: row.vehicle_model_id,
    location_id: row.location_id,
    total_reports: row.total_reports,
    success_count: row.success_count,
    failed_count: row.failed_count,
    unique_reporters: row.unique_reporters,
    verification_level: row.verification_level as VerificationLevel,
    last_report_at: row.last_report_at,
    last_success_at: row.last_success_at,
    updated_at: row.updated_at,
    vehicle_model: row.vehicle_models ?? { brand: '', model: '' },
  }))
}

export async function getSummariesByModel(
  supabase: SupabaseClient<Database>,
  vehicleModelId: string
): Promise<CompatibilitySummaryWithStation[]> {
  const { data, error } = await supabase
    .from('compatibility_summaries')
    .select(
      '*, charging_locations!compatibility_summaries_location_id_fkey(name, province)'
    )
    .eq('vehicle_model_id', vehicleModelId)
    .gt('total_reports', 0)
    .order('verification_level', { ascending: false })
    .order('last_success_at', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Error fetching model compatibility summaries:', error)
    return []
  }

  return ((data ?? []) as unknown as SummaryWithStationJoins[]).map((row) => ({
    vehicle_model_id: row.vehicle_model_id,
    location_id: row.location_id,
    total_reports: row.total_reports,
    success_count: row.success_count,
    failed_count: row.failed_count,
    unique_reporters: row.unique_reporters,
    verification_level: row.verification_level as VerificationLevel,
    last_report_at: row.last_report_at,
    last_success_at: row.last_success_at,
    updated_at: row.updated_at,
    station: row.charging_locations ?? { name: '', province: '' },
  }))
}

export async function getSummaryForPair(
  supabase: SupabaseClient<Database>,
  vehicleModelId: string,
  locationId: string
): Promise<CompatibilitySummaryRow | null> {
  const { data, error } = await supabase
    .from('compatibility_summaries')
    .select('*')
    .eq('vehicle_model_id', vehicleModelId)
    .eq('location_id', locationId)
    .single()

  if (error || !data) return null

  return {
    ...data,
    verification_level: data.verification_level as VerificationLevel,
  }
}

// ============================================================
// Vehicle Models
// ============================================================

export async function getVehicleModel(
  supabase: SupabaseClient<Database>,
  vehicleModelId: string
): Promise<{ brand: string; model: string } | null> {
  const { data } = await supabase
    .from('vehicle_models')
    .select('brand, model')
    .eq('id', vehicleModelId)
    .single()

  return data
}

// ============================================================
// Mappers
// ============================================================

function mapReportWithDetails(
  row: ReportWithJoins
): CompatibilityReportWithDetails {
  return {
    id: row.id,
    user_id: row.user_id,
    location_id: row.location_id,
    vehicle_model_id: row.vehicle_model_id,
    connector_id: row.connector_id,
    outcome: row.outcome as CompatibilityReportWithDetails['outcome'],
    reason: row.reason as CompatibilityReportWithDetails['reason'],
    charging_speed_kw: row.charging_speed_kw,
    charge_duration_min: row.charge_duration_min,
    battery_before_pct: row.battery_before_pct,
    battery_after_pct: row.battery_after_pct,
    adapter_used: row.adapter_used,
    notes: row.notes,
    created_at: row.created_at,
    reporter: row.profiles ?? { full_name: null, avatar_url: null },
    vehicle_model: row.vehicle_models ?? { brand: '', model: '' },
  }
}
