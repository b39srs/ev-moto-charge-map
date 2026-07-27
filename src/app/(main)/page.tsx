import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Zap, MapPin, Users, Star } from 'lucide-react'
import { getHomeStats } from '@/features/stations/actions/queries'
import { getVehicleModels } from '@/features/motorcycle/actions/queries'
import { MotorcyclePromptCard } from '@/features/motorcycle/components/motorcycle-prompt-card'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [stats, vehicleModels] = await Promise.all([
    getHomeStats(),
    getVehicleModels(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Zap className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          EV Moto Charge Map
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          ค้นหาจุดชาร์จมอเตอร์ไซค์ไฟฟ้าทั่วประเทศไทย
          แชร์ประสบการณ์และรีวิวสถานีชาร์จ โดยชุมชนผู้ใช้ EV
        </p>
        <MotorcyclePromptCard models={vehicleModels} isLoggedIn={!!user} />
        <div className="flex gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/map" />}>
            ดูแผนที่
          </Button>
          <Button variant="outline" size="lg" nativeButton={false} render={<Link href="/stations" />}>
            ค้นหาสถานี
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t bg-muted/50 px-4 py-12">
        <div className="container mx-auto grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: MapPin, label: 'สถานีชาร์จ', value: stats.stationCount },
            { icon: Users, label: 'ผู้ใช้งาน', value: stats.userCount },
            { icon: Star, label: 'รีวิว', value: stats.reviewCount },
            { icon: Zap, label: 'รายงานการชาร์จ', value: stats.reportCount },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex flex-col items-center gap-2 p-6">
                <stat.icon className="h-6 w-6 text-muted-foreground" />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
