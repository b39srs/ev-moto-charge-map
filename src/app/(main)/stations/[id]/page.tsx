import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import {
  getStationById,
  checkFavorite,
  getStationCoordinates,
} from '@/features/stations/actions/queries'
import { getReviewsByLocation } from '@/features/reviews/actions/queries'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const station = await getStationById(id)
  if (!station) return { title: 'ไม่พบสถานี' }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = station as any
  return {
    title: s.name,
    description: s.description ?? `สถานีชาร์จ ${s.name} — ${s.province}`,
    openGraph: {
      title: s.name,
      description: s.description ?? `สถานีชาร์จ ${s.name} — ${s.province}`,
    },
  }
}
import { StationHeader } from '@/features/stations/components/station-header'
import { StationInfo } from '@/features/stations/components/station-info'
import { ConnectorList } from '@/features/stations/components/connector-list'
import { AmenityList } from '@/features/stations/components/amenity-list'
import { PhotoGallery } from '@/features/stations/components/photo-gallery'
import { FavoriteButton } from '@/features/stations/components/favorite-button'
import { ReviewsSection } from '@/features/reviews/components/reviews-section'
import { StationLocationCard } from '@/features/map/components/station-location-card'

export default async function StationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const station = await getStationById(id)

  if (!station) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [reviews, isFavorited, coordinates] = await Promise.all([
    getReviewsByLocation(id),
    user ? checkFavorite(user.id, id) : false,
    getStationCoordinates(id),
  ])

  const hasReviewed = user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? reviews.some((r: any) => r.user_id === user.id)
    : false

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <StationHeader station={station} />
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {user && user.id === (station as any).added_by && (
                <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/stations/${id}/edit`} />}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  แก้ไข
                </Button>
              )}
              {user && (
                <FavoriteButton locationId={id} isFavorited={isFavorited} />
              )}
            </div>
          </div>

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <PhotoGallery photos={(station as any).photos ?? []} />

          <StationInfo station={station} />

          <ReviewsSection
            locationId={id}
            reviews={reviews}
            currentUserId={user?.id}
            hasReviewed={hasReviewed}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {coordinates && (
            <StationLocationCard
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
              name={(station as any).name}
            />
          )}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ConnectorList connectors={(station as any).location_connectors ?? []} />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <AmenityList amenities={(station as any).location_amenities ?? []} />
        </div>
      </div>
    </div>
  )
}
