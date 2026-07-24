'use client'

import { useEffect, useCallback } from 'react'
import { AdvancedMarker, useAdvancedMarkerRef } from '@vis.gl/react-google-maps'
import { Zap } from 'lucide-react'
import type { StationMapPin } from '@/types/map'

interface ClusteredStationMarkerProps {
  station: StationMapPin
  onMarkerRef: (
    stationId: string,
    marker: google.maps.marker.AdvancedMarkerElement | null
  ) => void
  onClick: (station: StationMapPin) => void
}

export function ClusteredStationMarker({
  station,
  onMarkerRef,
  onClick,
}: ClusteredStationMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef()

  useEffect(() => {
    onMarkerRef(station.id, marker)
    return () => onMarkerRef(station.id, null)
  }, [station.id, marker, onMarkerRef])

  const handleClick = useCallback(() => onClick(station), [station, onClick])

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{ lat: station.latitude, lng: station.longitude }}
      onClick={handleClick}
      title={station.name}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-md ${
          station.is_free ? 'bg-green-500' : 'bg-blue-500'
        }`}
      >
        <Zap className="h-4 w-4 text-white" />
      </div>
    </AdvancedMarker>
  )
}
