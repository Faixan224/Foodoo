import { requireOwner } from '../../../../lib/dal'
import { getServerSupabase } from '../../../../lib/supabase-server'
import ReviewsClient from './ReviewsClient'

export const dynamic = 'force-dynamic'

export default async function PortalReviewsPage() {
  const user = await requireOwner()
  const supabase = await getServerSupabase()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('owner_id', user.id)
    .maybeSingle()

  let reviews = []
  let dishes = []
  if (restaurant) {
    const { data: dishRows } = await supabase
      .from('dishes')
      .select('id, name, photo_url')
      .eq('restaurant_id', restaurant.id)
    dishes = dishRows || []
    const dishIds = dishes.map((d) => d.id)

    if (dishIds.length) {
      const { data: revRows } = await supabase
        .from('reviews')
        .select('id, dish_id, stars, comment, nickname, tags, photo_url, is_verified, is_flagged, created_at')
        .in('dish_id', dishIds)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(200)
      reviews = revRows || []

      // Attach existing replies.
      const ids = reviews.map((r) => r.id)
      if (ids.length) {
        const { data: replies } = await supabase
          .from('review_replies')
          .select('review_id, reply_text, created_at')
          .in('review_id', ids)
        const rmap = Object.fromEntries((replies || []).map((x) => [x.review_id, x]))
        reviews.forEach((r) => { r.reply = rmap[r.id] || null })
      }
    }
  }

  const dishById = Object.fromEntries(dishes.map((d) => [d.id, d]))
  reviews.forEach((r) => { r.dish = dishById[r.dish_id] || null })

  return (
    <div>
      <style>{`
        .rv-head { font-size: 24px; font-weight: 800; color: #1A1A1A; }
        .rv-sub { font-size: 14px; color: #999; margin-top: 4px; margin-bottom: 24px; }
      `}</style>
      <div className="rv-head">Reviews</div>
      <div className="rv-sub">
        {reviews.length === 0
          ? 'Reviews on your dishes will appear here.'
          : `${reviews.length} review${reviews.length > 1 ? 's' : ''} across your dishes — reply once per review.`}
      </div>
      <ReviewsClient reviews={reviews} dishes={dishes} />
    </div>
  )
}
