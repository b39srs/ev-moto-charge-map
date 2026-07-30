'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField } from '@/components/form/form-field'
import { SubmitButton } from '@/components/form/submit-button'
import { MotorcycleAutocomplete } from '@/features/motorcycle/components/motorcycle-autocomplete'
import { OutcomeSelector } from './outcome-selector'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActionResult } from '@/types/actions'
import type { ReportOutcome } from '@/features/compatibility/types'

interface VehicleModelOption {
  id: string
  brand: string
  model: string
}

interface ReportFormProps {
  formAction: (payload: FormData) => void
  state: ActionResult | null
  vehicleModels: VehicleModelOption[]
  defaultModelId?: string
  locationId: string
}

const REASON_LABELS: Record<string, string> = {
  incompatible_connector: 'หัวชาร์จไม่เข้ากัน',
  station_offline: 'สถานีไม่ทำงาน',
  power_limit: 'กำลังไฟไม่พอ',
  adapter_required: 'ต้องใช้อะแดปเตอร์',
  unknown: 'ไม่ทราบสาเหตุ',
  other: 'อื่นๆ',
}

export function ReportForm({
  formAction,
  state,
  vehicleModels,
  defaultModelId,
  locationId,
}: ReportFormProps) {
  const [modelId, setModelId] = useState(defaultModelId ?? '')
  const [outcome, setOutcome] = useState<ReportOutcome | undefined>()
  const [reason, setReason] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [batteryBefore, setBatteryBefore] = useState<number | undefined>()
  const [batteryAfter, setBatteryAfter] = useState<number | undefined>()
  const [adapterUsed, setAdapterUsed] = useState(false)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="location_id" value={locationId} />
      <input type="hidden" name="vehicle_model_id" value={modelId} />

      {/* Motorcycle selector */}
      <FormField
        label="รุ่นมอเตอร์ไซค์"
        required
        error={state?.errors?.vehicle_model_id?.[0]}
      >
        <MotorcycleAutocomplete
          models={vehicleModels}
          value={modelId}
          onValueChange={setModelId}
          className="w-full"
          allowSuggest
        />
      </FormField>

      {/* Outcome */}
      <FormField
        label="ผลการชาร์จ"
        required
        error={state?.errors?.outcome?.[0]}
      >
        <OutcomeSelector value={outcome} onChange={setOutcome} />
      </FormField>

      {/* Reason (conditional) */}
      {outcome === 'failed' && (
        <FormField label="สาเหตุ" error={state?.errors?.reason?.[0]}>
          <input type="hidden" name="reason" value={reason} />
          <Select value={reason} onValueChange={(v) => setReason(v ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="เลือกสาเหตุ" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REASON_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}

      {/* Additional details disclosure */}
      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="flex w-full items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            showDetails && 'rotate-180'
          )}
        />
        รายละเอียดเพิ่มเติม
      </button>

      {showDetails && (
        <div className="space-y-4 rounded-md border p-3">
          {/* Battery before */}
          <FormField label="แบตเตอรี่ก่อนชาร์จ">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={batteryBefore ?? 50}
                onChange={(e) => setBatteryBefore(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="w-12 text-right text-sm tabular-nums">
                {batteryBefore != null ? `${batteryBefore}%` : '—'}
              </span>
            </div>
            <input
              type="hidden"
              name="battery_before_pct"
              value={batteryBefore ?? ''}
            />
          </FormField>

          {/* Battery after */}
          <FormField label="แบตเตอรี่หลังชาร์จ">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={batteryAfter ?? 50}
                onChange={(e) => setBatteryAfter(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="w-12 text-right text-sm tabular-nums">
                {batteryAfter != null ? `${batteryAfter}%` : '—'}
              </span>
            </div>
            <input
              type="hidden"
              name="battery_after_pct"
              value={batteryAfter ?? ''}
            />
          </FormField>

          {/* Duration */}
          <FormField
            label="ระยะเวลาชาร์จ"
            error={state?.errors?.charge_duration_min?.[0]}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                name="charge_duration_min"
                min={1}
                placeholder="0"
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">นาที</span>
            </div>
          </FormField>

          {/* Adapter used */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={adapterUsed}
              onCheckedChange={(checked) => setAdapterUsed(checked as boolean)}
            />
            <label className="text-sm">ใช้อะแดปเตอร์</label>
            <input
              type="hidden"
              name="adapter_used"
              value={String(adapterUsed)}
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <FormField label="หมายเหตุ" error={state?.errors?.notes?.[0]}>
        <Textarea
          name="notes"
          placeholder="บันทึกเพิ่มเติม..."
          rows={2}
          maxLength={500}
        />
      </FormField>

      {/* General error */}
      {state && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <SubmitButton className="w-full">ส่งรายงาน</SubmitButton>
    </form>
  )
}
