'use client'

import { useActionState, useState } from 'react'
import { createReview } from '@/features/reviews/actions/review-actions'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { StarRating } from '@/components/ui/star-rating'
import { FormField } from '@/components/form/form-field'
import { SubmitButton } from '@/components/form/submit-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ReviewFormProps {
  locationId: string
}

export function ReviewForm({ locationId }: ReviewFormProps) {
  const [state, formAction] = useActionState(createReview, null)
  const [rating, setRating] = useState(0)

  if (state?.success) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-green-600 font-medium">{state.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>เขียนรีวิว</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="location_id" value={locationId} />
          <input type="hidden" name="rating" value={rating} />

          <FormField
            label="คะแนน"
            required
            error={state?.errors?.rating?.[0]}
          >
            <StarRating value={rating} onChange={setRating} />
          </FormField>

          <FormField label="ความคิดเห็น">
            <Textarea
              name="comment"
              placeholder="แชร์ประสบการณ์การใช้สถานีชาร์จนี้..."
              rows={3}
            />
          </FormField>

          <FormField label="วันที่ไปใช้บริการ">
            <Input name="visit_date" type="date" />
          </FormField>

          {state && !state.success && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <SubmitButton className="w-full">ส่งรีวิว</SubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}
