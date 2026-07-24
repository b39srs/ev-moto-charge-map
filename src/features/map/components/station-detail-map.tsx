'use client'

import { Map, AdvancedMarker } from '@vis.gl/react-google-maps'

interface StationDetailMapProps {
  latitude: number
  longitude: number
  name: string
}

export function StationDetailMap({
  latitude,
  longitude,
  name,
}: StationDetailMapProps) {
  const position = { lat: latitude, lng: longitude }

  return (
    <div className="h-[200px] w-full overflow-hidden rounded-lg">
      <Map
        center={position}
        zoom={15}
        mapId="ev-moto-station-detail"
        disableDefaultUI
        zoomControl
        clickableIcons={false}
        className="h-full w-full"
      >
        <AdvancedMarker position={position} title={name} />
      </Map>
    </div>
  )
}
