import type { Metadata } from 'next'
import { GoogleMapsProvider } from '@/components/map/google-maps-provider'

export const metadata: Metadata = {
  title: 'แผนที่สถานีชาร์จ',
  description: 'ดูแผนที่สถานีชาร์จมอเตอร์ไซค์ไฟฟ้าทั่วประเทศไทย ค้นหาจุดชาร์จใกล้คุณ',
}
import { FullMap } from '@/features/map/components/full-map'
import { getStationsForMap } from '@/features/stations/actions/queries'

export default async function MapPage() {
  const stations = await getStationsForMap()

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <GoogleMapsProvider>
        <FullMap stations={stations} />
      </GoogleMapsProvider>
    </div>
  )
}
