'use client'

import { Bike } from 'lucide-react'
import { useMotorcycle } from '@/features/motorcycle/motorcycle-provider'

export function MyMotorcycleBadge() {
  const { motorcycle, isReady } = useMotorcycle()

  if (!isReady || !motorcycle) return null

  return (
    <div className="mb-3 flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
      <Bike className="h-4 w-4 text-primary" />
      <span className="text-muted-foreground">มอเตอร์ไซค์ของฉัน:</span>
      <span className="font-medium">{motorcycle.displayName}</span>
    </div>
  )
}
