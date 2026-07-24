import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { Logo } from './logo'
import { UserMenu } from './user-menu'
import { MobileNav } from './mobile-nav'

const navLinks = [
  { href: '/map', label: 'แผนที่' },
  { href: '/stations', label: 'สถานีชาร์จ' },
  { href: '/add-station', label: 'เพิ่มสถานี' },
]

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: { full_name: string | null; avatar_url: string | null; email: string | null } | null = null
  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('profiles') as any)
      .select('full_name, avatar_url, email')
      .eq('id', user.id)
      .single()
    profile = data as typeof profile
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {profile ? (
            <UserMenu user={profile} />
          ) : (
            <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
              เข้าสู่ระบบ
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
