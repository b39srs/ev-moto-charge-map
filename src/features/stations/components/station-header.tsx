import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Clock, Phone } from 'lucide-react'
import {
  LOCATION_STATUS_LABELS,
  LOCATION_STATUS_COLORS,
} from '@/lib/constants'

interface StationHeaderProps {
  station: {
    name: string
    status: string
    address: string
    province: string
    district?: string | null
    avg_rating: number | null
    review_count: number
    operating_hours?: string | null
    contact_phone?: string | null
    is_free: boolean
  }
}

export function StationHeader({ station }: StationHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold">{station.name}</h1>
        <Badge
          className={LOCATION_STATUS_COLORS[station.status] ?? ''}
        >
          {LOCATION_STATUS_LABELS[station.status] ?? station.status}
        </Badge>
      </div>

      <div className="flex items-center gap-1 text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="text-sm">
          {station.address}, {station.district ? `${station.district}, ` : ''}
          {station.province}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {(station.avg_rating ?? 0) > 0 ? (
          <div className="flex items-center gap-1.5">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">
              {Number(station.avg_rating).toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({station.review_count} รีวิว)
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">ยังไม่มีรีวิว</span>
        )}

        {station.is_free && (
          <Badge variant="outline" className="text-green-700 border-green-300">
            ชาร์จฟรี
          </Badge>
        )}

        {station.operating_hours && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {station.operating_hours}
          </div>
        )}

        {station.contact_phone && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {station.contact_phone}
          </div>
        )}
      </div>
    </div>
  )
}
