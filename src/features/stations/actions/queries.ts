import { createClient } from '@/lib/supabase/server'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import type { ConnectorType, Amenity, ChargingLocation, Network } from '@/types/entities'
import type { StationMapPin } from '@/types/map'
import type { VerificationLevel } from '@/features/compatibility/types'

export async function getConnectorTypes(): Promise<ConnectorType[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('connector_types')
    .select('*')
    .order('is_common_for_motorcycle', { ascending: false })
    .order('name')
  return (data ?? []) as ConnectorType[]
}

export async function getAmenities(): Promise<Amenity[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('amenities')
    .select('*')
    .order('category')
    .order('name')
  return (data ?? []) as Amenity[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getStationById(id: string): Promise<any | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('charging_locations')
    .select(
      `
      *,
      location_connectors(*, connector_types(*)),
      photos(*),
      location_amenities(amenity_id, amenities(*)),
      profiles!charging_locations_added_by_fkey(full_name, avatar_url)
    `
    )
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export interface StationListItem extends ChargingLocation {
  location_connectors?: {
    connector_type_id: string
    connector_types: { display_name: string } | null
  }[]
  photos?: { url: string; is_primary: boolean }[]
}

export async function getStations(params: {
  search?: string
  province?: string
  connectorType?: string
  isFree?: boolean
  sort?: 'newest' | 'rating'
  page?: number
}): Promise<{ stations: StationListItem[]; totalCount: number }> {
  const supabase = await createClient()
  const page = params.page ?? 1
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let query = supabase
    .from('charging_locations')
    .select(
      `
      *,
      location_connectors(connector_type_id, connector_types(display_name)),
      photos(url, is_primary)
    `,
      { count: 'exact' }
    )

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  if (params.province) {
    query = query.eq('province', params.province)
  }

  if (params.isFree) {
    query = query.eq('is_free', true)
  }

  if (params.sort === 'rating') {
    query = query.order('avg_rating', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching stations:', error)
    return { stations: [], totalCount: 0 }
  }

  let stations = (data ?? []) as unknown as StationListItem[]

  // Filter by connector type client-side
  if (params.connectorType) {
    stations = stations.filter((s) =>
      s.location_connectors?.some(
        (lc) => lc.connector_type_id === params.connectorType
      )
    )
  }

  return { stations, totalCount: count ?? 0 }
}

export async function getUserStations(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('charging_locations')
    .select('id, name, province, status, avg_rating, review_count, created_at')
    .eq('added_by', userId)
    .order('created_at', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []) as any[]
}

export async function getStationsForMap(): Promise<StationMapPin[]> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('station_map_pins') as any)
    .select('*')

  if (error) {
    console.error('Error fetching map pins:', error)
    return []
  }
  return (data ?? []) as StationMapPin[]
}

export async function getStationCoordinates(
  stationId: string
): Promise<{ latitude: number; longitude: number } | null> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_station_coordinates', {
    station_id: stationId,
  })

  if (error || !data || data.length === 0) return null
  return data[0] as { latitude: number; longitude: number }
}

export async function getHomeStats() {
  const supabase = await createClient()
  const [stations, users, reviews, reports] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('charging_locations') as any).select('*', { count: 'exact', head: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('profiles') as any).select('*', { count: 'exact', head: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('reviews') as any).select('*', { count: 'exact', head: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('compatibility_reports') as any).select('*', { count: 'exact', head: true }),
  ])
  return {
    stationCount: stations.count ?? 0,
    userCount: users.count ?? 0,
    reviewCount: reviews.count ?? 0,
    reportCount: reports.count ?? 0,
  }
}

export async function getFavoriteStations(userId: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('favorites') as any)
    .select(`
      id,
      created_at,
      charging_locations(id, name, province, status, avg_rating, review_count, is_free)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []) as any[]
}

export async function getStationForEdit(stationId: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('charging_locations')
    .select(`
      *,
      location_connectors(connector_type_id),
      location_amenities(amenity_id),
      photos(id, url, storage_path, caption, is_primary)
    `)
    .eq('id', stationId)
    .eq('added_by', userId)
    .single()

  if (error || !data) return null
  return data
}

export async function checkFavorite(userId: string, locationId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('location_id', locationId)
    .maybeSingle()
  return !!data
}

// --- Compatible stations (vehicle filter) ---

export async function getCompatibleStations(params: {
  connectorTypeId: string
  search?: string
  province?: string
  isFree?: boolean
  sort?: 'newest' | 'rating'
  page?: number
}): Promise<{ stations: StationListItem[]; totalCount: number }> {
  const supabase = await createClient()
  const page = params.page ?? 1
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('charging_locations') as any).select(
    `
    *,
    location_connectors!inner(connector_type_id, connector_types(display_name)),
    photos(url, is_primary)
  `,
    { count: 'exact' }
  )

  // !inner join + eq filters to only stations with matching connector
  query = query.eq('location_connectors.connector_type_id', params.connectorTypeId)

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  if (params.province) {
    query = query.eq('province', params.province)
  }

  if (params.isFree) {
    query = query.eq('is_free', true)
  }

  if (params.sort === 'rating') {
    query = query.order('avg_rating', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching compatible stations:', error)
    return { stations: [], totalCount: 0 }
  }

  return {
    stations: (data ?? []) as unknown as StationListItem[],
    totalCount: count ?? 0,
  }
}

export interface StationCompatibilityInfo {
  verificationLevel: VerificationLevel
  totalReports: number
  successCount: number
}

export async function getCompatibilitySummariesBatch(
  vehicleModelId: string,
  stationIds: string[]
): Promise<Map<string, StationCompatibilityInfo>> {
  const map = new Map<string, StationCompatibilityInfo>()
  if (stationIds.length === 0) return map

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('compatibility_summaries') as any)
    .select('location_id, verification_level, total_reports, success_count')
    .eq('vehicle_model_id', vehicleModelId)
    .in('location_id', stationIds)

  for (const row of data ?? []) {
    map.set(row.location_id, {
      verificationLevel: row.verification_level as VerificationLevel,
      totalReports: row.total_reports,
      successCount: row.success_count,
    })
  }

  return map
}

export async function getCompatibleLocationIds(
  connectorTypeId: string
): Promise<string[]> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('location_connectors') as any)
    .select('location_id')
    .eq('connector_type_id', connectorTypeId)

  if (!data) return []
  const ids = (data as { location_id: string }[]).map((d) => d.location_id)
  return [...new Set(ids)]
}

// --- Networks ---

export async function getNetworks(): Promise<Network[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('networks')
    .select('*')
    .order('display_name')
  return (data ?? []) as Network[]
}

// --- Location → Connector type mapping (for map filtering) ---

export async function getLocationConnectorMap(): Promise<
  Record<string, string[]>
> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('location_connectors') as any)
    .select('location_id, connector_type_id')

  const map: Record<string, string[]> = {}
  for (const row of (data ?? []) as { location_id: string; connector_type_id: string }[]) {
    if (!map[row.location_id]) map[row.location_id] = []
    map[row.location_id].push(row.connector_type_id)
  }
  return map
}
