/**
 * Format a date string as Thai relative time (e.g., "3 วันที่แล้ว").
 * Falls back to short date format for dates older than 30 days.
 */
export function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'ไม่มีข้อมูล'

  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 1) return 'เมื่อสักครู่'
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
  if (diffDays < 30) return `${diffDays} วันที่แล้ว`

  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
