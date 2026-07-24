'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/features/profile/actions/profile-actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/form/form-field'
import { SubmitButton } from '@/components/form/submit-button'
import { toast } from 'sonner'
import { useEffect, useRef } from 'react'

interface EditProfileFormProps {
  profile: {
    full_name: string | null
    bio: string | null
    ev_model_id: string | null
  }
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const [state, formAction] = useActionState(updateProfile, null)
  const prevState = useRef(state)

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

      {state && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <SubmitButton>บันทึก</SubmitButton>
    </form>
  )
}
