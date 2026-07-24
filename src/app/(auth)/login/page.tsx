import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ',
  robots: { index: false },
}
import { redirect } from 'next/navigation'
import { Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/features/auth/components/login-form'

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Zap className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">ยินดีต้อนรับ</CardTitle>
          <CardDescription>
            ค้นหาจุดชาร์จมอเตอร์ไซค์ไฟฟ้าทั่วประเทศไทย
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
