import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import {
  getStations,
  getConnectorTypes,
  getCompatibleStations,
  getCompatibilitySummariesBatch,
} from '@/features/stations/actions/queries'
import {
  getVehicleModelById,
  getVehicleModels,
} from '@/features/motorcycle/actions/queries'
import { getModelDisplayName } from '@/features/motorcycle/lib/utils'
import { StationCard } from '@/features/stations/components/station-card'
import { StationFilters } from '@/features/stations/components/station-filters'
import { Pagination } from '@/features/stations/components/pagination'
import { MyMotorcycleBadge } from '@/features/motorcycle/components/my-motorcycle-badge'
import { VehicleSummaryCard } from '@/features/motorcycle/components/vehicle-summary-card'
import { MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}): Promise<Metadata> {
  const params = await searchParams

  if (params.vehicle) {
    const vehicle = await getVehicleModelById(params.vehicle)
    if (vehicle) {
      const displayName = getModelDisplayName(vehicle.brand, vehicle.model)
      return {
        title: `สถานีชาร์จที่รองรับ ${displayName}`,
        description: `ค้นหาสถานีชาร์จมอเตอร์ไซค์ไฟฟ้าที่รองรับ ${displayName} ทั่วประเทศไทย`,
        openGraph: {
          title: `${displayName} Charging Stations Thailand`,
          description: `Find charging stations compatible with ${displayName} in Thailand.`,
        },
      }
    }
  }

  return {
    title: 'รายการสถานีชาร์จ',
    description:
      'รายการสถานีชาร์จมอเตอร์ไซค์ไฟฟ้าทั่วประเทศไทย ค้นหา กรอง และเปรียบเทียบสถานีชาร์จ',
  }
}

export default async function StationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const vehicleId = params.vehicle

  // Fetch vehicle model if filter is active
  const vehicle = vehicleId ? await getVehicleModelById(vehicleId) : null
  const vehicleDisplayName = vehicle
    ? getModelDisplayName(vehicle.brand, vehicle.model)
    : null

  // Branch: compatible stations vs all stations
  const [stationsResult, connectorTypes, vehicleModels] = await Promise.all([
    vehicle?.connector_type_id
      ? getCompatibleStations({
          connectorTypeId: vehicle.connector_type_id,
          search: params.search,
          province: params.province,
          isFree: params.free === 'true',
          sort: (params.sort as 'newest' | 'rating') ?? 'newest',
          page: Number(params.page) || 1,
        })
      : getStations({
          search: params.search,
          province: params.province,
          connectorType: params.connector,
          isFree: params.free === 'true',
          sort: (params.sort as 'newest' | 'rating') ?? 'newest',
          page: Number(params.page) || 1,
        }),
    getConnectorTypes(),
    getVehicleModels(),
  ])

  const { stations, totalCount } = stationsResult

  // Batch fetch compatibility summaries when vehicle filter is active
  const summaryMap =
    vehicleId && stations.length > 0
      ? await getCompatibilitySummariesBatch(
          vehicleId,
          stations.map((s) => s.id)
        )
      : null

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-1 flex items-center gap-3">
        <h1 className="text-2xl font-bold">สถานีชาร์จ</h1>
        {totalCount > 0 && (
          <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
            {totalCount} สถานี
          </span>
        )}
      </div>
      <p className="mb-6 text-muted-foreground">
        {vehicleDisplayName
          ? `สถานีชาร์จที่รองรับ ${vehicleDisplayName}`
          : 'รายการสถานีชาร์จมอเตอร์ไซค์ไฟฟ้าทั่วประเทศไทย'}
      </p>

      {/* Vehicle summary card */}
      {vehicleDisplayName && (
        <VehicleSummaryCard
          displayName={vehicleDisplayName}
          compatibleCount={totalCount}
        />
      )}

      {/* Motorcycle badge (when no vehicle filter) */}
      {!vehicleId && <MyMotorcycleBadge />}

      <Suspense>
        <StationFilters
          connectorTypes={connectorTypes}
          vehicleModels={vehicleModels}
          activeVehicleId={vehicleId}
        />
      </Suspense>

      {stations.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                vehicleDisplayName={vehicleDisplayName ?? undefined}
                compatibility={summaryMap?.get(station.id) ?? null}
              />
            ))}
          </div>
          <Suspense>
            <Pagination totalCount={totalCount} />
          </Suspense>
        </>
      ) : vehicleDisplayName ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium">
            ยังไม่พบจุดชาร์จที่รองรับรถรุ่นนี้
          </p>
          <p className="text-muted-foreground">
            ช่วยชุมชน! รายงานจุดชาร์จที่คุณเคยใช้งานได้
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/stations" />}>
            <Plus className="mr-1.5 h-4 w-4" />
            ดูสถานีทั้งหมด
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium">ยังไม่มีสถานีชาร์จ</p>
          <p className="text-muted-foreground">
            ลองเปลี่ยนตัวกรอง หรือเป็นคนแรกที่เพิ่มสถานี!
          </p>
        </div>
      )}
    </div>
  )
}
