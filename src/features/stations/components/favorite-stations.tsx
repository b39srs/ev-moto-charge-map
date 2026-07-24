import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Star, Heart, HeartOff } from 'lucide-react'
import { toggleFavorite } from '@/features/stations/actions/favorite-actions'
import {
  LOCATION_STATUS_LABELS,
  LOCATION_STATUS_COLORS,
} from '@/lib/constants'

interface FavoriteStationsProps {
  favorites: {
    id: string
    charging_locations: {
      id: string
      name: string
      province: string
      status: string
      avg_rating: number | null
      review_count: number
      is_free: boolean
    }
  }[]
}

export function FavoriteStations({ favorites }: FavoriteStationsProps) {
  if (favorites.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Heart className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
        <p>คุณยังไม่มีสถานีที่ถูกใจ</p>
        <Link href="/stations" className="mt-2 inline-block text-sm text-primary hover:underline">
          ค้นหาสถานีชาร์จ
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {favorites.map((fav) => {
        const station = fav.charging_locations
        return (
          <div
            key={fav.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <Link
              href={`/stations/${station.id}`}
              className="flex-1 hover:underline"
            >
              <p className="font-medium">{station.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{station.province}</span>
                {station.is_free && (
                  <span className="text-green-600 font-medium">ฟรี</span>
                )}
              </div>
            </Link>
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
              <form action={async () => {
                'use server'
                await toggleFavorite(station.id)
              }}>
                <button
                  type="submit"
                  className="rounded p-1 text-red-500 hover:bg-red-50"
                  title="ยกเลิกถูกใจ"
                >
                  <HeartOff className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )
      })}
    </div>
  )
}
