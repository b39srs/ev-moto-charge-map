import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

interface VehicleModelRow {
  id: string
  brand: string
  model: string
  category: string
  connector_type_id: string | null
}

export interface VehicleModelDetail {
  id: string
  brand: string
  model: string
  connector_type_id: string | null
  connector_type: { display_name: string } | null
}

export const getVehicleModelById = cache(
  async (id: string): Promise<VehicleModelDetail | null> => {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('vehicle_models') as any)
      .select('id, brand, model, connector_type_id, connector_types(display_name)')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as VehicleModelDetail
  }
)

export async function getVehicleModels(): Promise<VehicleModelRow[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('vehicle_models') as any)
    .select('id, brand, model, category, connector_type_id')
    .eq('is_active', true)
    .order('brand')
    .order('model')

  if (error) {
    console.error('Error fetching vehicle models:', error)
    return []
  }

  return (data ?? []) as VehicleModelRow[]
}

interface UserMotorcycleRow {
  id: string
  brand: string
  model: string
}

export async function getUserMotorcycle(
  userId: string
): Promise<UserMotorcycleRow | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase.from('profiles') as any)
    .select('ev_model_id')
    .eq('id', userId)
    .single()

  if (error || !data?.ev_model_id) return null

  const { data: model, error: modelError } = await (supabase.from('vehicle_models') as any)
    .select('id, brand, model')
    .eq('id', data.ev_model_id)
    .single()

  if (modelError || !model) return null

  return model as UserMotorcycleRow
}
