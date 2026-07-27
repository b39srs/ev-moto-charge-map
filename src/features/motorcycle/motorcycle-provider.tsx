'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

const STORAGE_KEY = 'ev_motorcycle'

export interface MotorcycleInfo {
  id: string
  displayName: string
}

interface MotorcycleContextValue {
  motorcycle: MotorcycleInfo | null
  setMotorcycle: (motorcycle: MotorcycleInfo | null) => void
  isReady: boolean
}

const MotorcycleContext = createContext<MotorcycleContextValue>({
  motorcycle: null,
  setMotorcycle: () => {},
  isReady: false,
})

interface MotorcycleProviderProps {
  children: React.ReactNode
  serverMotorcycle: MotorcycleInfo | null
  isLoggedIn: boolean
}

export function MotorcycleProvider({
  children,
  serverMotorcycle,
  isLoggedIn,
}: MotorcycleProviderProps) {
  const [guestMotorcycle, setGuestMotorcycle] =
    useState<MotorcycleInfo | null>(null)
  const [isReady, setIsReady] = useState(false)

  // On mount, read guest motorcycle from localStorage
  useEffect(() => {
    if (!isLoggedIn) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          setGuestMotorcycle(JSON.parse(stored) as MotorcycleInfo)
        }
      } catch {
        // ignore parse errors
      }
    }
    setIsReady(true)
  }, [isLoggedIn])

  // Logged-in users get serverMotorcycle; guests get localStorage value
  const motorcycle = isLoggedIn ? serverMotorcycle : guestMotorcycle

  const setMotorcycle = useCallback(
    (m: MotorcycleInfo | null) => {
      if (isLoggedIn) {
        // For logged-in users, optimistically update local state
        // The server action + revalidation will provide the real value
        // We don't persist to localStorage for logged-in users
        return
      }

      // Guest: persist to localStorage
      setGuestMotorcycle(m)
      try {
        if (m) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(m))
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        // ignore storage errors
      }
    },
    [isLoggedIn]
  )

  return (
    <MotorcycleContext.Provider value={{ motorcycle, setMotorcycle, isReady }}>
      {children}
    </MotorcycleContext.Provider>
  )
}

export function useMotorcycle(): MotorcycleContextValue {
  return useContext(MotorcycleContext)
}
