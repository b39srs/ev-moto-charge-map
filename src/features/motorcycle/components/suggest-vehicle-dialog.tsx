'use client'

import { useActionState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/form/form-field'
import { SubmitButton } from '@/components/form/submit-button'
import { suggestVehicleModel } from '@/features/motorcycle/actions/motorcycle-actions'

interface SuggestVehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onModelCreated: (modelId: string) => void
  defaultBrand?: string
}

export function SuggestVehicleDialog({
  open,
  onOpenChange,
  onModelCreated,
  defaultBrand,
}: SuggestVehicleDialogProps) {
  const [state, formAction] = useActionState(suggestVehicleModel, null)

  useEffect(() => {
    if (state?.success && state.modelId) {
      onModelCreated(state.modelId)
      onOpenChange(false)
    }
  }, [state, onModelCreated, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มรุ่นรถใหม่</DialogTitle>
          <DialogDescription>
            ระบุยี่ห้อและรุ่นมอเตอร์ไซค์ไฟฟ้าของคุณ
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <FormField
            label="ยี่ห้อ"
            required
            error={state?.errors?.brand?.[0]}
          >
            <Input
              name="brand"
              placeholder="เช่น Honda, NIU, Gogoro"
              defaultValue={defaultBrand}
            />
          </FormField>

          <FormField
            label="รุ่น"
            required
            error={state?.errors?.model?.[0]}
          >
            <Input name="model" placeholder="เช่น EM1 e:, NQi GT" />
          </FormField>

          {state && !state.success && !state.errors && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              ยกเลิก
            </DialogClose>
            <SubmitButton>เพิ่มรุ่นรถ</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
