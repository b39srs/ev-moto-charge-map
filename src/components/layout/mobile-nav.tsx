'use client'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu, MapPin, List, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from './logo'

const navLinks = [
  { href: '/', label: 'หน้าหลัก', icon: MapPin },
  { href: '/map', label: 'แผนที่', icon: MapPin },
  { href: '/stations', label: 'สถานีชาร์จ', icon: List },
  { href: '/add-station', label: 'เพิ่มสถานี', icon: PlusCircle },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" />}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">เมนู</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
