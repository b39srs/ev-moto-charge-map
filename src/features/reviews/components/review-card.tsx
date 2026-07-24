'use client'

import { useState, useTransition } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/star-rating'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteReview } from '@/features/reviews/actions/review-actions'
import { toast } from 'sonner'

interface ReviewCardProps {
  review: {
    id: string
    location_id: string
    user_id: string
    rating: number
    comment: string | null
    visit_date: string | null
    is_edited: boolean
    created_at: string
    profiles: {
      full_name: string | null
      avatar_url: string | null
    } | null
  }
  currentUserId?: string
}

export function ReviewCard({ review, currentUserId }: ReviewCardProps) {
  const [isDeleting, startTransition] = useTransition()
  const [deleted, setDeleted] = useState(false)
  const isOwner = currentUserId === review.user_id

  if (deleted) return null

  const initials = review.profiles?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  function handleDelete() {
    if (!confirm('คุณต้องการลบรีวิวนี้หรือไม่?')) return
    startTransition(async () => {
      const result = await deleteReview(review.id, review.location_id)
      if (result.success) {
        setDeleted(true)
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="flex gap-3 border-b pb-4 last:border-0">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={review.profiles?.avatar_url ?? undefined} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {review.profiles?.full_name ?? 'ผู้ใช้งาน'}
          </span>
          {review.is_edited && (
            <Badge variant="outline" className="text-xs">
              แก้ไขแล้ว
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <StarRating value={review.rating} readonly size="sm" />
          {review.visit_date && (
            <span className="text-xs text-muted-foreground">
              ไปเมื่อ{' '}
              {new Date(review.visit_date).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>

        {review.comment && (
          <p className="text-sm whitespace-pre-wrap">{review.comment}</p>
        )}

        <p className="text-xs text-muted-foreground">
          {new Date(review.created_at).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>

        {isOwner && (
          <div className="flex gap-1 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              ลบ
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
