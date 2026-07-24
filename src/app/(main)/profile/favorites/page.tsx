import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'สถานีที่ถูกใจ',
  robots: { index: false },
}
import { createClient } from '@/lib/supabase/server'
import { getFavoriteStations } from '@/features/stations/actions/queries'
import { FavoriteStations } from '@/features/stations/components/favorite-stations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const favorites = await getFavoriteStations(user.id)

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>สถานีที่ถูกใจ</CardTitle>
        </CardHeader>
        <CardContent>
          <FavoriteStations favorites={favorites} />
        </CardContent>
      </Card>
    </div>
  )
}
