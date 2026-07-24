'use client'

import { useState, useCallback, useMemo } from 'react'
import { Map, MapControl, ControlPosition, AdvancedMarker } from '@vis.gl/react-google-maps'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/constants'
import { MapSearch } from './map-search'
import { MapFilters } from './map-filters'
import { GeolocationButton } from './geolocation-button'
import { ClusteredMarkers } from './clustered-markers'
import type { StationMapPin } from '@/types/map'

interface FullMapProps {
  stations: StationMapPin[]
}

export function FullMap({ stations }: FullMapProps) {
  // Filter state
  const [search, setSearch] = useState('')
  const [isFreeOnly, setIsFreeOnly] = useState(false)
  const [province, setProvince] = useState('')

  // Geolocation state
  const [userPosition, setUserPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)

  // Client-side filtering
  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (isFreeOnly && !s.is_free) {
        return false
      }
      if (province && s.province !== province) {
        return false
      }
      return true
    })
  }, [stations, search, isFreeOnly, province])

  const activeFilterCount = (isFreeOnly ? 1 : 0) + (province ? 1 : 0)

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])

  const handlePositionChange = useCallback(
    (position: { lat: number; lng: number }) => {
      setUserPosition(position)
    },
    []
  )

  return (
    <Map
      defaultCenter={DEFAULT_CENTER}
      defaultZoom={DEFAULT_ZOOM}
      mapId="ev-moto-charge-map"
      gestureHandling="greedy"
      disableDefaultUI={false}
      className="h-full w-full"
    >
      {/* Search + Filters */}
      <MapControl position={ControlPosition.TOP_LEFT}>
        <div>
          <MapSearch onSearchChange={handleSearchChange} />
          <MapFilters
            isFreeOnly={isFreeOnly}
            province={province}
            onFreeOnlyChange={setIsFreeOnly}
            onProvinceChange={setProvince}
            activeFilterCount={activeFilterCount}
          />
        </div>
      </MapControl>

      {/* Geolocation */}
      <MapControl position={ControlPosition.RIGHT_BOTTOM}>
        <GeolocationButton onPositionChange={handlePositionChange} />
      </MapControl>

      {/* User position blue dot */}
      {userPosition && (
        <AdvancedMarker position={userPosition} title="ตำแหน่งของคุณ">
          <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-600 shadow-md">
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </AdvancedMarker>
      )}

      {/* Clustered station markers */}
      <ClusteredMarkers stations={filteredStations} />
    </Map>
  )
}
