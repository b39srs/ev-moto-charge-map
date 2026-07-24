import { Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-6 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-1">
          <Zap className="h-4 w-4" />
          <span>EV Moto Charge Map</span>
        </div>
        <p>&copy; {new Date().getFullYear()} EV Moto Charge Map. สงวนลิขสิทธิ์.</p>
      </div>
    </footer>
  )
}
