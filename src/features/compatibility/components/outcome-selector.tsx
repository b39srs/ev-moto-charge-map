'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReportOutcome } from '@/features/compatibility/types'

interface OutcomeSelectorProps {
  value?: ReportOutcome
  onChange: (value: ReportOutcome) => void
}

export function OutcomeSelector({ value, onChange }: OutcomeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange('success')}
        className={cn(
          'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm font-medium transition-colors',
          value === 'success'
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-muted-foreground/25 text-muted-foreground hover:border-muted-foreground/50'
        )}
      >
        <CheckCircle2 className="h-6 w-6" />
        ชาร์จสำเร็จ
      </button>
      <button
        type="button"
        onClick={() => onChange('failed')}
        className={cn(
          'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm font-medium transition-colors',
          value === 'failed'
            ? 'border-red-500 bg-red-50 text-red-700'
            : 'border-muted-foreground/25 text-muted-foreground hover:border-muted-foreground/50'
        )}
      >
        <XCircle className="h-6 w-6" />
        ชาร์จไม่ได้
      </button>
      <input type="hidden" name="outcome" value={value ?? ''} />
    </div>
  )
}
