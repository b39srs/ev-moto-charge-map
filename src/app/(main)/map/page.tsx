import type { Metadata } from 'next'
import { GoogleMapsProvider } from '@/components/map/google-maps-provider'
import { FullMap } from '@/features/map/components/full-map'
import {
  getStationsForMap,
  getCompatibleLocationIds,
  getConnectorTypes,
  getNetworks,
  getLocationConnectorMap,
} from '@/features/stations/actions/queries'
import { getVehicleModelById } from '@/features/motorcycle/actions/queries'
import { getModelDisplayName } from '@/features/motorcycle/lib/utils'

export const metadata: Metadata = {
  title: 'แผนที่สถานีชาร์จ',
  description:
    'ดูแผนที่สถานีชาร์จมอเตอร์ไซค์ไฟฟ้าทั่วประเทศไทย ค้นหาจุดชาร์จใกล้คุณ',
}

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>
}) {
  const { vehicle: vehicleId } = await searchParams

  const [stations, connectorTypes, networks, locationConnectorMap] =
    await Promise.all([
      getStationsForMap(),
      getConnectorTypes(),
      getNetworks(),
      getLocationConnectorMap(),
    ])

  let compatibleLocationIds: string[] | undefined
  let vehicleDisplayName: string | undefined

  if (vehicleId) {
    const vehicle = await getVehicleModelById(vehicleId)
    if (vehicle?.connector_type_id) {
      compatibleLocationIds = await getCompatibleLocationIds(
        vehicle.connector_type_id
      )
      vehicleDisplayName = getModelDisplayName(vehicle.brand, vehicle.model)
    }
  }

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <GoogleMapsProvider>
        <FullMap
          stations={stations}
          connectorTypes={connectorTypes}
          networks={networks}
          locationConnectorMap={locationConnectorMap}
          compatibleLocationIds={compatibleLocationIds}
          vehicleDisplayName={vehicleDisplayName}
        />
      </GoogleMapsProvider>
    </div>
  )
}
