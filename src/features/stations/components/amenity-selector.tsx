'use client'

import { Checkbox } from '@/components/ui/checkbox'
import type { Amenity } from '@/types/entities'

interface AmenitySelectorProps {
  amenities: Amenity[]
  defaultSelectedIds?: string[]
}

const CATEGORY_LABELS: Record<string, string> = {
  facility: 'สิ่งอำนวยความสะดวก',
  nearby: 'สถานที่ใกล้เคียง',
  feature: 'คุณสมบัติ',
  safety: 'ความปลอดภัย',
  general: 'ทั่วไป',
}

export function AmenitySelector({ amenities, defaultSelectedIds = [] }: AmenitySelectorProps) {
  const grouped = amenities.reduce(
    (acc, a) => {
      const cat = a.category ?? 'general'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(a)
      return acc
    },
    {} as Record<string, Amenity[]>
  )

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">สิ่งอำนวยความสะดวก</label>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            {CATEGORY_LABELS[category] ?? category}
          </p>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((amenity) => (
              <label
                key={amenity.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-accent"
              >
                <Checkbox name="amenity_ids" value={amenity.id} defaultChecked={defaultSelectedIds.includes(amenity.id)} />
                <span className="text-sm">{amenity.display_name}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
