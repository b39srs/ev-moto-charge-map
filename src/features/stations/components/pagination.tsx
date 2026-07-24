'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ITEMS_PER_PAGE } from '@/lib/constants'

interface PaginationProps {
  totalCount: number
}

export function Pagination({ totalCount }: PaginationProps) {
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  if (totalPages <= 1) return null

  function getPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    return `?${params.toString()}`
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Button variant="outline" size="icon" nativeButton={false} render={
          <Link href={getPageUrl(currentPage - 1)} />
        }>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <span className="px-3 text-sm text-muted-foreground">
        หน้า {currentPage} / {totalPages}
      </span>

      {currentPage < totalPages && (
        <Button variant="outline" size="icon" nativeButton={false} render={
          <Link href={getPageUrl(currentPage + 1)} />
        }>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
