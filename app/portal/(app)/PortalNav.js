'use client'

import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/portal', label: 'Dashboard', enabled: true, exact: true },
  { href: '/portal/restaurant', label: 'Restaurant', enabled: true },
  { href: '/portal/dishes', label: 'Dishes', enabled: true },
  { href: '/portal/branches', label: 'Branches', enabled: true },
  { href: '/portal/reviews', label: 'Reviews', enabled: false },
  { href: '/portal/billing', label: 'Billing', enabled: false },
]

export default function PortalNav() {
  const pathname = usePathname()
  return (
    <nav>
      {NAV.map((item) => {
        if (!item.enabled)
          return (
            <span key={item.href} className="nav-link disabled">
              {item.label}
              <span className="soon">SOON</span>
            </span>
          )
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <a key={item.href} href={item.href} className={'nav-link' + (active ? ' active' : '')}>
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}
