import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

interface AmenityListProps {
  amenities: {
    amenity_id: string
    amenities: {
      display_name: string
      icon: string
      category: string
    } | null
  }[]
}

export function AmenityList({ amenities }: AmenityListProps) {
  if (amenities.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" /> สิ่งอำนวยความสะดวก
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => (
            <Badge key={a.amenity_id} variant="outline">
              {a.amenities?.display_name ?? 'ไม่ระบุ'}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
