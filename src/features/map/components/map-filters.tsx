'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { THAI_PROVINCES } from '@/lib/constants'

interface MapFiltersProps {
  isFreeOnly: boolean
  province: string
  onFreeOnlyChange: (value: boolean) => void
  onProvinceChange: (value: string) => void
  activeFilterCount: number
}

export function MapFilters({
  isFreeOnly,
  province,
  onFreeOnlyChange,
  onProvinceChange,
  activeFilterCount,
}: MapFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="m-2.5 mt-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-sm font-medium shadow-md hover:bg-accent"
      >
        <SlidersHorizontal className="h-4 w-4" />
        ตัวกรอง
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="mt-2 w-[260px] rounded-lg border bg-white p-3 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">ตัวกรอง</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="mb-3 flex items-center gap-2">
            <Checkbox
              checked={isFreeOnly}
              onCheckedChange={(checked) => onFreeOnlyChange(checked === true)}
            />
            <span className="text-sm">ฟรีเท่านั้น</span>
          </label>

          <Select
            value={province || 'all'}
            onValueChange={(v) => onProvinceChange(v === 'all' ? '' : (v ?? ''))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="จังหวัด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกจังหวัด</SelectItem>
              {THAI_PROVINCES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <button
              type="button"
              className="mt-2 w-full rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                onFreeOnlyChange(false)
                onProvinceChange('')
              }}
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      )}
    </div>
  )
}
