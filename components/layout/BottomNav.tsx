'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Handshake, Building2, Shirt, Wallet, CheckSquare } from 'lucide-react'

const items = [
  { href: '/dashboard', label: 'בית',     Icon: Home },
  { href: '/guests',    label: 'מוזמנים', Icon: Users },
  { href: '/vendors',   label: 'ספקים',   Icon: Handshake },
  { href: '/budget',    label: 'תקציב',   Icon: Wallet },
  { href: '/tasks',     label: 'משימות',  Icon: CheckSquare },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="bottom-nav">
      {items.map(({ href, label, Icon }) => {
        const active = path === href || path.startsWith(href + '/')
        return (
          <Link key={href} href={href} className={`bottom-nav-item${active ? ' active' : ''}`}>
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
