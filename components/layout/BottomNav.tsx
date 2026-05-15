'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Handshake, Wallet, CheckSquare } from 'lucide-react'
import { useLang } from '@/lib/lang-context'

export default function BottomNav() {
  const path = usePathname()
  const { t } = useLang()

  const items = [
    { href: '/dashboard', labelKey: 'dashboard' as const, Icon: Home },
    { href: '/guests',    labelKey: 'guests' as const,    Icon: Users },
    { href: '/vendors',   labelKey: 'vendors' as const,   Icon: Handshake },
    { href: '/budget',    labelKey: 'budget' as const,    Icon: Wallet },
    { href: '/tasks',     labelKey: 'tasks' as const,     Icon: CheckSquare },
  ]

  return (
    <nav className="bottom-nav">
      {items.map(({ href, labelKey, Icon }) => {
        const active = path === href || path.startsWith(href + '/')
        return (
          <Link key={href} href={href} className={`bottom-nav-item${active ? ' active' : ''}`}>
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            {t(labelKey)}
          </Link>
        )
      })}
    </nav>
  )
}
