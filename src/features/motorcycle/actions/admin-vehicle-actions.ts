'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/actions'

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase: null, error: 'กรุณาเข้าสู่ระบบ' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'moderator'].includes(profile.role)) {
    return { supabase: null, error: 'ไม่มีสิทธิ์เข้าถึง' }
  }

  return { supabase, error: null }
}

export async function approveVehicleModel(id: string): Promise<ActionResult> {
  const { supabase, error } = await assertAdmin()
  if (!supabase) return { success: false, message: error! }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbError } = await (supabase.from('vehicle_models') as any)
    .update({ is_active: true })
    .eq('id', id)

  if (dbError) {
    console.error('Error approving vehicle model:', dbError)
    return { success: false, message: 'เกิดข้อผิดพลาด' }
  }

  revalidatePath('/admin/vehicles')
  revalidatePath('/', 'layout')
  return { success: true, message: 'อนุมัติแล้ว' }
}

export async function rejectVehicleModel(id: string): Promise<ActionResult> {
  const { supabase, error } = await assertAdmin()
  if (!supabase) return { success: false, message: error! }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbError } = await (supabase.from('vehicle_models') as any)
    .delete()
    .eq('id', id)

  if (dbError) {
    console.error('Error rejecting vehicle model:', dbError)
    return { success: false, message: 'เกิดข้อผิดพลาด' }
  }

  revalidatePath('/admin/vehicles')
  return { success: true, message: 'ปฏิเสธแล้ว' }
}

export async function getPendingVehicleModels() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('vehicle_models') as any)
    .select('id, brand, model, category, created_at, added_by, profiles(full_name, email)')
    .eq('is_active', false)
    .not('added_by', 'is', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching pending vehicle models:', error)
    return []
  }

  return (data ?? []) as Array<{
    id: string
    brand: string
    model: string
    category: string
    created_at: string
    added_by: string
    profiles: { full_name: string | null; email: string | null } | null
  }>
}
