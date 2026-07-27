'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getModelDisplayName } from '@/features/motorcycle/lib/utils'

interface VehicleModelOption {
  id: string
  brand: string
  model: string
}

interface MotorcycleSelectorProps {
  models: VehicleModelOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function MotorcycleSelector({
  models,
  value,
  onValueChange,
  placeholder = 'เลือกรุ่นมอเตอร์ไซค์',
  className,
}: MotorcycleSelectorProps) {
  return (
    <Select value={value ?? ''} onValueChange={(v) => onValueChange?.(v ?? '')}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">ไม่ระบุ</SelectItem>
        {models.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {getModelDisplayName(m.brand, m.model)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
