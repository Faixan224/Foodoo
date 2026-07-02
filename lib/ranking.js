// Editor's Picks ranking rules.
//
// A dish must have at least MIN_RANK_REVIEWS ratings before it can rank by its
// score — this stops a single high rating (e.g. one 5.0 review) from jumping to
// the top. Dishes that clear the bar are ordered by the database's
// `weighted_score` (a Bayesian average of stars and review count). The
// remaining slots are filled with the newest dishes so the grid always has a
// full top-10.
//
// getEditorsPicks() is the single source of truth used by the home grid, the
// "View all" page, and the rank badges on the dish & restaurant pages, so every
// #N is identical wherever it appears.
export const MIN_RANK_REVIEWS = 3
export const EDITORS_PICKS_LIMIT = 10

const DISH_COLUMNS =
  'id, name, category, photo_url, avg_rating, total_reviews, weighted_score, price, restaurants(name)'

export async function getEditorsPicks(supabase, { columns = DISH_COLUMNS, limit = EDITORS_PICKS_LIMIT } = {}) {
  const { data: ranked } = await supabase
    .from('dishes')
    .select(columns)
    .gte('total_reviews', MIN_RANK_REVIEWS)
    .eq('is_available', true)
    .order('weighted_score', { ascending: false })
    .limit(limit)

  // Dishes that genuinely qualified for a rank carry _ranked = true; grid
  // fillers don't, so "#N in Editor's Picks" badges never show on a dish
  // that hasn't earned its rank yet.
  const rankedList = (ranked || []).map(d => ({ ...d, _ranked: true }))
  const needed = limit - rankedList.length
  if (needed <= 0) return rankedList.slice(0, limit)

  // Ranked dishes have >= MIN_RANK_REVIEWS and fill dishes have fewer, so the
  // two sets never overlap; the filter below is just defensive.
  const rankedIds = new Set(rankedList.map(d => d.id))
  const { data: fill } = await supabase
    .from('dishes')
    .select(columns)
    .lt('total_reviews', MIN_RANK_REVIEWS)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(needed)

  const fillList = (fill || []).filter(d => !rankedIds.has(d.id)).map(d => ({ ...d, _ranked: false }))
  return [...rankedList, ...fillList].slice(0, limit)
}
