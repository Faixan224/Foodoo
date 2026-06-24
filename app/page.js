import { supabase } from '../lib/supabase'

async function getTopDishes() {
  const { data } = await supabase
    .from('dishes')
    .select('id, name, category, photo_url, avg_rating, total_reviews, weighted_score, price, restaurants(name)')
    .limit(8)
  return data || []
}

async function getTopRestaurants() {
  const { data } = await supabase
    .from('restaurants')
    .select('id, name, slug, logo_url, avg_rating, total_reviews, cuisine_type')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

export default async function Home() {
  const topDishes = await getTopDishes()
  const topRestaurants = await getTopRestaurants()

  const allCategories = [
    { name: 'Appetizer', img: '/icons/Appitizer.png' },
    { name: 'Burgers', img: '/icons/Burger.png' },
    { name: 'Pizza', img: '/icons/Pasta.png' },
    { name: 'Pasta', img: '/icons/Chinese.png' },
    { name: 'Sandwich', img: '/icons/Sandwich.png' },
    { name: 'Meat', img: '/icons/Meat.png' },
    { name: 'Chinese', img: '/icons/Chinese.png' },
    { name: 'Fried Chicken', img: '/icons/FriedChicken.png' },
    { name: 'Seafood', img: '/icons/Seafood.png' },
    { name: 'Desserts', img: '/icons/Desert.png' },
  ]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; }
        .header { padding: 20px 20px 0; background: #fff; }
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .logo { font-size: 28px; font-weight: 900; color: #1A1A1A; letter-spacing: -1px; line-height: 1; }
        .logo span { color: #F86D1C; }
        .logo-sub { font-size: 13px; color: #555; margin-top: 4px; font-weight: 400; line-height: 1.4; }
        .header-icons { display: flex; align-items: center; gap: 12px; }
        .bell-btn { width: 42px; height: 42px; border-radius: 50%; background: #F5F5F5; display: flex; align-items: center; justify-content: center; position: relative; text-decoration: none; }
        .bell-dot { width: 9px; height: 9px; background: #F86D1C; border-radius: 50%; position: absolute; top: 9px; right: 10px; border: 1.5px solid #fff; }
        .avatar { width: 42px; height: 42px; border-radius: 50%; background: #ddd; overflow: hidden; display: flex; align-items: center; justify-content: center; text-decoration: none; }
        .search-wrap { padding: 0 20px 16px; background: #fff; }
        .search-bar { display: flex; align-items: center; background: #F7F7F7; border-radius: 50px; padding: 0 6px 0 18px; gap: 10px; height: 52px; }
        .search-btn { width: 40px; height: 40px; background: #F86D1C; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-decoration: none; }
        .cats-wrap { padding: 0 20px 16px; background: #fff; }
        .cats-scroll { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; }
        .cats-scroll::-webkit-scrollbar { display: none; }
        .cat-pill { display: flex; align-items: center; gap: 7px; background: #fff; border: 1.5px solid #E8E8E8; border-radius: 50px; padding: 8px 16px; text-decoration: none; white-space: nowrap; flex-shrink: 0; }
        .cat-name { font-size: 14px; color: #1A1A1A; font-weight: 500; }
        .cat-more-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 8px 14px; border: 1.5px solid #E8E8E8; border-radius: 50px; background: #fff; cursor: pointer; flex-shrink: 0; }
        .cat-more-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .cat-more-dot { width: 5px; height: 5px; background: #888; border-radius: 1px; }
        .cat-more-label { font-size: 11px; color: #888; font-weight: 500; }
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
        .drawer-overlay.open { opacity: 1; pointer-events: all; }
        .drawer { position: fixed; top: 0; right: -100%; width: min(340px, 85vw); height: 100vh; background: #fff; z-index: 201; transition: right 0.3s ease; padding: 24px 20px; overflow-y: auto; box-shadow: -4px 0 24px rgba(0,0,0,0.12); }
        .drawer.open { right: 0; }
        .drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .drawer-title { font-size: 18px; font-weight: 800; color: #1A1A1A; }
        .drawer-close { width: 36px; height: 36px; border-radius: 50%; background: #F5F5F5; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; }
        .drawer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .drawer-cat { display: flex; align-items: center; gap: 10px; background: #FAFAFA; border: 1.5px solid #F0F0F0; border-radius: 14px; padding: 12px 16px; text-decoration: none; }
        .drawer-cat:hover { border-color: #F86D1C; background: #FFF3ED; }
        .drawer-cat-name { font-size: 14px; font-weight: 600; color: #1A1A1A; }
        .stats-wrap { padding: 0 20px 20px; background: #fff; }
        .stats-banner { background: #FFF3ED; border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; }
        .stats-avatars { display: flex; }
        .stats-av { width: 30px; height: 30px; border-radius: 50%; background: #ddd; overflow: hidden; border: 2px solid #FFF3ED; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .stats-av + .stats-av { margin-left: -8px; }
        .stats-text { flex: 1; font-size: 13px; color: #1A1A1A; font-weight: 500; line-height: 1.4; }
        .stats-badge { width: 36px; height: 36px; background: #F86D1C; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .section { padding: 0 20px; margin-bottom: 28px; }
        .section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .section-title { font-size: 18px; font-weight: 800; color: #1A1A1A; display: flex; align-items: center; gap: 6px; }
        .section-sub { font-size: 12px; color: #999; margin-top: 3px; font-weight: 400; }
        .view-all { font-size: 13px; color: #F86D1C; font-weight: 600; text-decoration: none; white-space: nowrap; margin-top: 2px; }
        .dish-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .dish-card { background: #fff; border-radius: 16px; overflow: hidden; text-decoration: none; display: block; border: 1px solid #F0F0F0; }
        .dish-img-wrap { position: relative; height: 160px; background: #F5F5F5; overflow: hidden; }
        .dish-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .dish-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #1A1A1A; }
        .dish-rank-badge { position: absolute; top: 10px; left: 10px; background: #F86D1C; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 9px; border-radius: 8px; }
        .dish-save-btn { position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .dish-info { padding: 10px 12px 12px; }
        .dish-name { font-size: 14px; font-weight: 700; color: #1A1A1A; line-height: 1.3; }
        .dish-rest-name { font-size: 12px; color: #888; margin-top: 3px; }
        .dish-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
        .dish-rating { display: flex; align-items: center; gap: 4px; }
        .dish-stars { color: #F86D1C; font-size: 13px; }
        .dish-rating-val { font-size: 13px; font-weight: 700; color: #1A1A1A; }
        .dish-rating-count { font-size: 12px; color: #999; }
        .dish-price { font-size: 12px; color: #555; font-weight: 500; }
        .rest-scroll { display: flex; gap: 16px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
        .rest-scroll::-webkit-scrollbar { display: none; }
        .rest-card { display: flex; flex-direction: column; align-items: center; text-decoration: none; flex-shrink: 0; width: 80px; }
        .rest-logo { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; background: #F5F5F5; display: flex; align-items: center; justify-content: center; border: 2px solid #F0F0F0; margin-bottom: 8px; }
        .rest-logo img { width: 100%; height: 100%; object-fit: cover; }
        .rest-name { font-size: 12px; font-weight: 700; color: #1A1A1A; text-align: center; line-height: 1.3; }
        .rest-cuisine { font-size: 11px; color: #999; text-align: center; margin-top: 2px; }
        .rest-meta { display: flex; align-items: center; gap: 4px; margin-top: 4px; justify-content: center; flex-wrap: wrap; }
        .rest-rating { font-size: 11px; font-weight: 600; color: #1A1A1A; }
        .rest-time { font-size: 11px; color: #4CAF50; }
        .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #F0F0F0; display: flex; justify-content: space-around; padding: 10px 0 24px; z-index: 100; }
        .nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; text-decoration: none; }
        .nav-label { font-size: 10px; color: #999; }
        .nav-label.active { color: #F86D1C; font-weight: 700; }
        .empty { text-align: center; padding: 48px 0; color: #CCC; }
        .empty p { font-size: 13px; margin-top: 12px; color: #BBB; }
        @media (min-width: 768px) {
          .header { padding: 24px 40px 0; } .search-wrap { padding: 16px 40px; } .cats-wrap { padding: 0 40px 16px; } .stats-wrap { padding: 0 40px 24px; } .section { padding: 0 40px; } .dish-grid { grid-template-columns: repeat(4, 1fr); } .bottom-nav { display: none; } .dish-img-wrap { height: 180px; } .logo { font-size: 34px; }
        }
        @media (min-width: 1200px) {
          .header { padding: 28px 80px 0; } .search-wrap { padding: 20px 80px; } .cats-wrap { padding: 0 80px 20px; } .stats-wrap { padding: 0 80px 28px; } .section { padding: 0 80px; } .dish-img-wrap { height: 200px; }
        }
      `}</style>

      <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: 80 }}>
        <div className="header">
          <div className="header-top">
            <div>
              <div className="logo">Food<span>oo</span></div>
              <div className="logo-sub">Find the best dish before<br/>you order</div>
            </div>
            <div className="header-icons">
              <a href="/notifications" className="bell-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div className="bell-dot"></div>
              </a>
              <a href="/profile" className="avatar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#888" strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#BBB" strokeWidth="2"/><path d="M16.5 16.5L21 21" stroke="#BBB" strokeWidth="2" strokeLinecap="round"/></svg>
            <a href="/search" style={{ flex: 1, fontSize: 15, color: '#BBB', textDecoration: 'none', lineHeight: '40px' }}>What are you craving today?</a>
            <a href="/search" className="search-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2"/><path d="M16.5 16.5L21 21" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </a>
          </div>
        </div>

        <div className="cats-wrap">
          <div className="cats-scroll">
            {allCategories.map(cat => (
              <a key={cat.name} href={'/search?category=' + cat.name} className="cat-pill">
                <img src={cat.img} alt={cat.name} width="28" height="28" style={{ display: 'block', objectFit: 'contain' }} />
                <span className="cat-name">{cat.name}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="stats-wrap">
          <div className="stats-banner">
            <div className="stats-avatars">
              <div className="stats-av">👨</div><div className="stats-av">👩</div><div className="stats-av">🧑</div>
            </div>
            <span className="stats-text">Over 25,000 dishes rated by real food lovers</span>
            <div className="stats-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div>
              <div className="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFB800"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Editor's picks
              </div>
              <div className="section-sub">Dishes loved by everyone, rated by real food lovers</div>
            </div>
            <a href="/search" className="view-all">View all ›</a>
          </div>
          {topDishes.length === 0 ? (
            <div className="empty">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto', display: 'block' }}><circle cx="12" cy="12" r="9" stroke="#E0E0E0" strokeWidth="1.5"/><path d="M8 12h8M12 8v8" stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <p>No dishes yet — coming soon!</p>
            </div>
          ) : (
            <div className="dish-grid">
              {topDishes.map((dish, i) => (
                <a key={dish.id} href={'/dish/' + dish.id} className="dish-card">
                  <div className="dish-img-wrap">
                    {dish.photo_url ? <img src={dish.photo_url} alt={dish.name}/> : <div className="dish-img-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#444" strokeWidth="1.5"/></svg></div>}
                    <div className="dish-rank-badge">#{i + 1}</div>
                    <div className="dish-save-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 3 14 3 8a5 5 0 019-3 5 5 0 019 3c0 6-9 13-9 13z" stroke="#1A1A1A" strokeWidth="2" fill="none"/></svg></div>
                  </div>
                  <div className="dish-info">
                    <div className="dish-name">{dish.name}</div>
                    <div className="dish-rest-name">{dish.restaurants?.name || ''}</div>
                    <div className="dish-bottom">
                      <div className="dish-rating">
                        <span className="dish-stars">★</span>
                        <span className="dish-rating-val">{dish.avg_rating ? dish.avg_rating.toFixed(1) : 'New'}</span>
                        <span className="dish-rating-count">({dish.total_reviews})</span>
                      </div>
                      {dish.price && <span className="dish-price">Rs. {dish.price}</span>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="section" style={{ marginTop: 32 }}>
          <div className="section-header">
            <div>
              <div className="section-title">Top Restaurants</div>
              <div className="section-sub">Most loved restaurants by food lovers</div>
            </div>
            <a href="/restaurants" className="view-all">View all ›</a>
          </div>
          {topRestaurants.length === 0 ? (
            <div className="empty"><p>Restaurants coming soon!</p></div>
          ) : (
            <div className="rest-scroll">
              {topRestaurants.map((r) => (
                <a key={r.id} href={'/restaurant/' + r.slug} className="rest-card">
                  <div className="rest-logo">{r.logo_url ? <img src={r.logo_url} alt={r.name}/> : <span style={{ fontSize: 26 }}>🏪</span>}</div>
                  <div className="rest-name">{r.name}</div>
                  <div className="rest-cuisine">{r.cuisine_type?.join(', ') || 'Restaurant'}</div>
                  <div className="rest-meta">
                    <span className="dish-stars" style={{ fontSize: 11 }}>★</span>
                    <span className="rest-rating">{r.avg_rating ? r.avg_rating.toFixed(1) : 'New'}</span>
                    <span className="rest-time">🟢 25-35 min</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="bottom-nav">
        {[
          { label: 'Home', href: '/', active: true, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9" stroke="#F86D1C" strokeWidth="2" strokeLinecap="round"/><path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" stroke="#F86D1C" strokeWidth="2" strokeLinecap="round"/></svg> },
          { label: 'Search', href: '/search', active: false, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#999" strokeWidth="2"/><path d="M16.5 16.5L21 21" stroke="#999" strokeWidth="2" strokeLinecap="round"/></svg> },
          { label: 'Saved', href: '/saved', active: false, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 3 14 3 8a5 5 0 019-3 5 5 0 019 3c0 6-9 13-9 13z" stroke="#999" strokeWidth="2"/></svg> },
          { label: 'Profile', href: '/profile', active: false, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#999" strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#999" strokeWidth="2" strokeLinecap="round"/></svg> },
        ].map(item => (
          <a key={item.label} href={item.href} className="nav-item">
            {item.icon}
            <span className={'nav-label' + (item.active ? ' active' : '')}>{item.label}</span>
          </a>
        ))}
      </nav>
    </>
  )
}