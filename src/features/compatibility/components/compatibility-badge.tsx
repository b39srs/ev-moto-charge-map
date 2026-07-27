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
  // STATE 1: Verified — community has confirmed this works
  if (
    verificationLevel != null &&
    (verificationLevel === VERIFICATION_LEVELS.HIGHLY_VERIFIED ||
      verificationLevel === VERIFICATION_LEVELS.COMMUNITY_VERIFIED)
  ) {
    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-sm font-medium text-green-700">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          <span>ยืนยันแล้วโดยผู้ใช้รถรุ่นนี้</span>
        </div>
        <p className="pl-3.5 text-xs text-green-600/80">
          {successCount} คนยืนยัน · {vehicleDisplayName}
        </p>
      </div>
    )
  }

  // STATE 3: Needs More Data — reports exist but inconclusive or stale
  if (
    verificationLevel != null &&
    (verificationLevel === VERIFICATION_LEVELS.SINGLE_REPORT ||
      verificationLevel === VERIFICATION_LEVELS.STALE)
  ) {
    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-sm font-medium text-yellow-700">
          <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
          <span>มีรายงานการใช้งาน</span>
        </div>
        <p className="pl-3.5 text-xs text-muted-foreground">
          {totalReports} รายงาน · ต้องการข้อมูลเพิ่มเติม
        </p>
      </div>
    )
  }

  // STATE 2: Expected — connector match only, no community verification
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
        <span>คาดว่าใช้งานได้</span>
      </div>
      <p className="pl-3.5 text-xs text-muted-foreground/80">
        อ้างอิงจากข้อมูลหัวชาร์จ · ยังไม่มีผู้ใช้ยืนยัน
      </p>
    </div>
  )
}
