import { Zap, MessageSquare } from 'lucide-react'

const FEEDBACK_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSc-bN8hM_Hk1cbYzcTqowMpMYW38MOWmVSo5ZKZGHVUsC-pWA/viewform'

export function Footer() {
  return (
    <>
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-6 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span>EV Moto Charge Map</span>
          </div>
          <p>&copy; {new Date().getFullYear()} EV Moto Charge Map. สงวนลิขสิทธิ์.</p>
        </div>
      </footer>

      {/* Floating feedback button */}
      <a
        href={FEEDBACK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        title="ส่ง Feedback"
      >
        <MessageSquare className="h-4 w-4" />
        <span className="hidden sm:inline">Feedback</span>
      </a>
    </>
  )
}
