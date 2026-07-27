import { Badge } from '@/components/ui/badge'
import {
  VERIFICATION_LABEL,
  type VerificationLevel,
} from '@/features/compatibility/types'
import { cn } from '@/lib/utils'

const VERIFICATION_COLORS: Record<VerificationLevel, string> = {
  0: 'bg-gray-100 text-gray-600',
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-green-100 text-green-700',
  3: 'bg-emerald-100 text-emerald-800',
  4: 'bg-amber-100 text-amber-700',
}

interface VerificationBadgeProps {
  level: VerificationLevel
}

export function VerificationBadge({ level }: VerificationBadgeProps) {
  return (
    <Badge
      className={cn('text-xs border-transparent', VERIFICATION_COLORS[level])}
      aria-label={`ระดับการยืนยัน: ${VERIFICATION_LABEL[level]}`}
    >
      {VERIFICATION_LABEL[level]}
    </Badge>
  )
}
