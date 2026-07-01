// Reviewer ranks — single source of truth (used by the profile page and the
// global RankUp celebration watcher).
export const RANKS = [
  { name: 'Foodie', min: 0, max: 2, color: '#4CAF50', desc: 'Start your journey as a foodie!', slug: 'foodie' },
  { name: 'Food Explorer', min: 3, max: 9, color: '#2196F3', desc: 'Explore more dishes and grow!', slug: 'food-explorer' },
  { name: 'Food Critic', min: 10, max: 24, color: '#9C27B0', desc: 'Great opinions come from experience!', slug: 'food-critic' },
  { name: 'Food Authority', min: 25, max: 49, color: '#F86D1C', desc: "You're trusted by the community!", slug: 'food-authority' },
  { name: 'Foodoo Legend', min: 50, max: Infinity, color: '#FFB800', desc: 'Top reviewer on Foodoo!', slug: 'foodoo-legend' },
]

export function rankIndexFor(count) {
  return RANKS.findIndex(r => count >= r.min && count <= r.max)
}
