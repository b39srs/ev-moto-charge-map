'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface PhotoGalleryProps {
  photos: {
    id: string
    url: string
    caption: string | null
    category: string
  }[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<number | null>(null)

  if (photos.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelected(i)}
            className="relative aspect-[4/3] overflow-hidden rounded-md"
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? `Photo ${i + 1}`}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={() => setSelected(null)}
      >
        <DialogContent className="max-w-3xl p-0">
          <DialogTitle className="sr-only">ดูรูปภาพ</DialogTitle>
          {selected !== null && photos[selected] && (
            <div className="relative aspect-video w-full">
              <Image
                src={photos[selected].url}
                alt={photos[selected].caption ?? ''}
                fill
                className="object-contain"
              />
            </div>
          )}
          {selected !== null && photos[selected]?.caption && (
            <p className="px-4 pb-4 text-sm text-muted-foreground">
              {photos[selected].caption}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
