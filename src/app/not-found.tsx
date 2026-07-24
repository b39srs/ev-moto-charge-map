import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">
        ไม่พบหน้าที่คุณต้องการ
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>กลับหน้าหลัก</Button>
    </div>
  )
}
