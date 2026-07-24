import { Zap } from 'lucide-react'
import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
      <Zap className="h-6 w-6 text-primary" />
      <span>EV Moto Charge Map</span>
    </Link>
  )
}
