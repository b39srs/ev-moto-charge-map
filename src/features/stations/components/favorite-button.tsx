'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { toggleFavorite } from '@/features/stations/actions/favorite-actions'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  locationId: string
  isFavorited: boolean
}

export function FavoriteButton({
  locationId,
  isFavorited,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(isFavorited)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleFavorite(locationId)
      if (result.success) {
        setFavorited(!favorited)
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Button
      variant={favorited ? 'default' : 'outline'}
      size="sm"
      disabled={isPending}
      onClick={handleToggle}
      className="gap-1.5"
    >
      <Heart
        className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`}
      />
      {favorited ? 'ถูกใจแล้ว' : 'ถูกใจ'}
    </Button>
  )
}
