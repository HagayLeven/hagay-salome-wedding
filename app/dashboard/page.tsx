'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Handshake, Receipt, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import CircularRing from '@/components/ui/CircularRing'
import { guestStore, vendorStore, venueStore, attireStore, taskStore, expenseStore, settingsStore, activityStore, quoteStore, getDaysToWedding, formatILS, formatDate } from '@/lib/store'
import type { Settings } from '@/lib/types'

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export default function Dashboard() {
  const [ready, setReady] = useState(false)
  const [days, setDays] = useState(0)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [stats, setStats] = useState({ total: 0, confirmed: 0, vendorTotal: 0, vendorSigned: 0, taskTotal: 0, taskDone: 0, budgetPct: 0, budgetSpent: 0, budgetTotal: 0 })
  const [activity, setActivity] = useState<{ id: string; description: string; createdAt: string }[]>([])
  const [pendingDecision, setPendingDecision] = useState<{ id: string; name: string; type: string; href: string; quoteCount: number }[]>([])

  useEffect(() => {
    const s = settingsStore.get()
    setSettings(s)
    setDays(getDaysToWedding())
    const guests = guestStore.getAll()
    const vendors = vendorStore.getAll()
    const tasks = taskStore.getAll()
    const expenses = expenseStore.getAll()
    const spent = expenses.reduce((a, e) => a + e.amount, 0)
    setStats({
      total: guests.length,
      confirmed: guests.filter(g => g.rsvpStatus === 'CONFIRMED').length,
      vendorTotal: vendors.length,
      vendorSigned: vendors.filter(v => ['SIGNED', 'DEPOSIT', 'PAID'].includes(v.status)).length,
      taskTotal: tasks.length,
      taskDone: tasks.filter(t => t.completed).length,
      budgetPct: s.totalBudget > 0 ? Math.min(100, Math.round((spent / s.totalBudget) * 100)) : 0,
      budgetSpent: spent,
      budgetTotal: s.totalBudget,
    })
    setActivity(activityStore.getAll())

    // Pending decision: entities with no selected quote
    const allQuotes = quoteStore.getAll()
    const pending: typeof pendingDecision = []
    vendorStore.getAll().forEach(v => {
      const qs = allQuotes.filter(q => q.entityType === 'vendor' && q.entityId === v.id)
      if (!qs.some(q => q.isSelected)) {
        pending.push({ id: v.id, name: v.name, type: 'ספק', href: '/vendors', quoteCount: qs.length })
      }
    })
    venueStore.getAll().forEach(v => {
      const qs = allQuotes.filter(q => q.entityType === 'venue' && q.entityId === v.id)
      if (!qs.some(q => q.isSelected)) {
        pending.push({ id: v.id, name: v.name, type: 'אולם', href: '/venues', quoteCount: qs.length })
      }
    })
    attireStore.getAll().forEach(a => {
      const qs = allQuotes.filter(q => q.entityType === 'attire' && q.entityId === a.id)
      if (!qs.some(q => q.isSelected)) {
        pending.push({ id: a.id, name: a.name, type: 'ביגוד', href: '/attire', quoteCount: qs.length })
      }
    })
    setPendingDecision(pending)
    setReady(true)
  }, [])

  const ringColor = stats.budgetPct > 90 ? '#E05C5C' : stats.budgetPct > 70 ? '#F0A04B' : '#C9A96E'

  if (!ready) return null

  return (
    <motion.div variants={{ show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" animate="show"
      style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Hero countdown */}
      <motion.div variants={fadeUp} className="card-lg" style={{
        background: 'linear-gradient(135deg, #FDF6EC 0%, #F8F5F0 100%)',
        padding: '2rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(201,169,110,.05)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(201,169,110,.04)' }} />
        {/* Couple photo */}
        <div style={{ position: 'relative', width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
          border: '3px solid var(--gold)', boxShadow: '0 4px 20px rgba(201,169,110,.35)', margin: '0 auto 1rem' }}>
          <Image src="/couple.jpg" alt="חגי וסלומה" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
        </div>
        <div role="img" aria-label={`נותרו ${days} ימים לחתונה`}>
          <CircularRing value={365 - days} max={365} size="xl" centerText={String(days)} centerSub="ימים" />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div className="font-display" style={{ fontSize: '1.7rem', color: 'var(--charcoal)' }}>
            {settings?.groomName} &amp; {settings?.brideName}
          </div>
          <div className="label-caps" style={{ marginTop: 4 }}>
            {settings?.weddingDate ? new Date(settings.weddingDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'מוזמנים', value: stats.confirmed, max: Math.max(stats.total, 1), sub: `${stats.confirmed}/${stats.total}` },
          { label: 'תקציב', value: stats.budgetPct, max: 100, sub: `${stats.budgetPct}%`, color: ringColor, ariaLabel: `נוצל ${stats.budgetPct} אחוז מהתקציב` },
          { label: 'ספקים', value: stats.vendorSigned, max: Math.max(stats.vendorTotal, 1), sub: `${stats.vendorSigned}/${stats.vendorTotal}` },
          { label: 'משימות', value: stats.taskDone, max: Math.max(stats.taskTotal, 1), sub: `${stats.taskDone}/${stats.taskTotal}` },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div role="img" aria-label={'ariaLabel' in s ? s.ariaLabel : `${s.label}: ${s.sub}`}>
              <CircularRing value={s.value} max={s.max} size="sm" centerText={s.sub} color={s.color} />
            </div>
            <span className="label-caps">{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={fadeUp}>
        <div className="section-bar">
          <div className="section-bar-title">
            <div className="section-bar-accent" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>פעולות מהירות</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { href: '/guests?new=1',  Icon: UserPlus,   label: 'הוסף מוזמן' },
            { href: '/vendors?new=1', Icon: Handshake,  label: 'הוסף ספק' },
            { href: '/budget?new=1',  Icon: Receipt,    label: 'הוסף הוצאה' },
            { href: '/tasks?new=1',   Icon: CheckSquare,label: 'הוסף משימה' },
          ].map(({ href, Icon, label }) => (
            <Link key={href} href={href} className="card" style={{
              flex: '1 1 140px', padding: '1rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer',
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
            >
              <div className="icon-circle icon-circle-sm icon-circle-ghost" style={{ width: 44, height: 44 }}>
                <Icon size={18} color="var(--gold)" />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--charcoal)', textAlign: 'center' }}>{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Budget summary */}
      {stats.budgetTotal > 0 && (
        <motion.div variants={fadeUp} className="card" style={{ padding: '1.25rem' }}>
          <div className="section-bar" style={{ marginBottom: '0.75rem' }}>
            <div className="section-bar-title">
              <div className="section-bar-accent" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>תקציב</span>
            </div>
            <Link href="/budget" style={{ fontSize: '0.78rem', color: 'var(--gold)', textDecoration: 'none' }}>כל הפרטים</Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-md)' }}>הוצאות: <strong style={{ color: 'var(--charcoal)' }}>{formatILS(stats.budgetSpent)}</strong></span>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-md)' }}>מתוך: <strong style={{ color: 'var(--charcoal)' }}>{formatILS(stats.budgetTotal)}</strong></span>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: 9999, height: 6, overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${stats.budgetPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', background: ringColor, borderRadius: 9999 }} />
          </div>
        </motion.div>
      )}

      {/* Pending decision widget */}
      <motion.div variants={fadeUp} className="card" style={{ padding: '1.25rem' }}>
        <div className="section-bar" style={{ marginBottom: '0.75rem' }}>
          <div className="section-bar-title">
            <div className="section-bar-accent" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>ממתין להחלטה</span>
            {pendingDecision.length > 0 && (
              <span style={{ marginRight: 6, background: 'var(--gold)', color: 'white', borderRadius: 9999, fontSize: '0.68rem', fontWeight: 700, padding: '1px 7px' }}>
                {pendingDecision.length}
              </span>
            )}
          </div>
        </div>
        {pendingDecision.length === 0 ? (
          <div style={{ fontSize: '0.82rem', color: '#2D7A55', fontWeight: 600 }}>כל ההצעות נבחרו ✓</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {pendingDecision.slice(0, 5).map(item => (
              <Link key={`${item.type}-${item.id}`} href={item.href}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem',
                  borderRadius: 8, background: 'var(--bg)', textDecoration: 'none', color: 'inherit' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--charcoal)' }}>{item.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--gray-muted)', marginRight: 8 }}>{item.type}</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: item.quoteCount > 0 ? 'var(--gold)' : 'var(--gray-muted)' }}>
                  {item.quoteCount > 0 ? `${item.quoteCount} הצעות` : 'אין הצעות'}
                </span>
              </Link>
            ))}
            {pendingDecision.length > 5 && (
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-muted)', textAlign: 'center' }}>
                ועוד {pendingDecision.length - 5} נוספים...
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Activity feed */}
      {activity.length > 0 && (
        <motion.div variants={fadeUp} className="card" style={{ padding: '1.25rem' }}>
          <div className="section-bar">
            <div className="section-bar-title">
              <div className="section-bar-accent" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>פעילות אחרונה</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activity.slice(0, 5).map((a, i) => (
              <motion.div key={a.id} variants={fadeUp} custom={i}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar avatar-xs" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--charcoal)' }}>{a.description}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--gray-muted)', marginTop: 1 }}>
                    {formatDate(a.createdAt)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
