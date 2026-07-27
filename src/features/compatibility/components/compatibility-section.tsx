import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ShieldCheck } from 'lucide-react'
import { CompatibilityModelRow } from './compatibility-model-row'
import { ReportFormDialog } from './report-form-dialog'
import type { CompatibilitySummaryWithModel } from '@/features/compatibility/types'

interface VehicleModelOption {
  id: string
  brand: string
  model: string
}

interface CompatibilitySectionProps {
  locationId: string
  summaries: CompatibilitySummaryWithModel[]
  currentUserId?: string
  userMotorcycleId?: string | null
  vehicleModels: VehicleModelOption[]
}

export function CompatibilitySection({
  locationId,
  summaries,
  currentUserId,
  userMotorcycleId,
  vehicleModels,
}: CompatibilitySectionProps) {
  // Sort user's motorcycle to the top
  const sorted = userMotorcycleId
    ? [
        ...summaries.filter((s) => s.vehicle_model_id === userMotorcycleId),
        ...summaries.filter((s) => s.vehicle_model_id !== userMotorcycleId),
      ]
    : summaries

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            ความเข้ากันได้
            {sorted.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({sorted.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.length > 0 ? (
            sorted.map((summary) => (
              <CompatibilityModelRow
                key={summary.vehicle_model_id}
                summary={summary}
                isUserMotorcycle={
                  !!userMotorcycleId &&
                  summary.vehicle_model_id === userMotorcycleId
                }
              />
            ))
          ) : (
            <p className="text-muted-foreground">
              ยังไม่มีรายงานความเข้ากันได้
            </p>
          )}
        </CardContent>
      </Card>

      {currentUserId ? (
        <Card>
          <CardContent className="flex items-center justify-center py-4">
            <ReportFormDialog
              locationId={locationId}
              vehicleModels={vehicleModels}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-4 text-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:underline"
            >
              เข้าสู่ระบบเพื่อรายงานความเข้ากันได้
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
