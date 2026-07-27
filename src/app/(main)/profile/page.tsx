import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'โปรไฟล์',
  robots: { index: false },
}
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditProfileForm } from '@/features/profile/components/edit-profile-form'
import { UserStations } from '@/features/profile/components/user-stations'
import { UserReviews } from '@/features/profile/components/user-reviews'
import { getUserStations } from '@/features/stations/actions/queries'
import { getUserReviews } from '@/features/reviews/actions/queries'
import { getVehicleModels } from '@/features/motorcycle/actions/queries'
import type { Profile } from '@/types/entities'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  const profile = data as Profile | null

  const [stations, reviews, vehicleModels] = await Promise.all([
    getUserStations(user.id),
    getUserReviews(user.id),
    getVehicleModels(),
  ])

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">โปรไฟล์</h1>

      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={profile?.avatar_url ?? undefined}
              alt={profile?.full_name ?? ''}
            />
            <AvatarFallback className="text-lg">
              {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-medium">
              {profile?.full_name || 'ไม่ระบุชื่อ'}
            </p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              สมาชิกตั้งแต่{' '}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('th-TH')
                : '-'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1">
            ข้อมูลส่วนตัว
          </TabsTrigger>
          <TabsTrigger value="stations" className="flex-1">
            สถานีที่เพิ่ม ({stations.length})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1">
            รีวิว ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>แก้ไขข้อมูลส่วนตัว</CardTitle>
            </CardHeader>
            <CardContent>
              <EditProfileForm
                profile={{
                  full_name: profile?.full_name ?? null,
                  bio: profile?.bio ?? null,
                  ev_model_id: profile?.ev_model_id ?? null,
                }}
                vehicleModels={vehicleModels}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stations">
          <Card>
            <CardHeader>
              <CardTitle>สถานีที่ฉันเพิ่ม</CardTitle>
            </CardHeader>
            <CardContent>
              <UserStations stations={stations} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>รีวิวของฉัน</CardTitle>
            </CardHeader>
            <CardContent>
              <UserReviews reviews={reviews} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
