import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe } from 'lucide-react'

interface StationInfoProps {
  station: {
    description?: string | null
    price_description?: string | null
    website_url?: string | null
  }
}

export function StationInfo({ station }: StationInfoProps) {
  if (!station.description && !station.price_description && !station.website_url) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายละเอียด</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {station.description && (
          <p className="text-sm whitespace-pre-wrap">{station.description}</p>
        )}

        {station.price_description && (
          <div>
            <p className="text-sm font-medium">ราคา</p>
            <p className="text-sm text-muted-foreground">
              {station.price_description}
            </p>
          </div>
        )}

        {station.website_url && (
          <a
            href={station.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Globe className="h-3.5 w-3.5" />
            เว็บไซต์
          </a>
        )}
      </CardContent>
    </Card>
  )
}
