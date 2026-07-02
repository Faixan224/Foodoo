import { requireOwner } from '../../../lib/dal'
import { getServerSupabase } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function PortalDashboard() {
  const user = await requireOwner()

  // NOTE: filter by owner_id explicitly — the public-read RLS policy means an
  // authenticated user can see ALL active restaurants, so maybeSingle() without
  // the filter returns null (multiple rows).
  const supabase = await getServerSupabase()
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, city, code_prefix, is_verified, avg_rating, total_reviews')
    .eq('owner_id', user.id)
    .maybeSingle()

  let branchCount = 0
  let dishCount = 0
  if (restaurant) {
    const [b, d] = await Promise.all([
      supabase.from('branches').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id),
      supabase.from('dishes').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id).neq('status', 'discontinued'),
    ])
    branchCount = b.count ?? 0
    dishCount = d.count ?? 0
  }

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .dash-head { font-size: 24px; font-weight: 800; color: #1A1A1A; }
        .dash-sub { font-size: 14px; color: #999; margin-top: 4px; margin-bottom: 26px; }
        .rest-card { background: #fff; border: 1px solid #EEE; border-radius: 16px; padding: 22px 24px; display: flex; align-items: center; gap: 18px; margin-bottom: 22px; animation: fadeUp 0.4s ease both; }
        .rest-badge { width: 54px; height: 54px; border-radius: 14px; background: #FFF3ED; color: #F86D1C; font-weight: 900; font-size: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rest-name { font-size: 18px; font-weight: 800; color: #1A1A1A; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .rest-meta { font-size: 13px; color: #999; margin-top: 3px; }
        .vchip { font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 20px; }
        .vchip.yes { background: #E8F5E9; color: #2E7D32; }
        .vchip.no { background: #F3F3F3; color: #999; }
        .stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 26px; }
        @media (max-width: 900px) { .stat-row { grid-template-columns: repeat(2, 1fr); } }
        .stat { background: #fff; border: 1px solid #EEE; border-radius: 14px; padding: 18px 20px; text-decoration: none; display: block; animation: fadeUp 0.4s ease both; transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease; }
        .stat:nth-child(2) { animation-delay: 0.05s; } .stat:nth-child(3) { animation-delay: 0.1s; } .stat:nth-child(4) { animation-delay: 0.15s; }
        a.stat:hover { transform: translateY(-2px); border-color: #F86D1C; box-shadow: 0 6px 18px rgba(0,0,0,0.07); }
        .stat-val { font-size: 26px; font-weight: 900; color: #1A1A1A; }
        .stat-lbl { font-size: 12px; color: #999; margin-top: 3px; }
        .qa-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; animation: fadeUp 0.4s ease 0.1s both; }
        @media (max-width: 700px) { .qa-row { grid-template-columns: 1fr; } }
        .qa { background: #fff; border: 1px solid #EEE; border-radius: 16px; padding: 20px 22px; text-decoration: none; transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease; display: block; }
        .qa:hover { transform: translateY(-2px); border-color: #F86D1C; box-shadow: 0 6px 18px rgba(0,0,0,0.07); }
        .qa-t { font-size: 15px; font-weight: 800; color: #1A1A1A; margin-bottom: 4px; }
        .qa-s { font-size: 12px; color: #888; line-height: 1.5; }
        .qa-go { font-size: 13px; color: #F86D1C; font-weight: 700; margin-top: 10px; display: inline-block; }
      `}</style>

      <div className="dash-head">Dashboard</div>
      <div className="dash-sub">Welcome back — here's your restaurant at a glance.</div>

      {restaurant ? (
        <>
          <div className="rest-card">
            <div className="rest-badge">{restaurant.code_prefix || restaurant.name?.slice(0, 2).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div className="rest-name">
                {restaurant.name}
                <span className={'vchip ' + (restaurant.is_verified ? 'yes' : 'no')}>
                  {restaurant.is_verified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="rest-meta">{restaurant.city}</div>
            </div>
          </div>

          <div className="stat-row">
            <div className="stat">
              <div className="stat-val">{restaurant.avg_rating ? Number(restaurant.avg_rating).toFixed(1) : '—'}</div>
              <div className="stat-lbl">Average rating</div>
            </div>
            <div className="stat">
              <div className="stat-val">{restaurant.total_reviews || 0}</div>
              <div className="stat-lbl">Total reviews</div>
            </div>
            <a className="stat" href="/portal/branches">
              <div className="stat-val">{branchCount}</div>
              <div className="stat-lbl">Branches →</div>
            </a>
            <a className="stat" href="/portal/dishes">
              <div className="stat-val">{dishCount}</div>
              <div className="stat-lbl">Dishes →</div>
            </a>
          </div>

          <div className="qa-row">
            {branchCount === 0 ? (
              <a className="qa" href="/portal/branches">
                <div className="qa-t">🏪 Add your first branch</div>
                <div className="qa-s">Included in your onboarding. Dishes are listed per branch, so this comes first.</div>
                <span className="qa-go">Add branch →</span>
              </a>
            ) : (
              <a className="qa" href="/portal/dishes/new">
                <div className="qa-t">🍽️ Add a dish</div>
                <div className="qa-s">Photos, price, branches, Chef's Special — live on Foodoo instantly.</div>
                <span className="qa-go">Add dish →</span>
              </a>
            )}
            <div className="qa" style={{ borderStyle: 'dashed', cursor: 'default' }}>
              <div className="qa-t">📊 Reviews &amp; Analytics</div>
              <div className="qa-s">See how your dishes perform, reply to reviews, and track branches — coming in Phase 2.</div>
            </div>
          </div>
        </>
      ) : (
        <div className="rest-card">
          <div style={{ fontSize: 13, color: '#999' }}>No restaurant is linked to this account yet.</div>
        </div>
      )}
    </div>
  )
}
