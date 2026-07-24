import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
}
