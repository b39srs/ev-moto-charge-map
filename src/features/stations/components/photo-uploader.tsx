'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface UploadedPhoto {
  path: string
  url: string
  preview: string
}

export function PhotoUploader() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    if (photos.length + files.length > 5) {
      setError('อัปโหลดได้สูงสุด 5 รูป')
      return
    }

    setUploading(true)
    setError(null)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('กรุณาเข้าสู่ระบบ')
      setUploading(false)
      return
    }

    const newPhotos: UploadedPhoto[] = []

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`ไฟล์ ${file.name} ใหญ่เกิน 5MB`)
        continue
      }

      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('station-photos')
        .upload(path, file, { contentType: file.type })

      if (uploadError) {
        setError(`อัปโหลด ${file.name} ล้มเหลว`)
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('station-photos').getPublicUrl(path)

      newPhotos.push({
        path,
        url: publicUrl,
        preview: URL.createObjectURL(file),
      })
    }

    setPhotos((prev) => [...prev, ...newPhotos])
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const removed = prev[index]
      if (removed.preview) URL.revokeObjectURL(removed.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">รูปภาพ (สูงสุด 5 รูป)</label>

      <div className="flex flex-wrap gap-3">
        {photos.map((photo, i) => (
          <div key={photo.path} className="relative h-24 w-24">
            <Image
              src={photo.preview}
              alt={`Photo ${i + 1}`}
              fill
              className="rounded-md border object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-white"
            >
              <X className="h-3 w-3" />
            </button>
            <input type="hidden" name="photo_paths" value={photo.path} />
            <input type="hidden" name="photo_urls" value={photo.url} />
          </div>
        ))}

        {photos.length < 5 && (
          <Button
            type="button"
            variant="outline"
            className="h-24 w-24"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="h-6 w-6" />
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {uploading && (
        <p className="text-sm text-muted-foreground">กำลังอัปโหลด...</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
