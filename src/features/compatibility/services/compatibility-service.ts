import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { ActionResult } from '@/types/actions'
import type { CreateCompatibilityReportInput } from '@/lib/validations/compatibility'
import * as repo from '@/features/compatibility/repositories/compatibility-repository'
import { computeFullSummary } from '@/features/compatibility/lib/summary-calculator'
import {
  validateVehicleModel,
  isDuplicateReportError,
} from '@/features/compatibility/lib/report-validator'

/**
 * Submit a new compatibility report.
 *
 * Orchestrates: business validation → insert report → recompute summary.
 * No auth, no FormData — the action layer handles those.
 */
export async function submitCompatibilityReport(
  supabase: SupabaseClient<Database>,
  input: CreateCompatibilityReportInput,
  userId: string
): Promise<ActionResult> {
  // 1. Business rule: validate vehicle model
  const vehicleModel = await repo.getVehicleModel(
    supabase,
    input.vehicle_model_id
  )
  const modelError = validateVehicleModel(vehicleModel)
  if (modelError) {
    return { success: false, message: modelError }
  }

  // 2. Insert the report
  const { error } = await repo.insertReport(supabase, {
    user_id: userId,
    location_id: input.location_id,
    vehicle_model_id: input.vehicle_model_id,
    connector_id: input.connector_id || null,
    outcome: input.outcome,
    reason: input.reason ?? null,
    charging_speed_kw: input.charging_speed_kw ?? null,
    charge_duration_min: input.charge_duration_min ?? null,
    battery_before_pct: input.battery_before_pct ?? null,
    battery_after_pct: input.battery_after_pct ?? null,
    adapter_used: input.adapter_used,
    notes: input.notes || null,
  })

  if (error) {
    if (isDuplicateReportError(error)) {
      return { success: false, message: 'คุณได้รายงานสถานีนี้แล้ววันนี้' }
    }
    console.error('Error creating compatibility report:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกรายงาน' }
  }

  // 3. Recompute summary
  await recomputeSummary(supabase, input.location_id, input.vehicle_model_id)

  return { success: true, message: 'บันทึกรายงานความเข้ากันได้สำเร็จ' }
}

// ============================================================
// Internal helpers
// ============================================================

async function recomputeSummary(
  supabase: SupabaseClient<Database>,
  locationId: string,
  vehicleModelId: string
): Promise<void> {
  const reports = await repo.getReportAggregates(
    supabase,
    locationId,
    vehicleModelId
  )
  const summary = computeFullSummary(reports)

  await repo.upsertSummary(supabase, {
    vehicle_model_id: vehicleModelId,
    location_id: locationId,
    ...summary,
    updated_at: new Date().toISOString(),
  })
}
