'use client'

export default function BackButton() {
  return (
    <button className="icon-btn" onClick={() => window.history.back()}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}