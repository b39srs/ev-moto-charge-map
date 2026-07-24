'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useRef, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { THAI_PROVINCES } from '@/lib/constants'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ConnectorType } from '@/types/entities'

interface StationFiltersProps {
  connectorTypes: ConnectorType[]
}

export function StationFilters({ connectorTypes }: StationFiltersProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const hasFilters =
    searchParams.has('search') ||
    searchParams.has('province') ||
    searchParams.has('connector') ||
    searchParams.has('free')

  const clearAll = useCallback(() => {
    if (searchInputRef.current) searchInputRef.current.value = ''
    startTransition(() => {
      router.push(pathname)
    })
  }, [router, pathname])

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // Reset to page 1 on filter change
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [searchParams, router, pathname]
  )

  return (
    <div className="mb-6 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          placeholder="ค้นหาสถานีชาร์จ..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(e) => {
            const timer = setTimeout(
              () => updateParam('search', e.target.value),
              400
            )
            return () => clearTimeout(timer)
          }}
          className="pl-10 pr-10"
        />
        {searchParams.get('search') && (
          <button
            type="button"
            onClick={() => {
              if (searchInputRef.current) searchInputRef.current.value = ''
              updateParam('search', '')
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={searchParams.get('province') ?? ''}
          onValueChange={(v) => updateParam('province', v === 'all' ? '' : v ?? '')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="จังหวัด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกจังหวัด</SelectItem>
            {THAI_PROVINCES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('connector') ?? ''}
          onValueChange={(v) =>
            updateParam('connector', v === 'all' ? '' : v ?? '')
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="หัวชาร์จ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกประเภท</SelectItem>
            {connectorTypes.map((ct) => (
              <SelectItem key={ct.id} value={ct.id}>
                {ct.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('sort') ?? 'newest'}
          onValueChange={(v) => updateParam('sort', v ?? 'newest')}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="เรียงตาม" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">ล่าสุด</SelectItem>
            <SelectItem value="rating">คะแนนสูงสุด</SelectItem>
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 rounded-md border px-3 py-2">
          <Checkbox
            checked={searchParams.get('free') === 'true'}
            onCheckedChange={(checked) =>
              updateParam('free', checked ? 'true' : '')
            }
          />
          <span className="text-sm">ฟรีเท่านั้น</span>
        </label>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="mr-1 h-3.5 w-3.5" />
            ล้างตัวกรอง
          </Button>
        )}
      </div>
    </div>
  )
}
