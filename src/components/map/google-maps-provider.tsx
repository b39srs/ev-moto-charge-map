'use client'

import { APIProvider } from '@vis.gl/react-google-maps'

interface GoogleMapsProviderProps {
  children: React.ReactNode
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>กรุณาเพิ่ม Google Maps API Key</p>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey} language="th" region="TH">
      {children}
    </APIProvider>
  )
}
