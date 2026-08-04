import type { Database } from './database'

type Tables = Database['public']['Tables']

export type Profile = Tables['profiles']['Row']
export type ProfileInsert = Tables['profiles']['Insert']
export type ProfileUpdate = Tables['profiles']['Update']

export type VehicleModel = Tables['vehicle_models']['Row']
export type VehicleModelInsert = Tables['vehicle_models']['Insert']

export type ChargingLocation = Tables['charging_locations']['Row']
export type ChargingLocationInsert = Tables['charging_locations']['Insert']
export type ChargingLocationUpdate = Tables['charging_locations']['Update']

export type Network = Tables['networks']['Row']

export type ConnectorType = Tables['connector_types']['Row']

export type LocationConnector = Tables['location_connectors']['Row']
export type LocationConnectorInsert = Tables['location_connectors']['Insert']

export type CompatibilityReport = Tables['compatibility_reports']['Row']
export type CompatibilityReportInsert = Tables['compatibility_reports']['Insert']

export type CompatibilitySummary = Tables['compatibility_summaries']['Row']
export type CompatibilitySummaryInsert = Tables['compatibility_summaries']['Insert']
export type CompatibilitySummaryUpdate = Tables['compatibility_summaries']['Update']

export type Review = Tables['reviews']['Row']
export type ReviewInsert = Tables['reviews']['Insert']
export type ReviewUpdate = Tables['reviews']['Update']

export type Photo = Tables['photos']['Row']
export type PhotoInsert = Tables['photos']['Insert']

export type Amenity = Tables['amenities']['Row']

export type Favorite = Tables['favorites']['Row']

export type VerificationLog = Tables['verification_logs']['Row']

export type EditSuggestion = Tables['edit_suggestions']['Row']
export type EditSuggestionInsert = Tables['edit_suggestions']['Insert']

export type StationEditHistory = Tables['station_edit_history']['Row']

// Extended types with joins
export type ChargingLocationWithDetails = ChargingLocation & {
  location_connectors: (LocationConnector & {
    connector_types: ConnectorType
  })[]
  photos: Photo[]
  amenities: Amenity[]
}
