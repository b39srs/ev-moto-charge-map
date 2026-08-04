'use client'

import { useState } from 'react'
import { History, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { EditHistoryItem } from '../actions/queries'

const FIELD_LABELS: Record<string, string> = {
  name: 'ชื่อสถานี',
  address: 'ที่อยู่',
  province: 'จังหวัด',
  district: 'อำเภอ',
  subdistrict: 'ตำบล',
  postal_code: 'รหัสไปรษณีย์',
  description: 'รายละเอียด',
  operating_hours: 'เวลาเปิด-ปิด',
  contact_phone: 'เบอร์โทร',
  website_url: 'เว็บไซต์',
  is_free: 'ฟรี/มีค่าใช้จ่าย',
  price_description: 'รายละเอียดค่าใช้จ่าย',
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'เมื่อสักครู่'
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`
  if (diffDay < 30) return `${diffDay} วันที่แล้ว`
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function EditHistory({ history }: { history: EditHistoryItem[] }) {
  const [expanded, setExpanded] = useState(false)

  if (history.length === 0) return null

  const visible = expanded ? history : history.slice(0, 3)
  const hasMore = history.length > 3

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <History className="h-5 w-5" />
        ประวัติการแก้ไข
      </h3>
      <div className="space-y-2">
        {visible.map((item) => {
          const fieldNames = Object.keys(item.changes)
            .map((k) => FIELD_LABELS[k] ?? k)
          return (
            <div
              key={item.id}
              className="rounded-lg border bg-muted/30 px-4 py-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {item.editor_name ?? 'ผู้ใช้'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(item.created_at)}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">
                แก้ไข: {fieldNames.join(', ')}
              </p>
            </div>
          )
        })}
      </div>
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full"
        >
          {expanded ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              ย่อ
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              ดูทั้งหมด ({history.length})
            </>
          )}
        </Button>
      )}
    </div>
  )
}
