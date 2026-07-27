'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/features/auth/actions/auth-actions'
import { Bike, Heart, LogOut, User } from 'lucide-react'
import Link from 'next/link'

interface UserMenuProps {
  user: {
    email?: string | null
    full_name?: string | null
    avatar_url?: string | null
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = user.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-full outline-none ring-ring focus-visible:ring-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name ?? ''} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.full_name || 'ผู้ใช้งาน'}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          โปรไฟล์
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/profile" />} className="cursor-pointer">
          <Bike className="mr-2 h-4 w-4" />
          มอเตอร์ไซค์ของฉัน
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/profile/favorites" />} className="cursor-pointer">
          <Heart className="mr-2 h-4 w-4" />
          สถานีที่ถูกใจ
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onSelect={async () => {
            await signOut()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
