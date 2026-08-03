'use client'

import { useState, useCallback, useMemo } from 'react'
import { Map, MapControl, ControlPosition, AdvancedMarker } from '@vis.gl/react-google-maps'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/constants'
import { MapSearch } from './map-search'
import { MapFilters } from './map-filters'
import { GeolocationButton } from './geolocation-button'
import { ClusteredMarkers } from './clustered-markers'
import { Bike, X } from 'lucide-react'
import Link from 'next/link'
import type { StationMapPin } from '@/types/map'
import type { ConnectorType, Network } from '@/types/entities'

interface FullMapProps {
  stations: StationMapPin[]
  connectorTypes: ConnectorType[]
  networks: Network[]
  locationConnectorMap: Record<string, string[]>
  compatibleLocationIds?: string[]
  vehicleDisplayName?: string
}

export function FullMap({
  stations,
  connectorTypes,
  networks,
  locationConnectorMap,
  compatibleLocationIds,
  vehicleDisplayName,
}: FullMapProps) {
  // Filter state
  const [search, setSearch] = useState('')
  const [isFreeOnly, setIsFreeOnly] = useState(false)
  const [province, setProvince] = useState('')
  const [connectorTypeId, setConnectorTypeId] = useState('')
  const [networkId, setNetworkId] = useState('')

  // Geolocation state
  const [userPosition, setUserPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)

  // Pre-compute compatible ID set for O(1) lookup
  const compatibleIdSet = useMemo(
    () => (compatibleLocationIds ? new Set(compatibleLocationIds) : null),
    [compatibleLocationIds]
  )

  // Client-side filtering
  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (compatibleIdSet && !compatibleIdSet.has(s.id)) {
        return false
      }
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (isFreeOnly && !s.is_free) {
        return false
      }
      if (province && s.province !== province) {
        return false
      }
      if (connectorTypeId && !locationConnectorMap[s.id]?.includes(connectorTypeId)) {
        return false
      }
      if (networkId && s.network_id !== networkId) {
        return false
      }
      return true
    })
  }, [stations, search, isFreeOnly, province, compatibleIdSet, connectorTypeId, networkId, locationConnectorMap])

  const hasVehicleFilter = !!compatibleLocationIds
  const activeFilterCount =
    (isFreeOnly ? 1 : 0) +
    (province ? 1 : 0) +
    (connectorTypeId ? 1 : 0) +
    (networkId ? 1 : 0)

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
      {/* Vehicle badge */}
      {vehicleDisplayName && (
        <MapControl position={ControlPosition.TOP_CENTER}>
          <div className="mt-2 flex items-center gap-2 rounded-full bg-background/95 px-3 py-1.5 text-sm font-medium shadow-md backdrop-blur">
            <Bike className="h-4 w-4 text-primary" />
            <span>{vehicleDisplayName}</span>
            <Link
              href="/map"
              className="rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              title="ล้างตัวกรอง"
            >
              <X className="h-3.5 w-3.5" />
            </Link>
          </div>
        </MapControl>
      )}

      {/* Search + Filters */}
      <MapControl position={ControlPosition.TOP_LEFT}>
        <div>
          <MapSearch onSearchChange={handleSearchChange} />
          <MapFilters
            isFreeOnly={isFreeOnly}
            province={province}
            connectorTypeId={connectorTypeId}
            networkId={networkId}
            connectorTypes={connectorTypes}
            networks={networks}
            hasVehicleFilter={hasVehicleFilter}
            onFreeOnlyChange={setIsFreeOnly}
            onProvinceChange={setProvince}
            onConnectorTypeChange={setConnectorTypeId}
            onNetworkChange={setNetworkId}
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
