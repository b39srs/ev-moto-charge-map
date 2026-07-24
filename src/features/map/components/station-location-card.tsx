import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from 'lucide-react'
import { GoogleMapsProvider } from '@/components/map/google-maps-provider'
import { StationDetailMap } from './station-detail-map'

interface StationLocationCardProps {
  latitude: number
  longitude: number
  name: string
}

export function StationLocationCard({
  latitude,
  longitude,
  name,
}: StationLocationCardProps) {
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>ตำแหน่งที่ตั้ง</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <GoogleMapsProvider>
          <StationDetailMap
            latitude={latitude}
            longitude={longitude}
            name={name}
          />
        </GoogleMapsProvider>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Navigation className="h-3.5 w-3.5" />
          นำทางด้วย Google Maps
        </a>
      </CardContent>
    </Card>
  )
}
