'use server'

import { createClient } from '@/lib/supabase/server'
import { createReviewSchema } from '@/lib/validations/station'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/actions'

export async function createReview(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'กรุณาเข้าสู่ระบบ' }

  const raw = {
    location_id: formData.get('location_id') as string,
    rating: parseInt(formData.get('rating') as string, 10),
    comment: (formData.get('comment') as string) || undefined,
    visit_date: (formData.get('visit_date') as string) || undefined,
  }

  const parsed = createReviewSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.')
      errors[key] = errors[key] ?? []
      errors[key].push(issue.message)
    }
    return { success: false, message: 'กรุณาตรวจสอบข้อมูล', errors }
  }

  const v = parsed.data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reviews') as any).insert({
    location_id: v.location_id,
    user_id: user.id,
    rating: v.rating,
    comment: v.comment ?? null,
    visit_date: v.visit_date ?? null,
  })

  if (error) {
    if (error.code === '23505') {
      return { success: false, message: 'คุณได้รีวิวสถานีนี้แล้ว' }
    }
    console.error('Error creating review:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการสร้างรีวิว' }
  }

  revalidatePath(`/stations/${v.location_id}`)
  return { success: true, message: 'เพิ่มรีวิวสำเร็จ' }
}

export async function updateReview(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'กรุณาเข้าสู่ระบบ' }

  const reviewId = formData.get('review_id') as string
  const locationId = formData.get('location_id') as string
  const rating = parseInt(formData.get('rating') as string, 10)
  const comment = (formData.get('comment') as string) || null
  const visitDate = (formData.get('visit_date') as string) || null

  if (!rating || rating < 1 || rating > 5) {
    return { success: false, message: 'กรุณาให้คะแนน 1-5' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reviews') as any)
    .update({
      rating,
      comment,
      visit_date: visitDate,
      is_edited: true,
    })
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating review:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขรีวิว' }
  }

  revalidatePath(`/stations/${locationId}`)
  return { success: true, message: 'แก้ไขรีวิวสำเร็จ' }
}

export async function deleteReview(
  reviewId: string,
  locationId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'กรุณาเข้าสู่ระบบ' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('reviews') as any)
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting review:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการลบรีวิว' }
  }

  revalidatePath(`/stations/${locationId}`)
  return { success: true, message: 'ลบรีวิวสำเร็จ' }
}
