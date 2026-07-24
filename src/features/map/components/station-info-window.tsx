'use client'

import { InfoWindow } from '@vis.gl/react-google-maps'
import { Star } from 'lucide-react'
import { LOCATION_STATUS_LABELS } from '@/lib/constants'
import type { StationMapPin } from '@/types/map'

interface StationInfoWindowProps {
  station: StationMapPin
  onClose: () => void
}

export function StationInfoWindow({
  station,
  onClose,
}: StationInfoWindowProps) {
  return (
    <InfoWindow
      position={{ lat: station.latitude, lng: station.longitude }}
      onCloseClick={onClose}
    >
      <div className="min-w-[200px] space-y-2 p-1">
        <h3 className="text-sm font-semibold">{station.name}</h3>
        <p className="text-xs text-gray-600">{station.province}</p>

        <div className="flex items-center gap-2">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
            {LOCATION_STATUS_LABELS[station.status] ?? station.status}
          </span>
          {station.is_free && (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
              ฟรี
            </span>
          )}
        </div>

        {station.avg_rating > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{station.avg_rating.toFixed(1)}</span>
            <span className="text-gray-500">
              ({station.review_count} รีวิว)
            </span>
          </div>
        )}

        <a
          href={`/stations/${station.id}`}
          className="mt-1 inline-block text-xs font-medium text-blue-600 hover:underline"
        >
          ดูรายละเอียด &rarr;
        </a>
      </div>
    </InfoWindow>
  )
}
