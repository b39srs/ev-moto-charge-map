import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPendingVehicleModels, approveVehicleModel, rejectVehicleModel } from '@/features/motorcycle/actions/admin-vehicle-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Check, X } from 'lucide-react'

export const metadata = { title: 'Admin — รุ่นรถรอการอนุมัติ' }

export default async function AdminVehiclesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'moderator'].includes(profile.role)) {
    redirect('/')
  }

  const pending = await getPendingVehicleModels()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        nativeButton={false}
        render={<Link href="/" />}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        กลับหน้าหลัก
      </Button>

      <h1 className="text-xl font-bold mb-2">🚗 รุ่นรถรอการอนุมัติ</h1>
      <p className="text-sm text-muted-foreground mb-6">
        ผู้ใช้แนะนำรุ่นรถใหม่ — ตรวจสอบแล้วอนุมัติหรือปฏิเสธ
      </p>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-3xl mb-3">✅</p>
            <p>ไม่มีรายการรอการอนุมัติ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{pending.length} รายการ</p>
          {pending.map((m) => (
            <Card key={m.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {m.brand} {m.model}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{m.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        โดย {m.profiles?.full_name ?? m.profiles?.email ?? m.added_by.slice(0, 8)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.created_at).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form
                      action={async () => {
                        'use server'
                        await approveVehicleModel(m.id)
                      }}
                    >
                      <Button type="submit" size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        อนุมัติ
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        'use server'
                        await rejectVehicleModel(m.id)
                      }}
                    >
                      <Button type="submit" size="sm" variant="outline" className="text-destructive border-destructive hover:bg-red-50">
                        <X className="h-3.5 w-3.5 mr-1" />
                        ปฏิเสธ
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
