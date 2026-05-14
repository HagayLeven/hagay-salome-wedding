'use client'

import { useState } from 'react'
import { addGuest, updateRSVP, deleteGuest } from './actions'

type Guest = {
  id: string; name: string; phone: string | null
  side: string; group: string; rsvp: string; notes: string | null
}

const rsvpLabel: Record<string, string> = { pending: 'ממתין', confirmed: 'אישר', declined: 'סירב' }
const rsvpBadge: Record<string, string> = {
  pending:   'badge badge-gold',
  confirmed: 'badge badge-green',
  declined:  'badge badge-red',
}
const groupLabel: Record<string, string> = {
  family: 'משפחה', friends: 'חברים', work: 'עבודה', army: 'צבא', other: 'אחר', all: 'הכל'
}
const sideLabel: Record<string, string> = { groom: 'חתן', bride: 'כלה' }

const TABS = ['all', 'family', 'friends', 'work', 'army', 'other'] as const
type Tab = typeof TABS[number]

export default function GuestsClient({ initialGuests }: { initialGuests: Guest[] }) {
  const [guests, setGuests]     = useState(initialGuests)
  const [tab, setTab]           = useState<Tab>('all')
  const [filterSide, setSide]   = useState('all')
  const [filterRsvp, setRsvp]   = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)

  const visible = guests.filter(g => {
    if (tab !== 'all' && g.group !== tab) return false
    if (filterSide !== 'all' && g.side !== filterSide) return false
    if (filterRsvp !== 'all' && g.rsvp !== filterRsvp) return false
    return true
  })

  const total     = guests.length
  const confirmed = guests.filter(g => g.rsvp === 'confirmed').length
  const pending   = guests.filter(g => g.rsvp === 'pending').length
  const declined  = guests.filter(g => g.rsvp === 'declined').length

  async function handleAdd(fd: FormData) {
    setSaving(true)
    await addGuest(fd)
    setSaving(false)
    setShowForm(false)
    window.location.reload()
  }

  async function handleRSVP(id: string, rsvp: string) {
    await updateRSVP(id, rsvp)
    setGuests(gs => gs.map(g => g.id === id ? { ...g, rsvp } : g))
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק מוזמן?')) return
    await deleteGuest(id)
    setGuests(gs => gs.filter(g => g.id !== id))
  }

  function exportCSV() {
    const header = 'שם,טלפון,צד,קבוצה,אישור,הערות'
    const rows = visible.map(g =>
      `"${g.name}","${g.phone ?? ''}","${sideLabel[g.side]}","${groupLabel[g.group] ?? g.group}","${rsvpLabel[g.rsvp]}","${g.notes ?? ''}"`
    )
    const blob = new Blob(['﻿' + [header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'guests.csv'; a.click()
  }

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1c1917', lineHeight: 1 }}>מוזמנים</h1>
          <p style={{ fontSize: '0.78rem', color: '#a8a29e', marginTop: '4px', letterSpacing: '0.03em' }}>{total} מוזמנים בסך הכל</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-ghost" style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}>
            ייצוא CSV
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            + הוסף מוזמן
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'סה״כ',    value: total,     color: '#1c1917' },
          { label: 'אישרו',   value: confirmed, color: '#166534' },
          { label: 'ממתינים', value: pending,   color: '#92400e' },
          { label: 'סירבו',   value: declined,  color: '#991b1b' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <div style={{ fontSize: '1.6rem', fontWeight: 600, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.68rem', color: '#a8a29e', marginTop: '3px', letterSpacing: '0.03em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="card p-1.5 flex gap-1 overflow-x-auto">
        {TABS.map(t => {
          const count = t === 'all' ? guests.length : guests.filter(g => g.group === t).length
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: '0.6rem',
                fontSize: '0.78rem',
                fontWeight: active ? 500 : 400,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                background: active ? '#1c1917' : 'transparent',
                color: active ? '#e8d5b0' : '#78716c',
                whiteSpace: 'nowrap',
              }}
            >
              {groupLabel[t]}
              <span style={{
                fontSize: '0.65rem',
                padding: '1px 6px',
                borderRadius: '9999px',
                background: active ? 'rgba(201,169,110,0.25)' : '#f5f5f4',
                color: active ? '#e8d5b0' : '#a8a29e',
                fontWeight: 600,
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Secondary filters */}
      <div className="flex gap-2">
        <select
          value={filterSide}
          onChange={e => setSide(e.target.value)}
          className="input-base"
          style={{ width: 'auto', flex: 1 }}
        >
          <option value="all">כל הצדדים</option>
          <option value="groom">צד חתן</option>
          <option value="bride">צד כלה</option>
        </select>
        <select
          value={filterRsvp}
          onChange={e => setRsvp(e.target.value)}
          className="input-base"
          style={{ width: 'auto', flex: 1 }}
        >
          <option value="all">כל הסטטוסים</option>
          <option value="pending">ממתינים</option>
          <option value="confirmed">אישרו</option>
          <option value="declined">סירבו</option>
        </select>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-5">
          <h3 style={{ fontWeight: 500, fontSize: '0.9rem', color: '#1c1917', marginBottom: '1rem', letterSpacing: '0.03em' }}>
            הוספת מוזמן
          </h3>
          <form action={handleAdd} className="grid sm:grid-cols-2 gap-3">
            <input name="name" placeholder="שם מלא *" required className="input-base" />
            <input name="phone" placeholder="טלפון" className="input-base" />
            <select name="side" className="input-base">
              <option value="groom">צד חתן</option>
              <option value="bride">צד כלה</option>
            </select>
            <select name="group" className="input-base">
              <option value="family">משפחה</option>
              <option value="friends">חברים</option>
              <option value="work">עבודה</option>
              <option value="army">צבא</option>
              <option value="other">אחר</option>
            </select>
            <input name="notes" placeholder="הערות" className="input-base sm:col-span-2" />
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">ביטול</button>
              <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? 'שומר...' : 'שמור'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Guest list */}
      <div className="card overflow-hidden">
        {visible.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#a8a29e', fontSize: '0.875rem' }}>
            אין מוזמנים בקטגוריה זו
          </div>
        ) : (
          <div>
            {visible.map((g, i) => (
              <div
                key={g.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  borderBottom: i < visible.length - 1 ? '1px solid #f0ebe4' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#faf8f5')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {/* Avatar */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e8d5b0, #c9a96e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 600, color: '#7a5c2e', flexShrink: 0,
                }}>
                  {g.name.charAt(0)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem', color: '#1c1917' }}>{g.name}</span>
                    <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>{sideLabel[g.side]}</span>
                    <span className="badge" style={{ background: '#fdf3df', color: '#a07840', fontSize: '0.65rem' }}>
                      {groupLabel[g.group] ?? g.group}
                    </span>
                  </div>
                  {g.phone && (
                    <div style={{ fontSize: '0.72rem', color: '#a8a29e', marginTop: '2px', direction: 'ltr', textAlign: 'right' }}>
                      {g.phone}
                    </div>
                  )}
                </div>

                <select
                  value={g.rsvp}
                  onChange={e => handleRSVP(g.id, e.target.value)}
                  className={rsvpBadge[g.rsvp]}
                  style={{ border: 'none', cursor: 'pointer', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
                >
                  <option value="pending">ממתין</option>
                  <option value="confirmed">אישר</option>
                  <option value="declined">סירב</option>
                </select>

                <button
                  onClick={() => handleDelete(g.id)}
                  style={{ color: '#d4c4b8', fontSize: '1.2rem', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#d4c4b8')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
