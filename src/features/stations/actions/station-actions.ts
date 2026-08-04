'use server'

import { createClient } from '@/lib/supabase/server'
import { createStationSchema } from '@/lib/validations/station'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionResult } from '@/types/actions'

export async function createStation(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'กรุณาเข้าสู่ระบบ' }

  const raw = {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    province: formData.get('province') as string,
    district: (formData.get('district') as string) || undefined,
    subdistrict: (formData.get('subdistrict') as string) || undefined,
    postal_code: (formData.get('postal_code') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    operating_hours: (formData.get('operating_hours') as string) || undefined,
    contact_phone: (formData.get('contact_phone') as string) || undefined,
    website_url: (formData.get('website_url') as string) || undefined,
    is_free: formData.get('is_free') === 'true',
    price_description:
      (formData.get('price_description') as string) || undefined,
    latitude: parseFloat(formData.get('latitude') as string),
    longitude: parseFloat(formData.get('longitude') as string),
    connector_type_ids: formData.getAll('connector_type_ids') as string[],
    amenity_ids: formData.getAll('amenity_ids') as string[],
  }

  const parsed = createStationSchema.safeParse(raw)
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

  // Insert charging location with PostGIS point
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: location, error: locationError } = await (supabase
    .from('charging_locations') as any)
    .insert({
      name: v.name,
      address: v.address,
      province: v.province,
      district: v.district ?? null,
      subdistrict: v.subdistrict ?? null,
      postal_code: v.postal_code ?? null,
      description: v.description ?? null,
      operating_hours: v.operating_hours ?? null,
      contact_phone: v.contact_phone ?? null,
      website_url: v.website_url ?? null,
      is_free: v.is_free,
      price_description: v.price_description ?? null,
      location: `SRID=4326;POINT(${v.longitude} ${v.latitude})` as unknown as string,
      added_by: user.id,
      source: 'community' as const,
      status: 'pending_verification' as const,
    })
    .select('id')
    .single()

  if (locationError || !location) {
    console.error('Error creating station:', locationError)
    return { success: false, message: 'เกิดข้อผิดพลาดในการสร้างสถานี' }
  }

  const locationId = location.id

  // Insert location connectors
  if (v.connector_type_ids.length > 0) {
    const connectors = v.connector_type_ids.map((ctId) => ({
      location_id: locationId,
      connector_type_id: ctId,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('location_connectors') as any).insert(connectors)
  }

  // Insert location amenities
  if (v.amenity_ids && v.amenity_ids.length > 0) {
    const amenities = v.amenity_ids.map((aId) => ({
      location_id: locationId,
      amenity_id: aId,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('location_amenities') as any).insert(amenities)
  }

  // Insert photos
  const photoPaths = formData.getAll('photo_paths') as string[]
  const photoUrls = formData.getAll('photo_urls') as string[]
  if (photoPaths.length > 0) {
    const photos = photoPaths.map((path, i) => ({
      location_id: locationId,
      user_id: user.id,
      storage_path: path,
      url: photoUrls[i] ?? '',
      is_primary: i === 0,
      category: 'station' as const,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('photos') as any).insert(photos)
  }

  revalidatePath('/stations')
  redirect(`/stations/${locationId}`)
}

export async function updateStation(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'กรุณาเข้าสู่ระบบ' }

  const stationId = formData.get('station_id') as string
  if (!stationId) return { success: false, message: 'ไม่พบสถานี' }

  // Fetch current data for edit history
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('charging_locations') as any)
    .select('name, address, province, district, subdistrict, postal_code, description, operating_hours, contact_phone, website_url, is_free, price_description')
    .eq('id', stationId)
    .single()

  if (!existing) {
    return { success: false, message: 'ไม่พบสถานี' }
  }

  const raw = {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    province: formData.get('province') as string,
    district: (formData.get('district') as string) || undefined,
    subdistrict: (formData.get('subdistrict') as string) || undefined,
    postal_code: (formData.get('postal_code') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    operating_hours: (formData.get('operating_hours') as string) || undefined,
    contact_phone: (formData.get('contact_phone') as string) || undefined,
    website_url: (formData.get('website_url') as string) || undefined,
    is_free: formData.get('is_free') === 'true',
    price_description:
      (formData.get('price_description') as string) || undefined,
    latitude: parseFloat(formData.get('latitude') as string),
    longitude: parseFloat(formData.get('longitude') as string),
    connector_type_ids: formData.getAll('connector_type_ids') as string[],
    amenity_ids: formData.getAll('amenity_ids') as string[],
  }

  const parsed = createStationSchema.safeParse(raw)
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

  // Build changes object for edit history
  const newValues: Record<string, string | null> = {
    name: v.name,
    address: v.address,
    province: v.province,
    district: v.district ?? null,
    subdistrict: v.subdistrict ?? null,
    postal_code: v.postal_code ?? null,
    description: v.description ?? null,
    operating_hours: v.operating_hours ?? null,
    contact_phone: v.contact_phone ?? null,
    website_url: v.website_url ?? null,
    is_free: String(v.is_free),
    price_description: v.price_description ?? null,
  }
  const changes: Record<string, { old: string | null; new: string | null }> = {}
  for (const [key, newVal] of Object.entries(newValues)) {
    const oldVal = existing[key] != null ? String(existing[key]) : null
    if (oldVal !== newVal) {
      changes[key] = { old: oldVal, new: newVal }
    }
  }

  // Update charging location
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase.from('charging_locations') as any)
    .update({
      name: v.name,
      address: v.address,
      province: v.province,
      district: v.district ?? null,
      subdistrict: v.subdistrict ?? null,
      postal_code: v.postal_code ?? null,
      description: v.description ?? null,
      operating_hours: v.operating_hours ?? null,
      contact_phone: v.contact_phone ?? null,
      website_url: v.website_url ?? null,
      is_free: v.is_free,
      price_description: v.price_description ?? null,
      location: `SRID=4326;POINT(${v.longitude} ${v.latitude})` as unknown as string,
      last_edited_by: user.id,
      last_edited_at: new Date().toISOString(),
    })
    .eq('id', stationId)

  if (updateError) {
    console.error('Error updating station:', updateError)
    return { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตสถานี' }
  }

  // Record edit history (only if something changed)
  if (Object.keys(changes).length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('station_edit_history') as any).insert({
      location_id: stationId,
      editor_id: user.id,
      changes,
    })
  }

  // Replace connectors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('location_connectors') as any)
    .delete()
    .eq('location_id', stationId)

  if (v.connector_type_ids.length > 0) {
    const connectors = v.connector_type_ids.map((ctId) => ({
      location_id: stationId,
      connector_type_id: ctId,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('location_connectors') as any).insert(connectors)
  }

  // Replace amenities
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('location_amenities') as any)
    .delete()
    .eq('location_id', stationId)

  if (v.amenity_ids && v.amenity_ids.length > 0) {
    const amenities = v.amenity_ids.map((aId) => ({
      location_id: stationId,
      amenity_id: aId,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('location_amenities') as any).insert(amenities)
  }

  // Insert new photos (keep existing)
  const photoPaths = formData.getAll('photo_paths') as string[]
  const photoUrls = formData.getAll('photo_urls') as string[]
  if (photoPaths.length > 0) {
    const photos = photoPaths.map((path, i) => ({
      location_id: stationId,
      user_id: user.id,
      storage_path: path,
      url: photoUrls[i] ?? '',
      is_primary: false,
      category: 'station' as const,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('photos') as any).insert(photos)
  }

  revalidatePath('/stations')
  revalidatePath(`/stations/${stationId}`)
  redirect(`/stations/${stationId}`)
}
