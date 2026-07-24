'use client'

import { AdvancedMarker } from '@vis.gl/react-google-maps'
import { Zap } from 'lucide-react'
import type { StationMapPin } from '@/types/map'

interface StationMarkerProps {
  station: StationMapPin
  onClick: (station: StationMapPin) => void
}

export function StationMarker({ station, onClick }: StationMarkerProps) {
  return (
    <AdvancedMarker
      position={{ lat: station.latitude, lng: station.longitude }}
      onClick={() => onClick(station)}
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
