import type { Database } from './database'

type Enums = Database['public']['Enums']

export type UserRole = Enums['user_role']
export type VehicleCategory = Enums['vehicle_category']
export type LocationStatus = Enums['location_status']
export type LocationSource = Enums['location_source']
export type CompatibilityStatus = Enums['compatibility_status']
export type ChargeResult = Enums['charge_result']
export type PhotoCategory = Enums['photo_category']
export type VerificationAction = Enums['verification_action']
export type SuggestionStatus = Enums['suggestion_status']
