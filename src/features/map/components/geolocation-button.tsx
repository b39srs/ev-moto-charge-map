'use client'

import { useState, useCallback } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import { LocateFixed, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface GeolocationButtonProps {
  onPositionChange: (position: { lat: number; lng: number }) => void
}

export function GeolocationButton({ onPositionChange }: GeolocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const map = useMap()

  const handleClick = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('เบราว์เซอร์ไม่รองรับ Geolocation')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const position = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        onPositionChange(position)
        map?.panTo(position)
        map?.setZoom(13)
        setIsLoading(false)
        toast.success('พบตำแหน่งของคุณแล้ว (จุดสีน้ำเงิน)')
      },
      (err) => {
        setIsLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('กรุณาอนุญาตการเข้าถึงตำแหน่ง')
        } else {
          toast.error('ไม่สามารถหาตำแหน่งได้')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [map, onPositionChange])

  return (
    <div className="m-2.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        title="ตำแหน่งของฉัน"
        className="flex h-10 w-10 items-center justify-center rounded-md border bg-white shadow-md hover:bg-accent disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <LocateFixed className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}
