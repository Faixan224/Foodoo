import { supabase } from '../../../lib/supabase'

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

  const stars = [1,2,3,4,5]
  const rating = dish.avg_rating || 0
  const breakdown = [5,4,3,2,1].map(s => {
    const count = reviews.filter(r => r.stars === s).length
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
    return { star: s, pct }
  })

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; }
        .page { background: #FAF8F5; min-height: 100vh; padding-bottom: 100px; }

        .top-bar { position: absolute; top: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; z-index: 10; }
        .icon-btn { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.92); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; text-decoration: none; }
        .top-right { display: flex; gap: 10px; }

        .hero { position: relative; height: 300px; background: #1A1A1A; overflow: hidden; }
        .hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hero-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .dots { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.5); }
        .dot.active { background: #F86D1C; width: 20px; border-radius: 4px; }

        .card { background: #fff; border-radius: 24px 24px 0 0; margin-top: -20px; position: relative; padding: 22px 20px 0; }

        .title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
        .dish-name { font-size: 22px; font-weight: 800; color: #1A1A1A; line-height: 1.2; flex: 1; }
        .rating-pill { display: flex; align-items: center; gap: 5px; background: #F86D1C; color: #fff; font-size: 14px; font-weight: 700; padding: 6px 12px; border-radius: 10px; white-space: nowrap; flex-shrink: 0; }

        .rest-link { display: inline-flex; align-items: center; gap: 5px; text-decoration: none; margin-bottom: 16px; margin-top: 4px; }
        .rest-link-name { font-size: 14px; color: #F86D1C; font-weight: 600; }

        .info-pills { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
        .info-pill { display: flex; align-items: center; gap: 8px; background: #F7F7F7; border-radius: 12px; padding: 10px 14px; }
        .pill-label { font-size: 10px; color: #999; margin-top: 1px; }
        .pill-value { font-size: 13px; font-weight: 700; color: #1A1A1A; }

        .desc { font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 6px; }
        .read-more { font-size: 14px; color: #F86D1C; font-weight: 600; background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 20px; display: block; }

        .divider { height: 8px; background: #F7F7F7; margin: 0 -20px 22px; }

        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .section-title { font-size: 17px; font-weight: 800; color: #1A1A1A; }
        .see-all { font-size: 13px; color: #F86D1C; font-weight: 600; text-decoration: none; }

        .ratings-wrap { display: flex; gap: 20px; align-items: center; margin-bottom: 22px; }
        .big-rating { text-align: center; flex-shrink: 0; min-width: 80px; }
        .big-number { font-size: 48px; font-weight: 900; color: #1A1A1A; line-height: 1; }
        .big-stars { display: flex; gap: 3px; justify-content: center; margin: 6px 0 4px; }
        .big-star { color: #F86D1C; font-size: 15px; }
        .big-star.empty { color: #DDD; }
        .big-count { font-size: 12px; color: #999; }
        .bars { flex: 1; }
        .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
        .bar-label { font-size: 12px; color: #F86D1C; width: 10px; flex-shrink: 0; }
        .bar-track { flex: 1; height: 6px; background: #F0F0F0; border-radius: 3px; overflow: hidden; }
        .bar-fill { height: 100%; background: #F86D1C; border-radius: 3px; transition: width 0.3s; }
        .bar-pct { font-size: 11px; color: #999; width: 28px; text-align: right; flex-shrink: 0; }

        .review-card { display: flex; gap: 12px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #F5F5F5; }
        .reviewer-avatar { width: 40px; height: 40px; border-radius: 50%; background: #F0EDE8; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .review-body { flex: 1; }
        .review-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .reviewer-name { font-size: 14px; font-weight: 700; color: #1A1A1A; }
        .review-time { font-size: 11px; color: #BBB; margin: 2px 0 6px; }
        .review-stars { display: flex; gap: 2px; }
        .rev-star { color: #F86D1C; font-size: 13px; }
        .rev-star.empty { color: #DDD; }
        .review-text { font-size: 14px; color: #444; line-height: 1.5; }
        .verified-badge { display: inline-flex; align-items: center; gap: 4px; background: #E8F5E9; color: #2E7D32; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; margin-top: 6px; }

        .similar-scroll { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
        .similar-scroll::-webkit-scrollbar { display: none; }
        .similar-card { flex-shrink: 0; width: 130px; text-decoration: none; display: block; }
        .similar-img-wrap { width: 130px; height: 100px; border-radius: 12px; background: #1A1A1A; overflow: hidden; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; }
        .similar-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .similar-name { font-size: 13px; font-weight: 700; color: #1A1A1A; line-height: 1.3; }
        .similar-rest { font-size: 11px; color: #999; margin-top: 2px; }
        .similar-meta { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
        .s-star { color: #F86D1C; font-size: 12px; }
        .s-rating { font-size: 12px; font-weight: 600; color: #1A1A1A; }
        .s-price { font-size: 12px; color: #888; }

        /* FIXED BOTTOM BAR - always visible */
        .bottom-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fff;
          border-top: 1px solid #F0F0F0;
          padding: 12px 20px 28px;
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 999;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
        }
        .bottom-price-wrap { flex-shrink: 0; }
        .bottom-price-label { font-size: 11px; color: #999; }
        .bottom-price { font-size: 18px; font-weight: 800; color: #1A1A1A; }
        .rate-btn {
          flex: 1;
          background: #F86D1C;
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 15px;
          font-size: 16px;
          font-weight: 700;
          text-align: center;
          cursor: pointer;
          text-decoration: none;
          display: block;
        }

        .empty-state { text-align: center; padding: 32px 0; color: #BBB; }
        .empty-state p { font-size: 14px; margin-top: 8px; }

        @media (min-width: 768px) {
          .hero { height: 420px; }
          .card { max-width: 100%; margin: -20px 0 0; border-radius: 0; padding: 28px 40px 0; }
          .bottom-bar { left: 0; right: 0; transform: none; padding: 14px 40px 28px; }
          .dish-name { font-size: 28px; }
          .info-pills { gap: 14px; }
        }
        @media (min-width: 1200px) {
          .hero { height: 500px; }
          .card { padding: 32px 80px 0; }
          .bottom-bar { padding: 14px 80px 28px; }
        }
      `}</style>

      <div className="page">

        {/* TOP BAR */}
        <div className="top-bar">
          <a href="/" className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <div className="top-right">
            <button className="icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 21C12 21 3 14 3 8a5 5 0 019-3 5 5 0 019 3c0 6-9 13-9 13z" stroke="#E53935" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </button>
          </div>
        </div>

        {/* HERO IMAGE */}
        <div className="hero">
          {dish.photo_url
            ? <img src={dish.photo_url} alt={dish.name} />
            : <div className="hero-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#444" strokeWidth="1.5"/>
                  <path d="M8 12h8M12 8v8" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
          }
          <div className="dots">
            <div className="dot active"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="card">

          {/* TITLE + RATING */}
          <div className="title-row">
            <div className="dish-name">{dish.name}</div>
            {rating > 0 && (
              <div className="rating-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {rating.toFixed(1)}
              </div>
            )}
          </div>
          {dish.total_reviews > 0 && <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>({dish.total_reviews} reviews)</div>}

          {/* RESTAURANT */}
          {dish.restaurants && (
            <a href={'/restaurant/' + dish.restaurants.slug} className="rest-link">
              <span className="rest-link-name">{dish.restaurants.name}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="#F86D1C" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </a>
          )}

          {/* INFO PILLS */}
          <div className="info-pills">
            {dish.price && (
              <div className="info-pill">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#F86D1C" strokeWidth="1.5"/><path d="M12 7v10M9 9.5h4.5a1.5 1.5 0 010 3H10a1.5 1.5 0 000 3H15" stroke="#F86D1C" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <div>
                  <div className="pill-value">Rs. {dish.price}</div>
                  <div className="pill-label">Price</div>
                </div>
              </div>
            )}
            <div className="info-pill">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#F86D1C" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="#F86D1C" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <div>
                <div className="pill-value">20-30 min</div>
                <div className="pill-label">Prep time</div>
              </div>
            </div>
            {dish.restaurants?.cuisine_type?.[0] && (
              <div className="info-pill">
                <span style={{ fontSize: 18 }}>🍽️</span>
                <div>
                  <div className="pill-value">{dish.restaurants.cuisine_type[0]}</div>
                  <div className="pill-label">Cuisine</div>
                </div>
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          {dish.description && (
            <>
              <p className="desc">{dish.description}</p>
              <button className="read-more">Read more</button>
            </>
          )}

          <div className="divider"></div>

          {/* RATINGS & REVIEWS */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-header">
              <div className="section-title">Ratings & Reviews</div>
              <a href="#reviews" className="see-all">See all</a>
            </div>
            <div className="ratings-wrap">
              <div className="big-rating">
                <div className="big-number">{rating > 0 ? rating.toFixed(1) : '—'}</div>
                <div className="big-stars">
                  {stars.map(s => (
                    <span key={s} className={'big-star' + (s <= Math.round(rating) ? '' : ' empty')}>★</span>
                  ))}
                </div>
                <div className="big-count">({dish.total_reviews})</div>
              </div>
              <div className="bars">
                {breakdown.map(b => (
                  <div key={b.star} className="bar-row">
                    <span className="bar-label">{b.star}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: b.pct + '%' }}></div>
                    </div>
                    <span className="bar-pct">{b.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* REVIEW LIST */}
          <div id="reviews" style={{ marginBottom: 24 }}>
            {reviews.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                  <circle cx="12" cy="12" r="9" stroke="#DDD" strokeWidth="1.5"/>
                  <path d="M8 12h8" stroke="#DDD" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p>No reviews yet — be the first!</p>
              </div>
            ) : (
              reviews.map(r => (
                <div key={r.id} className="review-card">
                  <div className="reviewer-avatar">👤</div>
                  <div className="review-body">
                    <div className="review-top">
                      <span className="reviewer-name">{r.nickname || 'Anonymous Foodie'}</span>
                      <div className="review-stars">
                        {stars.map(s => (
                          <span key={s} className={'rev-star' + (s <= r.stars ? '' : ' empty')}>★</span>
                        ))}
                      </div>
                    </div>
                    <div className="review-time">{new Date(r.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    {r.comment && <div className="review-text">{r.comment}</div>}
                    {r.is_verified && (
                      <div className="verified-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round"/></svg>
                        Verified Visit
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PEOPLE ALSO LOVE */}
          {similarDishes.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="divider"></div>
              <div className="section-header">
                <div className="section-title">People also love</div>
                <a href={'/restaurant/' + dish.restaurants?.slug} className="see-all">View all</a>
              </div>
              <div className="similar-scroll">
                {similarDishes.map(d => (
                  <a key={d.id} href={'/dish/' + d.id} className="similar-card">
                    <div className="similar-img-wrap">
                      {d.photo_url
                        ? <img src={d.photo_url} alt={d.name} />
                        : <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#555" strokeWidth="1.5"/></svg>
                      }
                    </div>
                    <div className="similar-name">{d.name}</div>
                    <div className="similar-rest">{d.restaurants?.name}</div>
                    <div className="similar-meta">
                      <span className="s-star">★</span>
                      <span className="s-rating">{d.avg_rating > 0 ? d.avg_rating.toFixed(1) : 'New'}</span>
                      {d.price && <span className="s-price">· Rs. {d.price}</span>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* FIXED BOTTOM BAR */}
      <div className="bottom-bar">
        <div style={{ flex: 1 }}>
          <div style={{ textAlign: 'center', fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 6 }}>Have you tried this Dish?</div>
          <a href={'/review/' + dish.id} className="rate-btn">⭐ Rate this Dish</a>
        </div>
      </div>
    </>
  )
}