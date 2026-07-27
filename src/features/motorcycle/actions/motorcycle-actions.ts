'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/actions'

export async function setUserMotorcycle(
  modelId: string | null
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ' }
  }

  const { error } = await (supabase.from('profiles') as any)
    .update({ ev_model_id: modelId })
    .eq('id', user.id)

  if (error) {
    console.error('Error setting motorcycle:', error)
    return { success: false, message: 'เกิดข้อผิดพลาด' }
  }

  revalidatePath('/', 'layout')
  return { success: true, message: 'บันทึกมอเตอร์ไซค์สำเร็จ' }
}
