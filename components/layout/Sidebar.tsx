'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Users, Handshake, Building2, Shirt, Wallet, CheckSquare, Image as ImageIcon, Settings, UserCircle2 } from 'lucide-react'
import { useLang } from '@/lib/lang-context'
import LangToggle from '@/components/ui/LangToggle'

export default function Sidebar() {
  const path = usePathname()
  const { t } = useLang()

  const items = [
    { href: '/dashboard', labelKey: 'dashboard' as const, Icon: Home },
    { href: '/guests',    labelKey: 'guests' as const,    Icon: Users },
    { href: '/vendors',   labelKey: 'vendors' as const,   Icon: Handshake },
    { href: '/venues',    labelKey: 'venues' as const,    Icon: Building2 },
    { href: '/attire',    labelKey: 'attire' as const,    Icon: Shirt },
    { href: '/budget',    labelKey: 'budget' as const,    Icon: Wallet },
    { href: '/tasks',     labelKey: 'tasks' as const,     Icon: CheckSquare },
    { href: '/gallery',   labelKey: 'gallery' as const,   Icon: ImageIcon },
    { href: '/users',     labelKey: 'users' as const,     Icon: UserCircle2 },
    { href: '/settings',  labelKey: 'settings' as const,  Icon: Settings },
  ]

  return (
    <aside className="sidebar">
      <div style={{ padding: '0 1.25rem 1.25rem', borderBottom: '1px solid var(--border)', marginBottom: '0.75rem' }}>
        <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ position: 'relative', width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
            border: '2px solid var(--gold)', boxShadow: '0 2px 12px rgba(201,169,110,.3)' }}>
            <Image src="/couple.jpg" alt="חגי וסלומה" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--charcoal)', lineHeight: 1.1 }}>
              חגי &amp; סלומה
            </div>
            <div style={{ fontSize: '0.58rem', letterSpacing: '0.1em', color: 'var(--gray-muted)', textTransform: 'uppercase' }}>
              Wedding 2026
            </div>
          </div>
        </Link>
      </div>
      <nav style={{ flex: 1 }}>
        {items.map(({ href, labelKey, Icon }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link key={href} href={href} className={`sidebar-item${active ? ' active' : ''}`}>
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              {t(labelKey)}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <LangToggle />
        <div style={{ fontSize: '0.65rem', color: 'var(--gray-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          EST · MMXXVI
        </div>
      </div>
    </aside>
  )
}
