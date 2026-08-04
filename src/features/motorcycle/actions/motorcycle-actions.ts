'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/actions'
import { suggestVehicleSchema } from '@/lib/validations/vehicle-model'

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

export type SuggestVehicleResult = ActionResult & { modelId?: string }

export async function suggestVehicleModel(
  _prevState: SuggestVehicleResult | null,
  formData: FormData
): Promise<SuggestVehicleResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ' }
  }

  const raw = {
    brand: (formData.get('brand') as string)?.trim() ?? '',
    model: (formData.get('model') as string)?.trim() ?? '',
  }

  const parsed = suggestVehicleSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0])
      errors[key] = errors[key] ?? []
      errors[key].push(issue.message)
    }
    return { success: false, message: 'กรุณาตรวจสอบข้อมูล', errors }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('vehicle_models') as any)
    .insert({
      brand: parsed.data.brand,
      model: parsed.data.model,
      added_by: user.id,
      is_active: false,
    })
    .select('id')
    .single()

  if (error) {
    // Unique constraint violation → model already exists
    if (error.code === '23505') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase.from('vehicle_models') as any)
        .select('id')
        .eq('brand', parsed.data.brand)
        .eq('model', parsed.data.model)
        .single()

      if (existing) {
        return {
          success: true,
          message: 'รุ่นนี้มีอยู่แล้ว',
          modelId: existing.id,
        }
      }
    }
    console.error('Error suggesting vehicle model:', error)
    return { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }
  }

  return {
    success: true,
    message: 'ส่งคำขอเพิ่มรุ่นรถแล้ว รอแอดมินอนุมัติ',
    modelId: data.id,
  }
}
