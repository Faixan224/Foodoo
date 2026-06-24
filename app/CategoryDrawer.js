'use client'

export default function CategoryDrawer({ mainCategories, moreCategories }) {
  const openDrawer = () => {
    document.getElementById('drawerOverlay').classList.add('open')
    document.getElementById('catDrawer').classList.add('open')
  }
  const closeDrawer = () => {
    document.getElementById('drawerOverlay').classList.remove('open')
    document.getElementById('catDrawer').classList.remove('open')
  }

  return (
    <>
      <div className="drawer-overlay" id="drawerOverlay" onClick={closeDrawer}></div>
      <div className="drawer" id="catDrawer">
        <div className="drawer-header">
          <span className="drawer-title">All Categories</span>
          <button className="drawer-close" onClick={closeDrawer}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="drawer-grid">
          {[...mainCategories, ...moreCategories].map(cat => (
            <a key={cat.name} href={'/search?category=' + cat.name} className="drawer-cat">
              <img src={cat.img} alt={cat.name} width="32" height="32" style={{ objectFit: 'contain' }} />
              <span className="drawer-cat-name">{cat.name}</span>
            </a>
          ))}
        </div>
      </div>
      <button className="cat-more-btn" onClick={openDrawer}>
        <div className="cat-more-grid">
          <div className="cat-more-dot"></div><div className="cat-more-dot"></div>
          <div className="cat-more-dot"></div><div className="cat-more-dot"></div>
        </div>
        <span className="cat-more-label">More</span>
      </button>
    </>
  )
}