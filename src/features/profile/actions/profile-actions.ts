'use server'

import { createClient } from '@/lib/supabase/server'
import { updateProfileSchema } from '@/lib/validations/station'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/actions'

export async function updateProfile(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'กรุณาเข้าสู่ระบบ' }

  const raw = {
    full_name: formData.get('full_name') as string,
    bio: (formData.get('bio') as string) || undefined,
    ev_model_id: (formData.get('ev_model_id') as string) || undefined,
  }

  const parsed = updateProfileSchema.safeParse(raw)
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
  const { error } = await (supabase.from('profiles') as any)
    .update({
      full_name: v.full_name,
      bio: v.bio || null,
      ev_model_id: v.ev_model_id || null,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' }
  }

  revalidatePath('/', 'layout')
  return { success: true, message: 'อัปเดตโปรไฟล์สำเร็จ' }
}
