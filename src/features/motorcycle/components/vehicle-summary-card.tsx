import Link from 'next/link'
import { Bike, X, CheckCircle2 } from 'lucide-react'

interface VehicleSummaryCardProps {
  displayName: string
  compatibleCount: number
}

export function VehicleSummaryCard({
  displayName,
  compatibleCount,
}: VehicleSummaryCardProps) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border bg-primary/5 px-4 py-3">
      <Bike className="h-6 w-6 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{displayName}</p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          {compatibleCount} สถานีที่รองรับ ทั่วประเทศ
        </p>
      </div>
      <Link
        href="/stations"
        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        title="ล้างตัวกรอง"
      >
        <X className="h-4 w-4" />
      </Link>
    </div>
  )
}
