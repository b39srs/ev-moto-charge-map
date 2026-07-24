import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AuthProvider } from '@/features/auth/components/auth-provider'

export const dynamic = 'force-dynamic'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
