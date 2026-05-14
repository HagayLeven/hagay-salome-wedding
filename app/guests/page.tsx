'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, UserPlus, Download, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { guestStore } from '@/lib/store'
import type { Guest, GuestGroup, RsvpStatus, Side } from '@/lib/types'

const GROUPS: { key: GuestGroup | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'הכל' },
  { key: 'FAMILY', label: 'משפחה' },
  { key: 'FRIENDS', label: 'חברים' },
  { key: 'WORK', label: 'עבודה' },
  { key: 'ARMY', label: 'צבא' },
  { key: 'OTHER', label: 'אחר' },
]

const rsvpLabel: Record<RsvpStatus, string> = { PENDING: 'ממתין', CONFIRMED: 'אישר', DECLINED: 'סירב' }
const rsvpClass: Record<RsvpStatus, string> = {
  PENDING: 'chip chip-pending', CONFIRMED: 'chip chip-confirmed', DECLINED: 'chip chip-declined'
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function AddDrawer({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', side: 'GROOM' as Side, group: 'FAMILY' as GuestGroup, note: '' })
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  function save() {
    if (!form.name.trim() || !form.phone.trim()) return
    guestStore.create({ ...form, whatsapp: form.phone, rsvpStatus: 'PENDING', invitationSent: false, invitationAcknowledged: false, attendanceConfirmed: false })
    setForm({ name: '', phone: '', side: 'GROOM', group: 'FAMILY', note: '' })
    onSave()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 60 }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white',
              borderRadius: '24px 24px 0 0', padding: '1.5rem 1.25rem 2rem', zIndex: 70, boxShadow: '0 -8px 40px rgba(0,0,0,.15)' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '1.1rem' }}>הוספת מוזמן</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="input" placeholder="שם מלא *" value={form.name} onChange={e => upd('name', e.target.value)} />
              <input className="input" placeholder="טלפון *" type="tel" value={form.phone} onChange={e => upd('phone', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <select className="input" value={form.side} onChange={e => upd('side', e.target.value)}>
                  <option value="GROOM">צד חתן</option><option value="BRIDE">צד כלה</option>
                </select>
                <select className="input" value={form.group} onChange={e => upd('group', e.target.value)}>
                  <option value="FAMILY">משפחה</option><option value="FRIENDS">חברים</option>
                  <option value="WORK">עבודה</option><option value="ARMY">צבא</option><option value="OTHER">אחר</option>
                </select>
              </div>
              <input className="input" placeholder="הערה" value={form.note} onChange={e => upd('note', e.target.value)} />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 4 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>ביטול</button>
                <button className="btn btn-gold" style={{ flex: 2 }} onClick={save}>שמור</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [tab, setTab] = useState<GuestGroup | 'ALL'>('ALL')
  const [rsvpFilter, setRsvpFilter] = useState<RsvpStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(() => setGuests(guestStore.getAll()), [])
  useEffect(() => { load() }, [load])

  const visible = guests.filter(g => {
    if (tab !== 'ALL' && g.group !== tab) return false
    if (rsvpFilter !== 'ALL' && g.rsvpStatus !== rsvpFilter) return false
    if (search && !g.name.includes(search) && !g.phone.includes(search)) return false
    return true
  })

  const total = guests.length
  const confirmed = guests.filter(g => g.rsvpStatus === 'CONFIRMED').length
  const pending = guests.filter(g => g.rsvpStatus === 'PENDING').length
  const declined = guests.filter(g => g.rsvpStatus === 'DECLINED').length

  function exportCSV() {
    const rows = [['שם', 'טלפון', 'צד', 'קבוצה', 'RSVP', 'הערה'],
      ...visible.map(g => [g.name, g.phone, g.side === 'GROOM' ? 'חתן' : 'כלה',
        GROUPS.find(x => x.key === g.group)?.label || g.group, rsvpLabel[g.rsvpStatus], g.note || ''])]
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['﻿' + rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')], { type: 'text/csv' }))
    a.download = 'guests.csv'; a.click()
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '2rem', color: 'var(--charcoal)', lineHeight: 1 }}>מוזמנים</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-muted)', marginTop: 4 }}>{total} מוזמנים</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={exportCSV}><Download size={15} /></button>
          <button className="btn btn-gold" onClick={() => setShowAdd(true)}><UserPlus size={15} /> הוסף</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.6rem', marginBottom: '1.1rem' }}>
        {[{ label: 'סה״כ', value: total, c: 'var(--charcoal)' }, { label: 'אישרו', value: confirmed, c: '#2D7A55' },
          { label: 'ממתינים', value: pending, c: '#9A6020' }, { label: 'סירבו', value: declined, c: '#923333' }].map(s => (
          <div key={s.label} className="card" style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.c, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div className="label-caps" style={{ marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
        <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-muted)' }} />
        <input className="input" style={{ paddingRight: 38 }} placeholder="חיפוש לפי שם או טלפון..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Group tabs */}
      <div className="tab-bar" style={{ marginBottom: '0.75rem' }}>
        {GROUPS.map(g => {
          const count = g.key === 'ALL' ? total : guests.filter(x => x.group === g.key).length
          return (
            <button key={g.key} onClick={() => setTab(g.key)} className={`tab-pill${tab === g.key ? ' active' : ''}`}>
              {g.label} <span style={{ opacity: .65 }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* RSVP filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        {(['ALL', 'CONFIRMED', 'PENDING', 'DECLINED'] as const).map(r => (
          <button key={r} onClick={() => setRsvpFilter(r)}
            className={`tab-pill${rsvpFilter === r ? ' active' : ''}`} style={{ fontSize: '0.72rem', padding: '4px 12px' }}>
            {r === 'ALL' ? 'כולם' : rsvpLabel[r]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {visible.length === 0 ? (
          <div className="empty-state">
            <Search size={48} /><h3>אין מוזמנים</h3>
            <p>שנה את הסינון או הוסף מוזמן חדש</p>
            <button className="btn btn-gold" style={{ marginTop: 8 }} onClick={() => setShowAdd(true)}>
              <UserPlus size={15} /> הוסף מוזמן
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {visible.map((g, i) => (
              <motion.div key={g.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 6) * 0.05 }}
                exit={{ opacity: 0, height: 0 }}>
                <Link href={`/guests/${g.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.85rem 1.1rem', borderBottom: '1px solid var(--border)',
                  textDecoration: 'none', color: 'inherit', transition: 'background .12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-pale)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <div className="avatar avatar-md">{initials(g.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--charcoal)' }}>{g.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-muted)', marginTop: 2 }}>
                      {GROUPS.find(x => x.key === g.group)?.label} · {g.side === 'GROOM' ? 'חתן' : 'כלה'}
                    </div>
                  </div>
                  <span className={rsvpClass[g.rsvpStatus]}>{rsvpLabel[g.rsvpStatus]}</span>
                  <ChevronLeft size={16} color="var(--gray-muted)" style={{ transform: 'rotate(180deg)', flexShrink: 0 }} />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <AddDrawer open={showAdd} onClose={() => setShowAdd(false)} onSave={() => { load(); setShowAdd(false) }} />
    </div>
  )
}
