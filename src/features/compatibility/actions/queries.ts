import { createClient } from '@/lib/supabase/server'
import * as repo from '@/features/compatibility/repositories/compatibility-repository'
import type {
  CompatibilityReportRow,
  CompatibilityReportWithDetails,
  CompatibilitySummaryRow,
  CompatibilitySummaryWithModel,
  CompatibilitySummaryWithStation,
} from '@/features/compatibility/types'

// ============================================================
// Reports — thin delegates to repository
// ============================================================

export async function getCompatibilityReportsByLocation(
  locationId: string,
  options?: { vehicleModelId?: string; limit?: number; offset?: number }
): Promise<CompatibilityReportWithDetails[]> {
  const supabase = await createClient()
  return repo.getReportsByLocation(supabase, locationId, options)
}

export async function getUserCompatibilityReports(
  userId: string
): Promise<
  (CompatibilityReportRow & {
    station: { name: string; province: string }
    vehicle_model: { brand: string; model: string }
  })[]
> {
  const supabase = await createClient()
  return repo.getReportsByUser(supabase, userId)
}

// ============================================================
// Summaries — thin delegates to repository
// ============================================================

export async function getCompatibilitySummaryByLocation(
  locationId: string
): Promise<CompatibilitySummaryWithModel[]> {
  const supabase = await createClient()
  return repo.getSummariesByLocation(supabase, locationId)
}

export async function getCompatibilitySummaryByModel(
  vehicleModelId: string
): Promise<CompatibilitySummaryWithStation[]> {
  const supabase = await createClient()
  return repo.getSummariesByModel(supabase, vehicleModelId)
}

export async function getCompatibilitySummaryForPair(
  vehicleModelId: string,
  locationId: string
): Promise<CompatibilitySummaryRow | null> {
  const supabase = await createClient()
  return repo.getSummaryForPair(supabase, vehicleModelId, locationId)
}
