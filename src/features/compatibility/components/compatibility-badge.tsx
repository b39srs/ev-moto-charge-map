import { VERIFICATION_LEVELS } from '@/features/compatibility/types'
import type { VerificationLevel } from '@/features/compatibility/types'

interface CompatibilityBadgeProps {
  vehicleDisplayName: string
  verificationLevel?: VerificationLevel
  totalReports?: number
  successCount?: number
}

export function CompatibilityBadge({
  vehicleDisplayName,
  verificationLevel,
  totalReports = 0,
  successCount = 0,
}: CompatibilityBadgeProps) {
  // Determine badge style and text based on verification level
  if (
    verificationLevel != null &&
    (verificationLevel === VERIFICATION_LEVELS.HIGHLY_VERIFIED ||
      verificationLevel === VERIFICATION_LEVELS.COMMUNITY_VERIFIED)
  ) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-green-700">
        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
        <span>
          ชุมชนยืนยัน ({successCount} คน) · {vehicleDisplayName}
        </span>
      </div>
    )
  }

  if (
    verificationLevel != null &&
    verificationLevel === VERIFICATION_LEVELS.SINGLE_REPORT
  ) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-yellow-700">
        <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
        <span>
          มีรายงาน ({totalReports} คน) · {vehicleDisplayName}
        </span>
      </div>
    )
  }

  if (
    verificationLevel != null &&
    verificationLevel === VERIFICATION_LEVELS.STALE
  ) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-yellow-700">
        <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
        <span>
          ข้อมูลเก่า ({totalReports} คน) · {vehicleDisplayName}
        </span>
      </div>
    )
  }

  // NO_DATA or undefined — connector match only
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
      <span>รองรับหัวชาร์จเดียวกัน · {vehicleDisplayName}</span>
    </div>
  )
}
