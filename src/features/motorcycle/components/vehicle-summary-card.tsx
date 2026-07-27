import Link from 'next/link'
import { Bike, X, Info, CheckCircle2 } from 'lucide-react'

interface VehicleSummaryCardProps {
  displayName: string
  compatibleCount: number
  verifiedCount?: number
}

export function VehicleSummaryCard({
  displayName,
  compatibleCount,
  verifiedCount = 0,
}: VehicleSummaryCardProps) {
  return (
    <div className="mb-6 rounded-lg border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <Bike className="h-6 w-6 shrink-0 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{displayName}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              คาดว่าใช้งานได้ {compatibleCount} สถานี
            </span>
            {verifiedCount > 0 && (
              <span className="flex items-center gap-1 text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                ยืนยันแล้ว {verifiedCount} สถานี
              </span>
            )}
          </div>
        </div>
        <Link
          href="/stations"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          title="ล้างตัวกรอง"
        >
          <X className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-1.5 pl-9 text-xs text-muted-foreground/80">
        อ้างอิงจากข้อมูลหัวชาร์จ · ช่วยยืนยันโดยรายงานผลการใช้งานจริง
      </p>
    </div>
  )
}
