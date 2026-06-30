/*
 * Seeds TEST restaurants + dishes into Supabase for development.
 *
 *   node scripts/seed-test-data.js
 *
 * Notes:
 * - Reads Supabase URL + anon key from .env.local.
 * - Idempotent: skips a restaurant that already has its dishes.
 * - Dish photos come from TheMealDB (real food images), logos from ui-avatars.
 * - branches are not writable with the anon key, and dishes.branch_id is NOT
 *   NULL, so dishes reuse an existing branch id as a placeholder FK (the branch
 *   is never displayed). Real restaurants/branches/dishes will come via the
 *   planned self-serve portal.
 */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
    .split('\n').filter(l => l.includes('=')).map(l => {
      const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// dishes.branch_id is NOT NULL but branches aren't anon-writable — reuse a branch.
const SHARED_BRANCH = '21ffbf6a-2be4-4ece-bcb9-aeeb9a8e8a74'

const cat = async (c) => { try { const r = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=' + c); const j = await r.json(); return (j.meals || []).map(m => m.strMealThumb) } catch { return [] } }
const search = async (q) => { try { const r = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + q); const j = await r.json(); return (j.meals || []).map(m => m.strMealThumb) } catch { return [] } }
const uniq = a => [...new Set(a)]

async function buildPools() {
  const [Starter, Side, Veget, Misc, Chicken, Beef, Lamb, Seafood, Pasta, Dessert, Breakfast] = await Promise.all(
    ['Starter', 'Side', 'Vegetarian', 'Miscellaneous', 'Chicken', 'Beef', 'Lamb', 'Seafood', 'Pasta', 'Dessert', 'Breakfast'].map(cat))
  const [pizza, burger, sandwich, noodle, curry, biryani, rice, soup, pancake] = await Promise.all(
    ['pizza', 'burger', 'sandwich', 'noodle', 'curry', 'biryani', 'rice', 'soup', 'pancake'].map(search))
  const appetizer = uniq([...Starter, ...Side, ...Misc, ...soup])
  return {
    starter: appetizer, veg: uniq([...Veget, ...Side]).length ? uniq([...Veget, ...Side]) : appetizer,
    side: uniq([...rice, ...Side]).length ? uniq([...rice, ...Side]) : appetizer,
    chicken: Chicken, beef: Beef, lamb: Lamb.length ? Lamb : Beef, seafood: Seafood,
    pasta: Pasta.length ? Pasta : appetizer, dessert: Dessert,
    breakfast: uniq([...Breakfast, ...pancake]).length ? uniq([...Breakfast, ...pancake]) : Dessert,
    burger: burger.length ? burger : Beef, sandwich: sandwich.length ? uniq([...sandwich, ...Starter]) : appetizer,
    pizza: pizza.length ? pizza : uniq([...Veget, ...Pasta]), noodle: noodle.length ? noodle : Chicken,
    curry: curry.length ? curry : Chicken, biryani: uniq([...biryani, ...rice]).length ? uniq([...biryani, ...rice]) : Chicken,
  }
}

const counters = {}
function pick(pools, b) { const pool = pools[b] && pools[b].length ? pools[b] : pools.starter; counters[b] = counters[b] || 0; const img = pool[counters[b] % pool.length]; counters[b]++; return img }
const logo = (name, color) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=${color}&color=ffffff&bold=true&length=2&format=png`

// See scripts/seed-test-data.js git history / chat for the full menu authoring.
const RESTAURANTS = require('./seed-restaurants.json')

async function main() {
  console.log('Fetching image pools...')
  const pools = await buildPools()
  for (const R of RESTAURANTS) {
    let { data: rest } = await s.from('restaurants').select('id').eq('slug', R.slug).single()
    if (!rest) {
      const { data, error } = await s.from('restaurants').insert({
        name: R.name, slug: R.slug, description: R.desc, logo_url: logo(R.name, R.color),
        cuisine_type: R.cuisine, city: 'Lahore', is_active: true, is_verified: true, avg_rating: 0, total_reviews: 0,
      }).select().single()
      if (error) { console.log('FAIL restaurant', R.name, error.message); continue }
      rest = data
    }
    const { count } = await s.from('dishes').select('*', { count: 'exact', head: true }).eq('restaurant_id', rest.id)
    if (count >= R.dishes.length) { console.log('SKIP dishes (exist):', R.name); continue }
    const rows = R.dishes.map((d, i) => ({
      restaurant_id: rest.id, branch_id: SHARED_BRANCH, dish_code: `${R.code}-${String(i + 1).padStart(2, '0')}`,
      name: d[0], category: d[1], price: d[2], description: d[4], photo_url: pick(pools, d[3]),
      status: 'active', is_available: true, avg_rating: 0, total_reviews: 0, weighted_score: 0,
    }))
    const { error } = await s.from('dishes').insert(rows)
    console.log(error ? 'FAIL dishes ' + R.name + ' ' + error.message : 'OK: ' + R.name + ' -> ' + rows.length + ' dishes')
  }
  const { count: rc } = await s.from('restaurants').select('*', { count: 'exact', head: true }).eq('is_active', true)
  const { count: dc } = await s.from('dishes').select('*', { count: 'exact', head: true }).eq('status', 'active')
  console.log(`\nDONE. Active restaurants: ${rc}, active dishes: ${dc}`)
}
main()
