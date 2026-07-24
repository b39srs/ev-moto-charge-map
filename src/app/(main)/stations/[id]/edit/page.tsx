import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'แก้ไขสถานีชาร์จ',
  robots: { index: false },
}
import { createClient } from '@/lib/supabase/server'
import {
  getStationForEdit,
  getStationCoordinates,
  getConnectorTypes,
  getAmenities,
} from '@/features/stations/actions/queries'
import { EditStationForm } from '@/features/stations/components/edit-station-form'

export default async function EditStationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [station, coordinates, connectorTypes, amenities] = await Promise.all([
    getStationForEdit(id, user.id),
    getStationCoordinates(id),
    getConnectorTypes(),
    getAmenities(),
  ])

  if (!station) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = station as any

  const defaultValues = {
    name: s.name ?? '',
    address: s.address ?? '',
    province: s.province ?? '',
    district: s.district,
    description: s.description,
    operating_hours: s.operating_hours,
    contact_phone: s.contact_phone,
    website_url: s.website_url,
    is_free: s.is_free ?? false,
    price_description: s.price_description,
    latitude: coordinates?.latitude ?? 0,
    longitude: coordinates?.longitude ?? 0,
    connectorTypeIds: (s.location_connectors ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (lc: any) => lc.connector_type_id
    ),
    amenityIds: (s.location_amenities ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (la: any) => la.amenity_id
    ),
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">แก้ไขสถานีชาร์จ</h1>
      <EditStationForm
        stationId={id}
        connectorTypes={connectorTypes}
        amenities={amenities}
        defaultValues={defaultValues}
      />
    </div>
  )
}
