/**
 * Validate that a vehicle model can submit compatibility reports.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateVehicleModel(
  model: { brand: string } | null
): string | null {
  if (!model) {
    return 'ไม่พบรุ่นมอเตอร์ไซค์'
  }

  if (model.brand === 'Other') {
    return 'กรุณาเลือกรุ่นมอเตอร์ไซค์ที่ระบุ (ไม่สามารถใช้ "Other" ได้)'
  }

  return null
}

/**
 * Check if a Supabase error is a duplicate report (unique constraint violation).
 */
export function isDuplicateReportError(
  error: { code: string } | null
): boolean {
  return error?.code === '23505'
}
