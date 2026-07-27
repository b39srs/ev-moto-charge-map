import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star } from 'lucide-react'
import {
  LOCATION_STATUS_LABELS,
  LOCATION_STATUS_COLORS,
} from '@/lib/constants'
import { CompatibilityBadge } from '@/features/compatibility/components/compatibility-badge'
import type { StationCompatibilityInfo } from '@/features/stations/actions/queries'

interface StationCardProps {
  station: {
    id: string
    name: string
    address: string
    province: string
    status: string
    avg_rating: number | null
    review_count: number
    is_free: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    location_connectors?: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    photos?: any[]
  }
  vehicleDisplayName?: string
  compatibility?: StationCompatibilityInfo | null
}

export function StationCard({ station, vehicleDisplayName, compatibility }: StationCardProps) {
  const primaryPhoto = station.photos?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.is_primary
  ) ?? station.photos?.[0]

  const connectorNames = station.location_connectors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.map((lc: any) => lc.connector_types?.display_name)
    .filter(Boolean)
    .slice(0, 3)

  return (
    <Link href={`/stations/${station.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardContent className="p-0">
          <div className="relative h-40 w-full bg-muted">
            {primaryPhoto ? (
              <Image
                src={primaryPhoto.url}
                alt={station.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground/40" />
              </div>
            )}
            <Badge
              className={`absolute right-2 top-2 ${LOCATION_STATUS_COLORS[station.status] ?? ''}`}
            >
              {LOCATION_STATUS_LABELS[station.status] ?? station.status}
            </Badge>
          </div>

          <div className="p-4 space-y-2">
            <h3 className="font-semibold line-clamp-1">{station.name}</h3>

            <p className="text-sm text-muted-foreground line-clamp-1">
              {station.province} · {station.address}
            </p>

            <div className="flex items-center gap-3">
              {(station.avg_rating ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{Number(station.avg_rating).toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({station.review_count})
                  </span>
                </div>
              )}
              {station.is_free && (
                <Badge variant="outline" className="text-green-700">
                  ฟรี
                </Badge>
              )}
            </div>

            {vehicleDisplayName ? (
              <CompatibilityBadge
                vehicleDisplayName={vehicleDisplayName}
                verificationLevel={compatibility?.verificationLevel}
                totalReports={compatibility?.totalReports}
                successCount={compatibility?.successCount}
              />
            ) : (
              connectorNames && connectorNames.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {connectorNames.map((name: string) => (
                    <Badge key={name} variant="outline" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
