'use client'

import { useState, useCallback } from 'react'
import { Map, AdvancedMarker, type MapMouseEvent } from '@vis.gl/react-google-maps'
import { MapPin } from 'lucide-react'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/constants'

interface LocationPickerProps {
  latitude?: number
  longitude?: number
  onLocationChange: (lat: number, lng: number) => void
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number
    lng: number
  } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  )

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      const latLng = e.detail.latLng
      if (latLng) {
        setMarkerPosition({ lat: latLng.lat, lng: latLng.lng })
        onLocationChange(latLng.lat, latLng.lng)
      }
    },
    [onLocationChange]
  )

  return (
    <div className="space-y-2">
      <div className="h-[300px] w-full overflow-hidden rounded-lg border">
        <Map
          defaultCenter={markerPosition ?? DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          mapId="ev-moto-location-picker"
          onClick={handleMapClick}
          className="h-full w-full"
          gestureHandling="greedy"
        >
          {markerPosition && (
            <AdvancedMarker position={markerPosition}>
              <MapPin className="h-8 w-8 fill-red-500 text-red-500" />
            </AdvancedMarker>
          )}
        </Map>
      </div>
      <p className="text-xs text-muted-foreground">
        คลิกบนแผนที่เพื่อเลือกตำแหน่ง หรือกรอกพิกัดด้านล่าง
      </p>
    </div>
  )
}
