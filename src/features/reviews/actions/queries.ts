import { createClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getReviewsByLocation(locationId: string): Promise<any[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('location_id', locationId)
    .order('created_at', { ascending: false })
  return data ?? []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUserReviews(userId: string): Promise<any[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('*, charging_locations(id, name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}
