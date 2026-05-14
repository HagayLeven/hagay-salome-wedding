'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Phone, ArrowRight, Check, MessageCircle, Trash2 } from 'lucide-react'
import { guestStore, buildWhatsAppLink, settingsStore, formatDate } from '@/lib/store'
import type { Guest, RsvpStatus } from '@/lib/types'

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function TimelineStep({
  step, label, done, timestamp, onToggle, disabled
}: { step: number; label: string; done: boolean; timestamp?: string; onToggle: () => void; disabled?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          animate={{ background: done ? 'var(--gold)' : 'white', borderColor: done ? 'var(--gold)' : 'var(--border)' }}
          transition={{ duration: .3 }}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer',
            boxShadow: done ? '0 2px 8px rgba(201,169,110,.35)' : 'none' }}
          onClick={disabled ? undefined : onToggle}>
          {done && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Check size={14} color="white" strokeWidth={3} />
            </motion.div>
          )}
        </motion.div>
        {step < 3 && (
          <motion.div animate={{ background: done ? 'var(--gold)' : 'var(--border)' }}
            style={{ width: 2, height: 44, borderRadius: 1 }} transition={{ duration: .4 }} />
        )}
      </div>
      <div style={{ flex: 1, paddingTop: 4 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: done ? 'var(--charcoal)' : 'var(--gray-md)' }}>{label}</div>
        {timestamp && <div style={{ fontSize: '0.72rem', color: 'var(--gray-muted)', marginTop: 2 }}>{timestamp}</div>}
        {!done && !disabled && (
          <button className="btn btn-outline" style={{ marginTop: 8, fontSize: '0.75rem', padding: '4px 12px', minHeight: 32 }} onClick={onToggle}>
            סמן כ{label}
          </button>
        )}
      </div>
    </div>
  )
}

export default function GuestPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [guest, setGuest] = useState<Guest | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Guest>>({})

  useEffect(() => {
    const g = guestStore.getById(id)
    if (!g) { router.push('/guests'); return }
    setGuest(g)
    setForm(g)
  }, [id, router])

  if (!guest) return null

  function reload() {
    const g = guestStore.getById(id)
    if (g) setGuest(g)
  }

  function markSent() {
    guestStore.update(id, { invitationSent: true, invitationSentAt: new Date().toISOString() })
    reload()
  }

  function markAcknowledged() {
    guestStore.update(id, { invitationAcknowledged: true, invitationAcknowledgedAt: new Date().toISOString() })
    reload()
  }

  function setRsvp(rsvp: RsvpStatus) {
    guestStore.update(id, { rsvpStatus: rsvp, attendanceConfirmed: rsvp === 'CONFIRMED', attendanceConfirmedAt: new Date().toISOString() })
    reload()
  }

  function handleDelete() {
    if (!confirm('למחוק את המוזמן?')) return
    guestStore.delete(id)
    router.push('/guests')
  }

  function saveEdit() {
    guestStore.update(id, form)
    reload()
    setEditing(false)
  }

  const settings = settingsStore.get()
  const waMsg = encodeURIComponent(settings.whatsappTemplate.replace('{name}', guest.name.split(' ')[0]))
  const waLink = `${buildWhatsAppLink(guest.phone)}?text=${waMsg}`

  const groupLabels: Record<string, string> = { FAMILY: 'משפחה', FRIENDS: 'חברים', WORK: 'עבודה', ARMY: 'צבא', OTHER: 'אחר' }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* Back */}
      <button className="btn btn-ghost" style={{ marginBottom: '1rem', gap: 6, paddingRight: 0 }} onClick={() => router.push('/guests')}>
        <ArrowRight size={16} /> חזרה למוזמנים
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card-lg" style={{ background: 'linear-gradient(135deg, #FDF6EC, #F8F5F0)', padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1.1rem' }}>
        <div className="avatar avatar-xl" style={{ margin: '0 auto 1rem' }}>{initials(guest.name)}</div>
        <h1 className="font-display" style={{ fontSize: '1.9rem', color: 'var(--charcoal)', marginBottom: 8 }}>{guest.name}</h1>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className="chip chip-muted" style={{ background: 'rgba(255,255,255,.7)', color: 'var(--gray-md)', border: '1px solid var(--border)' }}>
            {groupLabels[guest.group]}
          </span>
          <span className="chip chip-muted" style={{ background: 'rgba(255,255,255,.7)', color: 'var(--gray-md)', border: '1px solid var(--border)' }}>
            {guest.side === 'GROOM' ? 'צד חתן' : 'צד כלה'}
          </span>
        </div>
        {guest.note && <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--gray-md)', fontStyle: 'italic' }}>{guest.note}</p>}
      </motion.div>

      {/* Contact */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .07 }}
        className="card" style={{ padding: '1.1rem 1.25rem', marginBottom: '1.1rem', display: 'flex', gap: '0.75rem' }}>
        <a href={`tel:${guest.phone}`} className="btn btn-outline" style={{ flex: 1, gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={15} color="var(--gold)" />
          </div>
          {guest.phone}
        </a>
        <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-whatsapp" style={{ flex: 1, gap: 8 }}>
          <MessageCircle size={16} /> וואטסאפ
        </a>
      </motion.div>

      {/* Invitation timeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}
        className="card" style={{ padding: '1.25rem', marginBottom: '1.1rem' }}>
        <div className="section-bar">
          <div className="section-bar-title">
            <div className="section-bar-accent" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>מעקב הזמנה</span>
          </div>
        </div>
        <div className="timeline" style={{ gap: 0 }}>
          <TimelineStep step={1} label="הזמנה נשלחה" done={guest.invitationSent}
            timestamp={guest.invitationSentAt ? `נשלחה ${formatDate(guest.invitationSentAt)}` : undefined}
            onToggle={markSent} />
          <TimelineStep step={2} label="הזמנה התקבלה" done={guest.invitationAcknowledged}
            timestamp={guest.invitationAcknowledgedAt ? `התקבלה ${formatDate(guest.invitationAcknowledgedAt)}` : undefined}
            onToggle={markAcknowledged} disabled={!guest.invitationSent} />
          <TimelineStep step={3} label="אישור הגעה" done={guest.rsvpStatus === 'CONFIRMED'}
            timestamp={guest.attendanceConfirmedAt ? formatDate(guest.attendanceConfirmedAt) : undefined}
            onToggle={() => {}} disabled={!guest.invitationAcknowledged} />
        </div>

        {/* RSVP selector */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: 8 }}>
          {(['CONFIRMED', 'DECLINED', 'PENDING'] as RsvpStatus[]).map(r => (
            <button key={r} onClick={() => setRsvp(r)}
              className="btn" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem',
                background: guest.rsvpStatus === r
                  ? r === 'CONFIRMED' ? '#4CAF82' : r === 'DECLINED' ? '#E05C5C' : 'var(--charcoal)'
                  : 'white',
                color: guest.rsvpStatus === r ? 'white' : 'var(--gray-md)',
                border: `1.5px solid ${guest.rsvpStatus === r ? 'transparent' : 'var(--border)'}`,
              }}>
              {r === 'CONFIRMED' ? 'מגיע ✓' : r === 'DECLINED' ? 'לא מגיע ✗' : 'ממתין'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-whatsapp" style={{ justifyContent: 'center', gap: 10, fontSize: '0.95rem' }}>
          <MessageCircle size={18} /> שלח הזמנה בוואטסאפ
        </a>
        <button onClick={handleDelete} className="btn btn-ghost" style={{ color: 'var(--danger)', fontSize: '0.82rem' }}>
          <Trash2 size={14} /> מחיקת מוזמן
        </button>
      </motion.div>
    </div>
  )
}
