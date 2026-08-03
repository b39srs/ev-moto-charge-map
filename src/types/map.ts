export interface StationMapPin {
  id: string
  name: string
  status: string
  is_free: boolean
  province: string
  avg_rating: number
  review_count: number
  network_id: string | null
  latitude: number
  longitude: number
}
