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
import type { ConnectorType, Network } from '@/types/entities'

interface MapFiltersProps {
  isFreeOnly: boolean
  province: string
  connectorTypeId: string
  networkId: string
  connectorTypes: ConnectorType[]
  networks: Network[]
  hasVehicleFilter: boolean
  onFreeOnlyChange: (value: boolean) => void
  onProvinceChange: (value: string) => void
  onConnectorTypeChange: (value: string) => void
  onNetworkChange: (value: string) => void
  activeFilterCount: number
}

export function MapFilters({
  isFreeOnly,
  province,
  connectorTypeId,
  networkId,
  connectorTypes,
  networks,
  hasVehicleFilter,
  onFreeOnlyChange,
  onProvinceChange,
  onConnectorTypeChange,
  onNetworkChange,
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

          {/* Network / Brand filter */}
          <div className="mb-3">
            <label className="mb-1 block text-xs text-muted-foreground">
              เครือข่าย
            </label>
            <Select
              value={networkId || 'all'}
              onValueChange={(v) => onNetworkChange(v === 'all' ? '' : (v ?? ''))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เครือข่าย" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกเครือข่าย</SelectItem>
                {networks.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Connector type filter (hidden when vehicle filter is active) */}
          {!hasVehicleFilter && (
            <div className="mb-3">
              <label className="mb-1 block text-xs text-muted-foreground">
                หัวชาร์จ
              </label>
              <Select
                value={connectorTypeId || 'all'}
                onValueChange={(v) =>
                  onConnectorTypeChange(v === 'all' ? '' : (v ?? ''))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="หัวชาร์จ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกประเภท</SelectItem>
                  {connectorTypes.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      {ct.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Province filter */}
          <div className="mb-3">
            <label className="mb-1 block text-xs text-muted-foreground">
              จังหวัด
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
          </div>

          {/* Free only */}
          <label className="mb-3 flex items-center gap-2">
            <Checkbox
              checked={isFreeOnly}
              onCheckedChange={(checked) => onFreeOnlyChange(checked === true)}
            />
            <span className="text-sm">ฟรีเท่านั้น</span>
          </label>

          {activeFilterCount > 0 && (
            <button
              type="button"
              className="mt-2 w-full rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                onFreeOnlyChange(false)
                onProvinceChange('')
                onConnectorTypeChange('')
                onNetworkChange('')
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
