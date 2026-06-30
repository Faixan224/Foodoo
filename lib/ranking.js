// Editor's Picks ranking rules.
//
// A dish must have at least MIN_RANK_REVIEWS ratings before it can earn a
// ranked "Editor's Picks" spot. This prevents a single high rating (e.g. one
// 5.0 review) from outranking dishes that have been rated many times.
// Dishes below the threshold are treated as "New" and listed after ranked ones.
//
// Among eligible dishes we still order by the database's `weighted_score`
// (a Bayesian average of stars and review count).
export const MIN_RANK_REVIEWS = 3
