'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Bike } from 'lucide-react'
import { MotorcycleSelector } from './motorcycle-selector'
import { useMotorcycle } from '@/features/motorcycle/motorcycle-provider'
import type { MotorcycleInfo } from '@/features/motorcycle/motorcycle-provider'
import { setUserMotorcycle } from '@/features/motorcycle/actions/motorcycle-actions'
import { getModelDisplayName } from '@/features/motorcycle/lib/utils'

interface VehicleModelOption {
  id: string
  brand: string
  model: string
}

interface MotorcyclePromptCardProps {
  models: VehicleModelOption[]
  isLoggedIn: boolean
}

export function MotorcyclePromptCard({
  models,
  isLoggedIn,
}: MotorcyclePromptCardProps) {
  const { motorcycle, setMotorcycle, isReady } = useMotorcycle()
  const [isPending, startTransition] = useTransition()
  const [dismissed, setDismissed] = useState(false)

  // Don't render during SSR or when motorcycle is already set
  if (!isReady || motorcycle || dismissed) return null

  const handleSelect = (modelId: string) => {
    if (!modelId) return

    const model = models.find((m) => m.id === modelId)
    if (!model) return

    const info: MotorcycleInfo = {
      id: model.id,
      displayName: getModelDisplayName(model.brand, model.model),
    }

    if (isLoggedIn) {
      startTransition(async () => {
        await setUserMotorcycle(modelId)
        setDismissed(true)
      })
    } else {
      setMotorcycle(info)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-3 p-5">
        <Bike className="h-8 w-8 text-primary" />
        <p className="text-center text-sm font-medium">
          คุณขี่มอเตอร์ไซค์ไฟฟ้ารุ่นอะไร?
        </p>
        <MotorcycleSelector
          models={models}
          onValueChange={handleSelect}
          placeholder="เลือกรุ่นมอเตอร์ไซค์ของคุณ"
          className={`w-full ${isPending ? 'pointer-events-none opacity-60' : ''}`}
        />
      </CardContent>
    </Card>
  )
}
