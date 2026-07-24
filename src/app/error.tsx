'use client'

import { Button } from '@/components/ui/button'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">เกิดข้อผิดพลาด</h1>
      <p className="text-muted-foreground">
        ขออภัย เกิดข้อผิดพลาดขึ้น กรุณาลองใหม่อีกครั้ง
      </p>
      <Button onClick={reset}>ลองอีกครั้ง</Button>
    </div>
  )
}
