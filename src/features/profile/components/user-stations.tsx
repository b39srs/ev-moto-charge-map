import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin } from 'lucide-react'
import {
  LOCATION_STATUS_LABELS,
  LOCATION_STATUS_COLORS,
} from '@/lib/constants'

interface UserStationsProps {
  stations: {
    id: string
    name: string
    province: string
    status: string
    avg_rating: number | null
    review_count: number
    created_at: string
  }[]
}

export function UserStations({ stations }: UserStationsProps) {
  if (stations.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
        <p>คุณยังไม่ได้เพิ่มสถานีชาร์จ</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {stations.map((station) => (
        <Link
          key={station.id}
          href={`/stations/${station.id}`}
          className="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
        >
          <div>
            <p className="font-medium">{station.name}</p>
            <p className="text-sm text-muted-foreground">{station.province}</p>
          </div>
          <div className="flex items-center gap-2">
            {(station.avg_rating ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {Number(station.avg_rating).toFixed(1)}
              </div>
            )}
            <Badge
              className={`text-xs ${LOCATION_STATUS_COLORS[station.status] ?? ''}`}
            >
              {LOCATION_STATUS_LABELS[station.status] ?? station.status}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  )
}
