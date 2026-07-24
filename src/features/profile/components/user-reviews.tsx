import Link from 'next/link'
import { StarRating } from '@/components/ui/star-rating'
import { MessageSquare } from 'lucide-react'

interface UserReviewsProps {
  reviews: {
    id: string
    rating: number
    comment: string | null
    created_at: string
    charging_locations: {
      id: string
      name: string
    } | null
  }[]
}

export function UserReviews({ reviews }: UserReviewsProps) {
  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
        <p>คุณยังไม่ได้เขียนรีวิว</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <Link
          key={review.id}
          href={`/stations/${review.charging_locations?.id}`}
          className="block rounded-md border p-3 hover:bg-accent"
        >
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">
              {review.charging_locations?.name ?? 'สถานี'}
            </p>
            <StarRating value={review.rating} readonly size="sm" />
          </div>
          {review.comment && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {review.comment}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </Link>
      ))}
    </div>
  )
}
