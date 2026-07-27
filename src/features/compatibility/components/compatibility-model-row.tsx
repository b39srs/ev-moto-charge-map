import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Bike } from 'lucide-react'
import { VerificationBadge } from './verification-badge'
import { getModelDisplayName } from '@/features/motorcycle/lib/utils'
import { formatRelativeTime } from '@/features/compatibility/lib/format-relative-time'
import type { CompatibilitySummaryWithModel } from '@/features/compatibility/types'
import { cn } from '@/lib/utils'

interface CompatibilityModelRowProps {
  summary: CompatibilitySummaryWithModel
  isUserMotorcycle?: boolean
}

export function CompatibilityModelRow({
  summary,
  isUserMotorcycle,
}: CompatibilityModelRowProps) {
  const displayName = getModelDisplayName(
    summary.vehicle_model.brand,
    summary.vehicle_model.model
  )
  const successRate =
    summary.total_reports > 0
      ? Math.round((summary.success_count / summary.total_reports) * 100)
      : 0

  return (
    <div
      className={cn(
        'rounded-md border p-3',
        isUserMotorcycle && 'ring-2 ring-primary/20 bg-primary/5'
      )}
    >
      {/* Row 1: Model name + Verification badge */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{displayName}</p>
        <VerificationBadge level={summary.verification_level} />
      </div>

      {/* My Motorcycle badge */}
      {isUserMotorcycle && (
        <Badge variant="secondary" className="mt-1.5 text-xs">
          <Bike className="mr-1 h-3 w-3" />
          มอเตอร์ไซค์ของฉัน
        </Badge>
      )}

      {/* Row 2: Success / Failed / Rate */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {summary.success_count} สำเร็จ
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-red-500">
          <XCircle className="h-3.5 w-3.5" />
          {summary.failed_count} ล้มเหลว
        </span>
        <Badge variant="outline" className="text-xs">
          {successRate}%
        </Badge>
      </div>

      {/* Row 3: Last verified + reporters */}
      <p className="mt-1.5 text-xs text-muted-foreground">
        ยืนยันล่าสุด: {formatRelativeTime(summary.last_report_at)}
        {' · '}
        ผู้รายงาน {summary.unique_reporters} คน
      </p>
    </div>
  )
}
