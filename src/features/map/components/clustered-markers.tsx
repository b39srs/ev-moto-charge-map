'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { ClusteredStationMarker } from './clustered-station-marker'
import { StationInfoWindow } from './station-info-window'
import type { StationMapPin } from '@/types/map'

interface ClusteredMarkersProps {
  stations: StationMapPin[]
}

export function ClusteredMarkers({ stations }: ClusteredMarkersProps) {
  const map = useMap()
  const clustererRef = useRef<MarkerClusterer | null>(null)
  const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map())
  const [selectedStation, setSelectedStation] = useState<StationMapPin | null>(null)

  // Initialize clusterer
  useEffect(() => {
    if (!map) return
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({ map })
    }
    return () => {
      clustererRef.current?.clearMarkers()
      clustererRef.current = null
    }
  }, [map])

  // Sync markers with clusterer when stations change
  useEffect(() => {
    const clusterer = clustererRef.current
    if (!clusterer) return

    // Delay to ensure marker refs are registered after render
    const timer = setTimeout(() => {
      clusterer.clearMarkers()
      clusterer.addMarkers([...markersRef.current.values()])
    }, 0)

    return () => clearTimeout(timer)
  }, [stations])

  const handleMarkerRef = useCallback(
    (stationId: string, marker: google.maps.marker.AdvancedMarkerElement | null) => {
      if (marker) {
        markersRef.current.set(stationId, marker)
      } else {
        markersRef.current.delete(stationId)
      }
    },
    []
  )

  const handleMarkerClick = useCallback((station: StationMapPin) => {
    setSelectedStation(station)
  }, [])

  const handleInfoWindowClose = useCallback(() => {
    setSelectedStation(null)
  }, [])

  return (
    <>
      {stations.map((station) => (
        <ClusteredStationMarker
          key={station.id}
          station={station}
          onMarkerRef={handleMarkerRef}
          onClick={handleMarkerClick}
        />
      ))}
      {selectedStation && (
        <StationInfoWindow
          station={selectedStation}
          onClose={handleInfoWindowClose}
        />
      )}
    </>
  )
}
