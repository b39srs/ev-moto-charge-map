import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReviewCard } from './review-card'
import { ReviewForm } from './review-form'
import Link from 'next/link'

interface ReviewsSectionProps {
  locationId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviews: any[]
  currentUserId?: string
  hasReviewed: boolean
}

export function ReviewsSection({
  locationId,
  reviews,
  currentUserId,
  hasReviewed,
}: ReviewsSectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>รีวิว ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={currentUserId}
              />
            ))
          ) : (
            <p className="text-muted-foreground">ยังไม่มีรีวิว เป็นคนแรกที่รีวิว!</p>
          )}
        </CardContent>
      </Card>

      {currentUserId ? (
        hasReviewed ? (
          <Card>
            <CardContent className="py-4 text-center text-sm text-muted-foreground">
              คุณได้รีวิวสถานีนี้แล้ว
            </CardContent>
          </Card>
        ) : (
          <ReviewForm locationId={locationId} />
        )
      ) : (
        <Card>
          <CardContent className="py-4 text-center">
            <Link href="/login" className="text-sm text-primary hover:underline">
              เข้าสู่ระบบเพื่อเขียนรีวิว
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
