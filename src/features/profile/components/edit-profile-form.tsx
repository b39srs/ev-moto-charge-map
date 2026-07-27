'use client'

import { useActionState, useState } from 'react'
import { updateProfile } from '@/features/profile/actions/profile-actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/form/form-field'
import { SubmitButton } from '@/components/form/submit-button'
import { MotorcycleAutocomplete } from '@/features/motorcycle/components/motorcycle-autocomplete'
import { toast } from 'sonner'
import { useEffect, useRef } from 'react'

interface VehicleModelOption {
  id: string
  brand: string
  model: string
}

interface EditProfileFormProps {
  profile: {
    full_name: string | null
    bio: string | null
    ev_model_id: string | null
  }
  vehicleModels: VehicleModelOption[]
}

export function EditProfileForm({ profile, vehicleModels }: EditProfileFormProps) {
  const [state, formAction] = useActionState(updateProfile, null)
  const prevState = useRef(state)
  const [selectedModelId, setSelectedModelId] = useState(
    profile.ev_model_id ?? ''
  )

  useEffect(() => {
    if (state && state !== prevState.current) {
      if (state.success) {
        toast.success(state.message)
      }
      prevState.current = state
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-4">
      <FormField
        label="ชื่อ-นามสกุล"
        required
        error={state?.errors?.full_name?.[0]}
      >
        <Input
          name="full_name"
          defaultValue={profile.full_name ?? ''}
          required
        />
      </FormField>

      <FormField label="แนะนำตัว" error={state?.errors?.bio?.[0]}>
        <Textarea
          name="bio"
          defaultValue={profile.bio ?? ''}
          placeholder="บอกเล่าเกี่ยวกับตัวคุณ..."
          rows={3}
        />
      </FormField>

      <FormField
        label="มอเตอร์ไซค์ของฉัน"
        error={state?.errors?.ev_model_id?.[0]}
      >
        <input type="hidden" name="ev_model_id" value={selectedModelId} />
        <MotorcycleAutocomplete
          models={vehicleModels}
          value={selectedModelId}
          onValueChange={setSelectedModelId}
          className="w-full"
        />
      </FormField>

      {state && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <SubmitButton>บันทึก</SubmitButton>
    </form>
  )
}
