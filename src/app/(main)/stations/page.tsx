import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'รายการสถานีชาร์จ',
  description: 'รายการสถานีชาร์จมอเตอร์ไซค์ไฟฟ้าทั่วประเทศไทย ค้นหา กรอง และเปรียบเทียบสถานีชาร์จ',
}
import {
  getStations,
  getConnectorTypes,
} from '@/features/stations/actions/queries'
import { StationCard } from '@/features/stations/components/station-card'
import { StationFilters } from '@/features/stations/components/station-filters'
import { Pagination } from '@/features/stations/components/pagination'
import { MapPin } from 'lucide-react'

export default async function StationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams

  const [{ stations, totalCount }, connectorTypes] = await Promise.all([
    getStations({
      search: params.search,
      province: params.province,
      connectorType: params.connector,
      isFree: params.free === 'true',
      sort: (params.sort as 'newest' | 'rating') ?? 'newest',
      page: Number(params.page) || 1,
    }),
    getConnectorTypes(),
  ])

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">สถานีชาร์จ</h1>
      <p className="mb-6 text-muted-foreground">
        รายการสถานีชาร์จมอเตอร์ไซค์ไฟฟ้าทั่วประเทศไทย
      </p>

      <Suspense>
        <StationFilters connectorTypes={connectorTypes} />
      </Suspense>

      {stations.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
          <Suspense>
            <Pagination totalCount={totalCount} />
          </Suspense>
        </>
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
