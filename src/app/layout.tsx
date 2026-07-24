import type { Metadata } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'EV Moto Charge Map - แผนที่จุดชาร์จมอเตอร์ไซค์ไฟฟ้า',
    template: '%s | EV Moto Charge Map',
  },
  description:
    'ค้นหาจุดชาร์จมอเตอร์ไซค์ไฟฟ้าทั่วไทย แชร์ประสบการณ์ รีวิวสถานีชาร์จ โดยชุมชนผู้ใช้ EV',
  openGraph: {
    siteName: 'EV Moto Charge Map',
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
