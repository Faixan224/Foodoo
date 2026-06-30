import { supabase } from '../../../lib/supabase'
import { MIN_RANK_REVIEWS } from '../../../lib/ranking'
import DishClient from './DishClient'

async function getDish(id) {
  const { data } = await supabase
    .from('dishes')
    .select(`
      id, name, description, category, price, photo_url, video_url,
      avg_rating, total_reviews, verified_reviews, unverified_reviews,
      restaurants(id, name, slug, logo_url, cuisine_type),
      branches(name, area, city)
    `)
    .eq('id', id)
    .single()
  return data
}

async function getReviews(dishId) {
  const { data } = await supabase
    .from('reviews')
    .select('id, stars, comment, nickname, is_verified, created_at, tags')
    .eq('dish_id', dishId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(20)
  return data || []
}

async function getSimilarDishes(restaurantId, currentDishId) {
  const { data } = await supabase
    .from('dishes')
    .select('id, name, photo_url, avg_rating, price, restaurants(name)')
    .eq('restaurant_id', restaurantId)
    .neq('id', currentDishId)
    .eq('status', 'active')
    .limit(6)
  return data || []
}

export default async function DishPage({ params }) {
  const { id } = await params
  const dish = await getDish(id)
  const reviews = await getReviews(id)
  const similarDishes = dish ? await getSimilarDishes(dish.restaurants?.id, id) : []

  if (!dish) return (
    <div style={{ textAlign: 'center', padding: 60, fontFamily: 'sans-serif' }}>
      <p style={{ fontSize: 18, color: '#888' }}>Dish not found</p>
      <a href="/" style={{ color: '#F86D1C', textDecoration: 'none' }}>← Back to Home</a>
    </div>
  )

  // Get dish rank — same rule as home/restaurant Editor's Picks:
  // only dishes with enough reviews are ranked, ordered by weighted_score.
  const { data: rankData } = await supabase
    .from('dishes')
    .select('id')
    .gte('total_reviews', MIN_RANK_REVIEWS)
    .order('weighted_score', { ascending: false })
    .limit(10)
  const rank = rankData ? rankData.findIndex(d => d.id === dish.id) + 1 : 0

  return <DishClient dish={dish} reviews={reviews} similarDishes={similarDishes} rank={rank} />
}