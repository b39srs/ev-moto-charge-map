'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { useMotorcycle } from '@/features/motorcycle/motorcycle-provider'
import { createCompatibilityReport } from '@/features/compatibility/actions/compatibility-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ReportForm } from './report-form'

interface VehicleModelOption {
  id: string
  brand: string
  model: string
}

interface ReportFormDialogProps {
  locationId: string
  vehicleModels: VehicleModelOption[]
}

export function ReportFormDialog({
  locationId,
  vehicleModels,
}: ReportFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(createCompatibilityReport, null)
  const isMobile = useIsMobile()
  const router = useRouter()
  const { motorcycle } = useMotorcycle()
  const prevSuccess = useRef(false)

  // Close dialog + toast on success
  useEffect(() => {
    if (state?.success && !prevSuccess.current) {
      prevSuccess.current = true
      setOpen(false)
      toast.success('ขอบคุณที่ช่วยรายงาน!')
      router.refresh()
    }
    if (state && !state.success) {
      prevSuccess.current = false
    }
  }, [state, router])

  const triggerButton = (
    <Button size="sm">รายงานความเข้ากันได้</Button>
  )

  const formContent = (
    <ReportForm
      formAction={formAction}
      state={state}
      vehicleModels={vehicleModels}
      defaultModelId={motorcycle?.id}
      locationId={locationId}
    />
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={triggerButton} />
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle>รายงานความเข้ากันได้</SheetTitle>
          </SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={triggerButton} />
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>รายงานความเข้ากันได้</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}
