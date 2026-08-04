export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: Database['public']['Enums']['user_role']
          bio: string | null
          ev_model_id: string | null
          reputation_score: number
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          bio?: string | null
          ev_model_id?: string | null
          reputation_score?: number
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          bio?: string | null
          ev_model_id?: string | null
          reputation_score?: number
          is_verified?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          id: string
          brand: string
          model: string
          category: Database['public']['Enums']['vehicle_category']
          year_start: number | null
          year_end: number | null
          battery_kwh: number | null
          connector_type_id: string | null
          max_charge_kw: number | null
          range_km: number | null
          image_url: string | null
          is_active: boolean
          added_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand: string
          model: string
          category?: Database['public']['Enums']['vehicle_category']
          year_start?: number | null
          year_end?: number | null
          battery_kwh?: number | null
          connector_type_id?: string | null
          max_charge_kw?: number | null
          range_km?: number | null
          image_url?: string | null
          is_active?: boolean
          added_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          brand?: string
          model?: string
          category?: Database['public']['Enums']['vehicle_category']
          year_start?: number | null
          year_end?: number | null
          battery_kwh?: number | null
          connector_type_id?: string | null
          max_charge_kw?: number | null
          range_km?: number | null
          image_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      charging_locations: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string
          province: string
          district: string | null
          subdistrict: string | null
          postal_code: string | null
          location: unknown
          status: Database['public']['Enums']['location_status']
          source: Database['public']['Enums']['location_source']
          is_free: boolean
          price_description: string | null
          operating_hours: string | null
          contact_phone: string | null
          website_url: string | null
          added_by: string
          verified_at: string | null
          verified_by: string | null
          avg_rating: number
          review_count: number
          photo_count: number
          network_id: string | null
          last_edited_by: string | null
          last_edited_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address: string
          province: string
          district?: string | null
          subdistrict?: string | null
          postal_code?: string | null
          location: unknown
          status?: Database['public']['Enums']['location_status']
          source?: Database['public']['Enums']['location_source']
          is_free?: boolean
          price_description?: string | null
          operating_hours?: string | null
          contact_phone?: string | null
          website_url?: string | null
          added_by: string
          verified_at?: string | null
          verified_by?: string | null
          avg_rating?: number
          review_count?: number
          photo_count?: number
          network_id?: string | null
          last_edited_by?: string | null
          last_edited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          address?: string
          province?: string
          district?: string | null
          subdistrict?: string | null
          postal_code?: string | null
          location?: unknown
          status?: Database['public']['Enums']['location_status']
          source?: Database['public']['Enums']['location_source']
          is_free?: boolean
          price_description?: string | null
          operating_hours?: string | null
          contact_phone?: string | null
          website_url?: string | null
          verified_at?: string | null
          verified_by?: string | null
          avg_rating?: number
          review_count?: number
          photo_count?: number
          network_id?: string | null
          last_edited_by?: string | null
          last_edited_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      networks: {
        Row: {
          id: string
          name: string
          display_name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          created_at?: string
        }
        Update: {
          name?: string
          display_name?: string
        }
        Relationships: []
      }
      connector_types: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          icon_url: string | null
          power_type: string
          is_common_for_motorcycle: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          icon_url?: string | null
          power_type: string
          is_common_for_motorcycle?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          display_name?: string
          description?: string | null
          icon_url?: string | null
          power_type?: string
          is_common_for_motorcycle?: boolean
        }
        Relationships: []
      }
      location_connectors: {
        Row: {
          id: string
          location_id: string
          connector_type_id: string
          quantity: number
          power_kw: number | null
          price_per_kwh: number | null
          price_per_minute: number | null
          is_available: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location_id: string
          connector_type_id: string
          quantity?: number
          power_kw?: number | null
          price_per_kwh?: number | null
          price_per_minute?: number | null
          is_available?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          location_id?: string
          connector_type_id?: string
          quantity?: number
          power_kw?: number | null
          price_per_kwh?: number | null
          price_per_minute?: number | null
          is_available?: boolean
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      compatibility_reports: {
        Row: {
          id: string
          user_id: string
          location_id: string
          vehicle_model_id: string
          connector_id: string | null
          outcome: Database['public']['Enums']['report_outcome']
          reason: Database['public']['Enums']['report_reason'] | null
          charging_speed_kw: number | null
          charge_duration_min: number | null
          battery_before_pct: number | null
          battery_after_pct: number | null
          adapter_used: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location_id: string
          vehicle_model_id: string
          connector_id?: string | null
          outcome: Database['public']['Enums']['report_outcome']
          reason?: Database['public']['Enums']['report_reason'] | null
          charging_speed_kw?: number | null
          charge_duration_min?: number | null
          battery_before_pct?: number | null
          battery_after_pct?: number | null
          adapter_used?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          outcome?: Database['public']['Enums']['report_outcome']
          reason?: Database['public']['Enums']['report_reason'] | null
          charging_speed_kw?: number | null
          charge_duration_min?: number | null
          battery_before_pct?: number | null
          battery_after_pct?: number | null
          adapter_used?: boolean
          notes?: string | null
        }
        Relationships: []
      }
      compatibility_summaries: {
        Row: {
          vehicle_model_id: string
          location_id: string
          total_reports: number
          success_count: number
          failed_count: number
          unique_reporters: number
          verification_level: number
          last_report_at: string | null
          last_success_at: string | null
          updated_at: string
        }
        Insert: {
          vehicle_model_id: string
          location_id: string
          total_reports?: number
          success_count?: number
          failed_count?: number
          unique_reporters?: number
          verification_level?: number
          last_report_at?: string | null
          last_success_at?: string | null
          updated_at?: string
        }
        Update: {
          total_reports?: number
          success_count?: number
          failed_count?: number
          unique_reporters?: number
          verification_level?: number
          last_report_at?: string | null
          last_success_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          location_id: string
          user_id: string
          rating: number
          comment: string | null
          visit_date: string | null
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location_id: string
          user_id: string
          rating: number
          comment?: string | null
          visit_date?: string | null
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          rating?: number
          comment?: string | null
          visit_date?: string | null
          is_edited?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          id: string
          location_id: string
          user_id: string
          storage_path: string
          url: string
          caption: string | null
          category: Database['public']['Enums']['photo_category']
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          user_id: string
          storage_path: string
          url: string
          caption?: string | null
          category?: Database['public']['Enums']['photo_category']
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          storage_path?: string
          url?: string
          caption?: string | null
          category?: Database['public']['Enums']['photo_category']
          is_primary?: boolean
        }
        Relationships: []
      }
      amenities: {
        Row: {
          id: string
          name: string
          display_name: string
          icon: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          icon: string
          category?: string
          created_at?: string
        }
        Update: {
          name?: string
          display_name?: string
          icon?: string
          category?: string
        }
        Relationships: []
      }
      location_amenities: {
        Row: {
          location_id: string
          amenity_id: string
        }
        Insert: {
          location_id: string
          amenity_id: string
        }
        Update: {
          location_id?: string
          amenity_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          location_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          location_id?: string
        }
        Relationships: []
      }
      verification_logs: {
        Row: {
          id: string
          location_id: string
          moderator_id: string
          action: Database['public']['Enums']['verification_action']
          reason: string | null
          previous_status: Database['public']['Enums']['location_status'] | null
          new_status: Database['public']['Enums']['location_status'] | null
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          moderator_id: string
          action: Database['public']['Enums']['verification_action']
          reason?: string | null
          previous_status?: Database['public']['Enums']['location_status'] | null
          new_status?: Database['public']['Enums']['location_status'] | null
          created_at?: string
        }
        Update: {
          action?: Database['public']['Enums']['verification_action']
          reason?: string | null
          previous_status?: Database['public']['Enums']['location_status'] | null
          new_status?: Database['public']['Enums']['location_status'] | null
        }
        Relationships: []
      }
      edit_suggestions: {
        Row: {
          id: string
          location_id: string
          user_id: string
          field_name: string
          current_value: string | null
          suggested_value: string
          reason: string | null
          status: Database['public']['Enums']['suggestion_status']
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          user_id: string
          field_name: string
          current_value?: string | null
          suggested_value: string
          reason?: string | null
          status?: Database['public']['Enums']['suggestion_status']
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          field_name?: string
          current_value?: string | null
          suggested_value?: string
          reason?: string | null
          status?: Database['public']['Enums']['suggestion_status']
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Relationships: []
      }
      station_edit_history: {
        Row: {
          id: string
          location_id: string
          editor_id: string
          changes: Record<string, { old: string | null; new: string | null }>
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          editor_id: string
          changes: Record<string, { old: string | null; new: string | null }>
          created_at?: string
        }
        Update: {
          changes?: Record<string, { old: string | null; new: string | null }>
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin_or_moderator: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'user' | 'moderator' | 'admin'
      vehicle_category: 'motorcycle' | 'scooter' | 'moped'
      location_status:
        | 'active'
        | 'inactive'
        | 'under_construction'
        | 'permanently_closed'
        | 'pending_verification'
      location_source: 'community' | 'official' | 'imported'
      report_outcome: 'success' | 'failed'
      report_reason:
        | 'incompatible_connector'
        | 'station_offline'
        | 'power_limit'
        | 'adapter_required'
        | 'unknown'
        | 'other'
      photo_category:
        | 'station'
        | 'connector'
        | 'environment'
        | 'parking'
        | 'other'
      verification_action: 'verify' | 'reject' | 'flag' | 'unflag'
      suggestion_status: 'pending' | 'approved' | 'rejected'
    }
  }
}
