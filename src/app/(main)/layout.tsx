import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AuthProvider } from '@/features/auth/components/auth-provider'
import { MotorcycleProvider } from '@/features/motorcycle/motorcycle-provider'
import type { MotorcycleInfo } from '@/features/motorcycle/motorcycle-provider'
import { createClient } from '@/lib/supabase/server'
import { getModelDisplayName } from '@/features/motorcycle/lib/utils'

export const dynamic = 'force-dynamic'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let serverMotorcycle: MotorcycleInfo | null = null

  if (user) {
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('ev_model_id')
      .eq('id', user.id)
      .single()

    if (profile?.ev_model_id) {
      const { data: model } = await (supabase.from('vehicle_models') as any)
        .select('id, brand, model')
        .eq('id', profile.ev_model_id)
        .single()

      if (model) {
        serverMotorcycle = {
          id: model.id,
          displayName: getModelDisplayName(model.brand, model.model),
        }
      }
    }
  }

  return (
    <AuthProvider>
      <MotorcycleProvider
        serverMotorcycle={serverMotorcycle}
        isLoggedIn={!!user}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </MotorcycleProvider>
    </AuthProvider>
  )
}
