'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const RANKS = [
  { name: 'Foodie', min: 0, max: 2, color: '#4CAF50', desc: 'Start your journey as a foodie!', emoji: '🥄' },
  { name: 'Food Explorer', min: 3, max: 9, color: '#2196F3', desc: 'Explore more dishes and grow!', emoji: '🌟' },
  { name: 'Food Critic', min: 10, max: 24, color: '#9C27B0', desc: 'Great opinions come from experience!', emoji: '⭐' },
  { name: 'Food Authority', min: 25, max: 49, color: '#F86D1C', desc: "You're trusted by the community!", emoji: '👑' },
  { name: 'Foodoo Legend', min: 50, max: Infinity, color: '#FFB800', desc: 'Top reviewer on Foodoo!', emoji: '🏆' },
]

function getRank(count) {
  return RANKS.find(r => count >= r.min && count <= r.max) || RANKS[0]
}

function getNextRank(count) {
  const idx = RANKS.findIndex(r => count >= r.min && count <= r.max)
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function RankBadge({ rank, size }) {
  const slugs = {
    'Foodie': 'foodie',
    'Food Explorer': 'food-explorer',
    'Food Critic': 'food-critic',
    'Food Authority': 'food-authority',
    'Foodoo Legend': 'foodoo-legend',
  }
  return (
    <img
      src={`/icons/ranks/${slugs[rank.name]}.png`}
      alt={rank.name}
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [myReviews, setMyReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRanks, setShowRanks] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('foodoo_profile')
    if (saved) {
      const p = JSON.parse(saved)
      setProfile(p)
      setForm(p)
      fetchMyReviews(p.phone || p.email)
    } else {
      setEditing(true)
    }
    setLoading(false)
  }, [])

  const fetchMyReviews = async (contact) => {
    if (!contact) return
    const hash = btoa(contact).slice(0, 32)
    const { data } = await supabase
      .from('reviews')
      .select('id, stars, comment, is_verified, created_at, dishes(id, name, photo_url, restaurants(name))')
      .eq('phone_hash', hash)
      .order('created_at', { ascending: false })
      .limit(20)
    setMyReviews(data || [])
  }

  const saveProfile = () => {
    if (!form.name.trim()) return
    const p = { ...form, joined: profile?.joined || new Date().toISOString() }
    localStorage.setItem('foodoo_profile', JSON.stringify(p))
    setProfile(p)
    setEditing(false)
    if (form.phone || form.email) fetchMyReviews(form.phone || form.email)
  }

  const totalReviews = myReviews.length
  const verifiedReviews = myReviews.filter(r => r.is_verified).length
  const rank = getRank(totalReviews)
  const nextRank = getNextRank(totalReviews)
  const progress = nextRank ? ((totalReviews - rank.min) / (nextRank.min - rank.min)) * 100 : 100
  const reviewsToNext = nextRank ? nextRank.min - totalReviews : 0

  const joinedDate = profile?.joined
    ? new Date(profile.joined).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })
    : 'Now'

  if (loading) return null

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; }
        .page { min-height: 100vh; padding-bottom: 100px; background: #FAF8F5; }
        .top-bar { background: #fff; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F0F0F0; position: sticky; top: 0; z-index: 50; }
        .top-title { font-size: 17px; font-weight: 800; color: #1A1A1A; }
        .icon-btn { width: 36px; height: 36px; border-radius: 50%; background: #F5F5F5; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; }
        .hero-section { background: #FFF3ED; padding: 28px 20px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .avatar { width: 80px; height: 80px; border-radius: 50%; background: #F86D1C; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 14px; position: relative; }
        .avatar-edit { position: absolute; bottom: 0; right: 0; width: 26px; height: 26px; background: #fff; border-radius: 50%; border: 2px solid #F0F0F0; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .profile-name { font-size: 20px; font-weight: 800; color: #1A1A1A; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
        .edit-icon { cursor: pointer; color: #F86D1C; }
        .profile-email { font-size: 13px; color: #666; margin-bottom: 4px; }
        .profile-phone { font-size: 13px; color: #666; display: flex; align-items: center; gap: 4px; justify-content: center; margin-bottom: 16px; }
        .edit-btn { background: #F86D1C; color: #fff; border: none; border-radius: 20px; padding: 10px 24px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; }
        .stats-card { background: #fff; margin: 16px; border-radius: 16px; padding: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; border: 1px solid #F0F0F0; }
        .stat-item { text-align: center; }
        .stat-icon { margin-bottom: 6px; display: flex; justify-content: center; }
        .stat-num { font-size: 22px; font-weight: 900; color: #1A1A1A; line-height: 1; margin-bottom: 4px; }
        .stat-label { font-size: 10px; color: #999; font-weight: 500; }
        .section { margin: 0 16px 16px; background: #fff; border-radius: 16px; padding: 18px; border: 1px solid #F0F0F0; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .section-title { font-size: 16px; font-weight: 800; color: #1A1A1A; }
        .how-ranks { font-size: 12px; color: #F86D1C; font-weight: 600; cursor: pointer; background: none; border: none; font-family: inherit; }
        .rank-card { display: flex; gap: 14px; align-items: flex-start; }
        .rank-info { flex: 1; }
        .rank-name { font-size: 18px; font-weight: 800; margin-bottom: 2px; }
        .rank-range { font-size: 12px; color: #999; margin-bottom: 10px; }
        .next-rank-label { font-size: 12px; color: #555; margin-bottom: 4px; }
        .next-rank-name { font-size: 14px; font-weight: 700; color: #F86D1C; margin-bottom: 8px; }
        .progress-bar { height: 8px; background: #F0F0F0; border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
        .progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
        .progress-text { font-size: 12px; color: #999; }
        .keep-going { font-size: 12px; color: #555; margin-top: 8px; display: flex; align-items: center; gap: 4px; }
        .review-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F5F5F5; }
        .review-item:last-child { border-bottom: none; padding-bottom: 0; }
        .review-img { width: 56px; height: 56px; border-radius: 10px; background: #1A1A1A; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .review-img img { width: 100%; height: 100%; object-fit: cover; }
        .review-body { flex: 1; min-width: 0; }
        .review-dish { font-size: 14px; font-weight: 700; color: #1A1A1A; }
        .review-rest { font-size: 12px; color: #888; margin-top: 1px; margin-bottom: 5px; }
        .review-stars { display: flex; gap: 2px; margin-bottom: 4px; }
        .rstar { color: #F86D1C; font-size: 13px; }
        .rstar.e { color: #DDD; }
        .review-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .vbadge { display: inline-flex; align-items: center; gap: 3px; background: #E8F5E9; color: #2E7D32; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; }
        .review-date { font-size: 11px; color: #BBB; }
        .tip-banner { margin: 0 16px 16px; background: #FFFBEA; border: 1px solid #FFE082; border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; gap: 10px; font-size: 13px; color: #555; }
        .ranks-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 300; display: flex; align-items: flex-end; }
        .ranks-sheet { background: #fff; border-radius: 24px 24px 0 0; padding: 24px 20px 40px; width: 100%; max-height: 80vh; overflow-y: auto; }
        .ranks-title { font-size: 18px; font-weight: 800; color: #1A1A1A; text-align: center; margin-bottom: 20px; }
        .rank-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid #F5F5F5; }
        .rank-row:last-child { border-bottom: none; }
        .rank-row-info { flex: 1; }
        .rank-row-name { font-size: 15px; font-weight: 700; }
        .rank-row-range { font-size: 12px; color: #999; margin-top: 1px; }
        .rank-row-desc { font-size: 12px; color: #666; margin-top: 2px; }
        .star-note { text-align: center; font-size: 12px; color: #999; margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 4px; }
        .form-field { margin-bottom: 14px; }
        .form-label { font-size: 13px; font-weight: 600; color: #1A1A1A; margin-bottom: 6px; display: block; }
        .form-input { width: 100%; border: 1.5px solid #EBEBEB; border-radius: 12px; padding: 13px 16px; font-size: 14px; color: #1A1A1A; outline: none; font-family: inherit; background: #FAFAFA; }
        .form-input:focus { border-color: #F86D1C; background: #fff; }
        .save-btn { width: 100%; background: #F86D1C; color: #fff; border: none; border-radius: 14px; padding: 15px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; margin-top: 8px; }
        .skip-btn { background: none; border: none; color: #999; font-size: 13px; cursor: pointer; margin-top: 12px; font-family: inherit; }
        .no-reviews { text-align: center; padding: 32px 0; color: #BBB; font-size: 14px; }
        .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #F0F0F0; display: flex; justify-content: space-around; padding: 10px 0 24px; z-index: 100; }
        .nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; text-decoration: none; }
        .nav-label { font-size: 10px; color: #999; }
        .nav-label.active { color: #F86D1C; font-weight: 700; }
        @media (min-width: 768px) {
          .hero-section { padding: 40px 40px 32px; }
          .stats-card { margin: 20px 40px; }
          .section { margin: 0 40px 16px; }
          .tip-banner { margin: 0 40px 16px; }
          .ranks-sheet { max-width: 560px; margin: 0 auto; border-radius: 24px 24px 0 0; }
        }
      `}</style>

      <div className="page">
        <div className="top-bar">
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </a>
          <span className="top-title">Profile</span>
          <button className="icon-btn" onClick={() => setEditing(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {editing ? (
          <div style={{ padding: '24px 16px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A', marginBottom: 6 }}>
              {profile ? 'Edit Profile' : 'Create Profile'}
            </div>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
              Your info stays on this device only
            </div>
            <div className="form-field">
              <label className="form-label">Your Name *</label>
              <input className="form-input" placeholder="e.g. Aqsa Malik" value={form.name} onChange={e => setForm({...form, name: e.target.value})} maxLength={40}/>
            </div>
            <div className="form-field">
              <label className="form-label">Email <span style={{color:'#999',fontWeight:400}}>(optional)</span></label>
              <input className="form-input" placeholder="aqsa@gmail.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email"/>
            </div>
            <div className="form-field">
              <label className="form-label">Phone <span style={{color:'#999',fontWeight:400}}>(optional)</span></label>
              <input className="form-input" placeholder="03XXXXXXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} type="tel"/>
              <div style={{fontSize:12,color:'#AAA',marginTop:6}}>Used to link your reviews to your profile</div>
            </div>
            <button className="save-btn" disabled={!form.name.trim()} onClick={saveProfile}>Save Profile</button>
            {profile && (
              <div style={{textAlign:'center'}}>
                <button className="skip-btn" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="hero-section">
              <div className="avatar">
                {getInitials(profile?.name)}
                <div className="avatar-edit" onClick={() => setEditing(true)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div className="profile-name">
                {profile?.name}
                <span className="edit-icon" onClick={() => setEditing(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="#F86D1C" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
              </div>
              {profile?.email && <div className="profile-email">{profile.email}</div>}
              {profile?.phone && (
                <div className="profile-phone">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.5 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.4 1.27h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.69a16 16 0 006.4 6.4l.77-.77a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2.03z" stroke="#888" strokeWidth="1.5"/></svg>
                  {profile.phone}
                </div>
              )}
              <button className="edit-btn" onClick={() => setEditing(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Edit Profile
              </button>
            </div>

            <div className="stats-card">
              <div className="stat-item">
                <div className="stat-icon">
                  <div style={{width:36,height:36,background:'#FFF3ED',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#F86D1C" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#F86D1C" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                </div>
                <div className="stat-num">{totalReviews}</div>
                <div className="stat-label">Total Reviews</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <div style={{width:36,height:36,background:'#E8F5E9',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9a12.02 12.02 0 00-.382-3.016z" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                <div className="stat-num">{verifiedReviews}</div>
                <div className="stat-label">Verified</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <div style={{width:36,height:36,background:'#FFF8E1',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" stroke="#FFB800" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" stroke="#FFB800" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                </div>
                <div className="stat-num">0</div>
                <div className="stat-label">Helpful</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <div style={{width:36,height:36,background:'#EDE7F6',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#9C27B0" strokeWidth="1.5"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#9C27B0" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                </div>
                <div className="stat-num" style={{fontSize:14}}>{joinedDate}</div>
                <div className="stat-label">Member Since</div>
              </div>
            </div>

            <div className="section">
              <div className="section-header">
                <div className="section-title">Your Reviewer Rank</div>
                <button className="how-ranks" onClick={() => setShowRanks(true)}>How ranks work? ⓘ</button>
              </div>
              <div className="rank-card">
                <RankBadge rank={rank} size={60}/>
                <div className="rank-info">
                  <div className="rank-name" style={{ color: rank.color }}>{rank.name}</div>
                  <div className="rank-range">{rank.min} – {rank.max === Infinity ? '50+' : rank.max} reviews</div>
                  {nextRank ? (
                    <>
                      <div className="next-rank-label">{reviewsToNext} more reviews to reach</div>
                      <div className="next-rank-name">{nextRank.name}</div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: progress + '%', background: rank.color }}></div>
                      </div>
                      <div className="progress-text">{totalReviews - rank.min} / {nextRank.min - rank.min} reviews</div>
                      <div className="keep-going">👑 Keep reviewing to unlock new badges!</div>
                    </>
                  ) : (
                    <div className="keep-going">🏆 You've reached the highest rank!</div>
                  )}
                </div>
              </div>
              <div style={{fontSize:13,color:'#888',marginTop:14,fontStyle:'italic'}}>{rank.desc}</div>
            </div>

            <div className="section">
              <div className="section-header">
                <div className="section-title">My Reviews</div>
                {myReviews.length > 0 && <span style={{fontSize:13,color:'#F86D1C',fontWeight:600}}>View all</span>}
              </div>
              {myReviews.length === 0 ? (
                <div className="no-reviews">
                  <div style={{fontSize:36,marginBottom:8}}>📝</div>
                  <div>No reviews yet</div>
                  <div style={{fontSize:12,marginTop:4}}>Start reviewing dishes to build your profile!</div>
                  <a href="/" style={{display:'inline-block',marginTop:16,background:'#F86D1C',color:'#fff',textDecoration:'none',padding:'10px 24px',borderRadius:20,fontSize:13,fontWeight:700}}>Explore Dishes</a>
                </div>
              ) : (
                myReviews.slice(0, 5).map(r => (
                  <div key={r.id} className="review-item">
                    <a href={'/dish/' + r.dishes?.id} className="review-img" style={{textDecoration:'none'}}>
                      {r.dishes?.photo_url
                        ? <img src={r.dishes.photo_url} alt={r.dishes.name}/>
                        : <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#555" strokeWidth="1.5"/></svg>
                      }
                    </a>
                    <div className="review-body">
                      <a href={'/dish/' + r.dishes?.id} style={{textDecoration:'none'}}>
                        <div className="review-dish">{r.dishes?.name || 'Unknown Dish'}</div>
                      </a>
                      <div className="review-rest">{r.dishes?.restaurants?.name}</div>
                      <div className="review-stars">
                        {[1,2,3,4,5].map(s => <span key={s} className={'rstar' + (s <= r.stars ? '' : ' e')}>★</span>)}
                      </div>
                      <div className="review-meta">
                        {r.is_verified && (
                          <div className="vbadge">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round"/></svg>
                            Verified
                          </div>
                        )}
                        <span className="review-date">{new Date(r.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="tip-banner">
              <span style={{fontSize:20}}>💡</span>
              <span>Tip: Your reviews help others discover the best dishes and restaurants!</span>
            </div>
          </>
        )}
      </div>

      {showRanks && (
        <div className="ranks-modal" onClick={() => setShowRanks(false)}>
          <div className="ranks-sheet" onClick={e => e.stopPropagation()}>
            <div className="ranks-title">REVIEWER RANKS (How it works)</div>
            {RANKS.map(r => (
              <div key={r.name} className="rank-row">
                <RankBadge rank={r} size={48}/>
                <div className="rank-row-info">
                  <div className="rank-row-name" style={{ color: r.color }}>{r.name}</div>
                  <div className="rank-row-range">{r.min} – {r.max === Infinity ? '50+' : r.max} reviews</div>
                  <div className="rank-row-desc">{r.desc}</div>
                </div>
              </div>
            ))}
            <div className="star-note">⭐ Ranks update automatically as you add more reviews.</div>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        {[
          { label: 'Home', href: '/', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9" stroke="#999" strokeWidth="2" strokeLinecap="round"/><path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" stroke="#999" strokeWidth="2" strokeLinecap="round"/></svg> },
          { label: 'Search', href: '/search', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#999" strokeWidth="2"/><path d="M16.5 16.5L21 21" stroke="#999" strokeWidth="2" strokeLinecap="round"/></svg> },
          { label: 'Saved', href: '/saved', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 3 14 3 8a5 5 0 019-3 5 5 0 019 3c0 6-9 13-9 13z" stroke="#999" strokeWidth="2"/></svg> },
          { label: 'Profile', href: '/profile', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#F86D1C" strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#F86D1C" strokeWidth="2" strokeLinecap="round"/></svg> },
        ].map(item => (
          <a key={item.label} href={item.href} className="nav-item">
            {item.icon}
            <span className={'nav-label' + (item.label === 'Profile' ? ' active' : '')}>{item.label}</span>
          </a>
        ))}
      </nav>
    </>
  )
}