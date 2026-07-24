'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/actions'

export async function toggleFavorite(
  locationId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'กรุณาเข้าสู่ระบบ' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('favorites') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('location_id', locationId)
    .maybeSingle()

  if (existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('favorites') as any).delete().eq('id', existing.id)
    revalidatePath(`/stations/${locationId}`)
    return { success: true, message: 'ลบออกจากรายการโปรดแล้ว' }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('favorites') as any).insert({
      user_id: user.id,
      location_id: locationId,
    })
    revalidatePath(`/stations/${locationId}`)
    return { success: true, message: 'เพิ่มในรายการโปรดแล้ว' }
  }
}
