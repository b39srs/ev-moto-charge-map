'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface MapSearchProps {
  onSearchChange: (value: string) => void
}

export function MapSearch({ onSearchChange }: MapSearchProps) {
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(inputValue)
    }, 400)
    return () => clearTimeout(timer)
  }, [inputValue, onSearchChange])

  return (
    <div className="m-2.5">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ค้นหาสถานีชาร์จ..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-[240px] bg-white pl-9 pr-8 shadow-md md:w-[300px]"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => setInputValue('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
