'use server'

import { createClient } from '@/lib/supabase/server'
import { createCompatibilityReportSchema } from '@/lib/validations/compatibility'
import { submitCompatibilityReport } from '@/features/compatibility/services/compatibility-service'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/actions'

/**
 * Server action: create a new compatibility report.
 *
 * Thin orchestrator — handles auth, FormData parsing, Zod validation,
 * then delegates all business logic to the service layer.
 */
export async function createCompatibilityReport(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // 1. Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ' }
  }

  // 2. Parse FormData
  const raw = {
    location_id: formData.get('location_id') as string,
    vehicle_model_id: formData.get('vehicle_model_id') as string,
    connector_id: (formData.get('connector_id') as string) || undefined,
    outcome: formData.get('outcome') as string,
    reason: (formData.get('reason') as string) || undefined,
    charging_speed_kw: formData.get('charging_speed_kw')
      ? parseFloat(formData.get('charging_speed_kw') as string)
      : undefined,
    charge_duration_min: formData.get('charge_duration_min')
      ? parseInt(formData.get('charge_duration_min') as string, 10)
      : undefined,
    battery_before_pct: formData.get('battery_before_pct')
      ? parseInt(formData.get('battery_before_pct') as string, 10)
      : undefined,
    battery_after_pct: formData.get('battery_after_pct')
      ? parseInt(formData.get('battery_after_pct') as string, 10)
      : undefined,
    adapter_used: formData.get('adapter_used') === 'true',
    notes: (formData.get('notes') as string) || undefined,
  }

  // 3. Zod validation
  const parsed = createCompatibilityReportSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.')
      errors[key] = errors[key] ?? []
      errors[key].push(issue.message)
    }
    return { success: false, message: 'กรุณาตรวจสอบข้อมูล', errors }
  }

  // 4. Delegate to service
  const result = await submitCompatibilityReport(supabase, parsed.data, user.id)

  // 5. Revalidate on success
  if (result.success) {
    revalidatePath(`/stations/${parsed.data.location_id}`)
  }

  return result
}
