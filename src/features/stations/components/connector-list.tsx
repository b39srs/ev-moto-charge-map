import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plug } from 'lucide-react'

interface ConnectorListProps {
  connectors: {
    id: string
    quantity: number
    power_kw: number | null
    price_per_kwh: number | null
    price_per_minute: number | null
    is_available: boolean
    notes: string | null
    connector_types: {
      display_name: string
      power_type: string
    } | null
  }[]
}

export function ConnectorList({ connectors }: ConnectorListProps) {
  if (connectors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" /> หัวชาร์จ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลหัวชาร์จ</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5" /> หัวชาร์จ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {connectors.map((c) => (
          <div key={c.id} className="flex items-start justify-between rounded-md border p-3">
            <div>
              <p className="font-medium text-sm">
                {c.connector_types?.display_name ?? 'ไม่ระบุ'}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs">
                  {c.connector_types?.power_type ?? '-'}
                </Badge>
                {c.power_kw && (
                  <Badge variant="outline" className="text-xs">
                    {c.power_kw} kW
                  </Badge>
                )}
                {c.quantity > 1 && (
                  <Badge variant="outline" className="text-xs">
                    {c.quantity} หัว
                  </Badge>
                )}
              </div>
              {(c.price_per_kwh || c.price_per_minute) && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.price_per_kwh && `${c.price_per_kwh} บาท/kWh`}
                  {c.price_per_kwh && c.price_per_minute && ' · '}
                  {c.price_per_minute && `${c.price_per_minute} บาท/นาที`}
                </p>
              )}
              {c.notes && (
                <p className="mt-1 text-xs text-muted-foreground">{c.notes}</p>
              )}
            </div>
            <Badge
              variant={c.is_available ? 'default' : 'secondary'}
              className="text-xs"
            >
              {c.is_available ? 'พร้อมใช้' : 'ไม่พร้อม'}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
