import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'เพิ่มสถานีชาร์จ',
  robots: { index: false },
}
import { redirect } from 'next/navigation'
import {
  getConnectorTypes,
  getAmenities,
} from '@/features/stations/actions/queries'
import { AddStationForm } from '@/features/stations/components/add-station-form'

export default async function AddStationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [connectorTypes, amenities] = await Promise.all([
    getConnectorTypes(),
    getAmenities(),
  ])

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">เพิ่มสถานีชาร์จ</h1>
      <AddStationForm
        connectorTypes={connectorTypes}
        amenities={amenities}
      />
    </div>
  )
}
