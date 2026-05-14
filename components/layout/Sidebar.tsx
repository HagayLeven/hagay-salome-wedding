'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Users, Handshake, Building2, Shirt, Wallet, CheckSquare, Image as ImageIcon, Settings, UserCircle2 } from 'lucide-react'

const items = [
  { href: '/dashboard', label: 'בית',        Icon: Home },
  { href: '/guests',    label: 'מוזמנים',    Icon: Users },
  { href: '/vendors',   label: 'ספקים',      Icon: Handshake },
  { href: '/venues',    label: 'אולמות',     Icon: Building2 },
  { href: '/attire',    label: 'ביגוד',      Icon: Shirt },
  { href: '/budget',    label: 'תקציב',      Icon: Wallet },
  { href: '/tasks',     label: 'משימות',     Icon: CheckSquare },
  { href: '/gallery',   label: 'גלריה',      Icon: ImageIcon },
  { href: '/users',     label: 'משתמשים',   Icon: UserCircle2 },
  { href: '/settings',  label: 'הגדרות',     Icon: Settings },
]

export default function Sidebar() {
  const path = usePathname()
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
        {items.map(({ href, label, Icon }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link key={href} href={href} className={`sidebar-item${active ? ' active' : ''}`}>
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--gray-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          EST · MMXXVI
        </div>
      </div>
    </aside>
  )
}
