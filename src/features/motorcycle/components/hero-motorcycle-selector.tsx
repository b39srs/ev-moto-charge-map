'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { Bike } from 'lucide-react'
import { MotorcycleAutocomplete } from './motorcycle-autocomplete'
import { useMotorcycle } from '@/features/motorcycle/motorcycle-provider'
import { getModelDisplayName } from '@/features/motorcycle/lib/utils'
import Link from 'next/link'

interface VehicleModelOption {
  id: string
  brand: string
  model: string
}

interface HeroMotorcycleSelectorProps {
  models: VehicleModelOption[]
  popularModelIds?: string[]
}

export function HeroMotorcycleSelector({
  models,
  popularModelIds,
}: HeroMotorcycleSelectorProps) {
  const router = useRouter()
  const { motorcycle } = useMotorcycle()

  const handleSelect = useCallback(
    (modelId: string) => {
      if (!modelId) return
      router.push(`/stations?vehicle=${modelId}`)
    },
    [router]
  )

  // Build popular models from provided IDs, or fall back to first 6
  const popularModels = popularModelIds
    ? popularModelIds
        .map((id) => models.find((m) => m.id === id))
        .filter((m): m is VehicleModelOption => m != null)
    : models.slice(0, 6)

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {/* If user already has a motorcycle set, show quick CTA */}
      {motorcycle && (
        <Link
          href={`/stations?vehicle=${motorcycle.id}`}
          className="flex items-center justify-center gap-2 rounded-lg border bg-primary/5 px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10"
        >
          <Bike className="h-4 w-4 text-primary" />
          <span>ดูสถานีที่รองรับ {motorcycle.displayName} →</span>
        </Link>
      )}

      {/* Autocomplete search */}
      <div className="space-y-2">
        <p className="text-center text-sm font-medium text-muted-foreground">
          🏍️ รถของคุณคืออะไร?
        </p>
        <MotorcycleAutocomplete
          models={models}
          onValueChange={handleSelect}
          placeholder="ค้นหารุ่นมอเตอร์ไซค์..."
          className="h-10 text-base"
        />
      </div>

      {/* Popular model chips */}
      {popularModels.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-center text-xs text-muted-foreground">
            รุ่นยอดนิยม
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularModels.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelect(m.id)}
                className="rounded-full border bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {getModelDisplayName(m.brand, m.model)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
