'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Phone, ArrowRight, Check, MessageCircle, Trash2, Edit2 } from 'lucide-react'
import { guestStore, buildWhatsAppLink, settingsStore, formatDate } from '@/lib/store'
import type { Guest, RsvpStatus } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function TimelineStep({
  step, label, done, timestamp, onToggle, disabled, markAsLabel
}: { step: number; label: string; done: boolean; timestamp?: string; onToggle: () => void; disabled?: boolean; markAsLabel: string }) {
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
            {markAsLabel}{label}
          </button>
        )}
      </div>
    </div>
  )
}

export default function GuestPage() {
  const { t } = useLang()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [guest, setGuest] = useState<Guest | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Guest>>({})

  const groupLabels: Record<string, string> = {
    FAMILY: t('family'), FRIENDS: t('friends'), WORK: t('work'), ARMY: t('army'), OTHER: t('other')
  }

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
    if (!confirm(t('confirmDelete'))) return
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

  const rsvpLabel: Record<RsvpStatus, string> = {
    PENDING: t('pending'), CONFIRMED: t('arriving'), DECLINED: t('notArriving')
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* Back */}
      <button className="btn btn-ghost" style={{ marginBottom: '1rem', gap: 6, paddingRight: 0 }} onClick={() => router.push('/guests')}>
        <ArrowRight size={16} /> {t('backToGuests')}
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card-lg" style={{ background: 'linear-gradient(135deg, #FDF6EC, #F8F5F0)', padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1.1rem', position: 'relative' }}>

        {/* Edit toggle */}
        <button onClick={() => { if (editing) saveEdit(); else { setForm(guest); setEditing(true) } }}
          style={{ position: 'absolute', top: 14, left: 14, background: editing ? 'var(--gold)' : 'rgba(255,255,255,.8)',
            border: `1px solid ${editing ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 8, padding: '5px 8px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem',
            color: editing ? 'white' : 'var(--gray-md)', fontWeight: 600 }}>
          <Edit2 size={13} /> {editing ? t('save') : t('edit')}
        </button>

        {guest.photoUrl ? (
          <img src={guest.photoUrl} alt={guest.name}
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', display: 'block', border: '2px solid var(--gold)', boxShadow: '0 2px 12px rgba(201,169,110,.25)' }} />
        ) : (
          <div className="avatar avatar-xl" style={{ margin: '0 auto 1rem' }}>{initials(guest.name)}</div>
        )}

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', marginBottom: '0.85rem' }}>
            <input className="input" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, maxWidth: 260 }} />
            <input className="input" placeholder={t('nameOptional')} value={form.nameHe || ''}
              onChange={e => setForm(f => ({ ...f, nameHe: e.target.value }))}
              style={{ textAlign: 'center', fontSize: '0.85rem', maxWidth: 260 }} />
          </div>
        ) : (
          <>
            <h1 className="font-display" style={{ fontSize: '1.9rem', color: 'var(--charcoal)', marginBottom: 4 }}>{guest.name}</h1>
            {guest.nameHe && guest.nameHe !== guest.name && (
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-muted)', marginBottom: 8 }}>{guest.nameHe}</div>
            )}
          </>
        )}

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'center' }}>
            {/* Side toggle */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(['GROOM', 'BRIDE'] as const).map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, side: s }))} className="btn"
                  style={{ fontSize: '0.8rem', padding: '5px 16px',
                    background: (form.side || guest.side) === s ? (s === 'GROOM' ? '#6B9FD4' : '#C9A96E') : 'white',
                    color: (form.side || guest.side) === s ? 'white' : 'var(--gray-md)',
                    border: `1.5px solid ${(form.side || guest.side) === s ? 'transparent' : 'var(--border)'}` }}>
                  {s === 'GROOM' ? t('groomSide') : t('brideSide')}
                </button>
              ))}
            </div>
            {/* Group */}
            <select className="input" value={form.group || guest.group} onChange={e => setForm(f => ({ ...f, group: e.target.value as Guest['group'] }))}
              style={{ maxWidth: 180, textAlign: 'center' }}>
              <option value="FAMILY">{t('family')}</option>
              <option value="FRIENDS">{t('friends')}</option>
              <option value="WORK">{t('work')}</option>
              <option value="ARMY">{t('army')}</option>
              <option value="OTHER">{t('other')}</option>
            </select>
            {/* Phone */}
            <input className="input" placeholder={t('phone')} value={form.phone || ''} type="tel"
              onChange={e => setForm(f => ({ ...f, phone: e.target.value, whatsapp: e.target.value }))}
              style={{ maxWidth: 200, textAlign: 'center' }} />
            {/* Note */}
            <input className="input" placeholder={t('note')} value={form.note || ''}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              style={{ maxWidth: 260, textAlign: 'center' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button className="btn btn-outline" onClick={() => { setEditing(false); setForm(guest) }}>{t('cancel')}</button>
              <button className="btn btn-gold" onClick={saveEdit}>{t('save')}</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className="chip chip-muted" style={{ background: 'rgba(255,255,255,.7)', color: 'var(--gray-md)', border: '1px solid var(--border)' }}>
                {groupLabels[guest.group]}
              </span>
              <span className="chip chip-muted" style={{ background: 'rgba(255,255,255,.7)', color: 'var(--gray-md)', border: '1px solid var(--border)' }}>
                {guest.side === 'GROOM' ? t('groomSide') : t('brideSide')}
              </span>
            </div>
            {guest.note && <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--gray-md)', fontStyle: 'italic' }}>{guest.note}</p>}
          </>
        )}
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
          <MessageCircle size={16} /> WhatsApp
        </a>
      </motion.div>

      {/* Invitation timeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}
        className="card" style={{ padding: '1.25rem', marginBottom: '1.1rem' }}>
        <div className="section-bar">
          <div className="section-bar-title">
            <div className="section-bar-accent" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('invitationTracking')}</span>
          </div>
        </div>
        <div className="timeline" style={{ gap: 0 }}>
          <TimelineStep step={1} label={t('invitationSent')} done={guest.invitationSent}
            timestamp={guest.invitationSentAt ? `${formatDate(guest.invitationSentAt)}` : undefined}
            onToggle={markSent} markAsLabel={t('markAs')} />
          <TimelineStep step={2} label={t('invitationReceived')} done={guest.invitationAcknowledged}
            timestamp={guest.invitationAcknowledgedAt ? `${formatDate(guest.invitationAcknowledgedAt)}` : undefined}
            onToggle={markAcknowledged} disabled={!guest.invitationSent} markAsLabel={t('markAs')} />
          <TimelineStep step={3} label={t('attendanceConfirmed')} done={guest.rsvpStatus === 'CONFIRMED'}
            timestamp={guest.attendanceConfirmedAt ? formatDate(guest.attendanceConfirmedAt) : undefined}
            onToggle={() => {}} disabled={!guest.invitationAcknowledged} markAsLabel={t('markAs')} />
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
              {rsvpLabel[r]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-whatsapp" style={{ justifyContent: 'center', gap: 10, fontSize: '0.95rem' }}>
          <MessageCircle size={18} /> {t('sendWhatsApp')}
        </a>
        <button onClick={handleDelete} className="btn btn-ghost" style={{ color: 'var(--danger)', fontSize: '0.82rem' }}>
          <Trash2 size={14} /> {t('deleteGuest')}
        </button>
      </motion.div>
    </div>
  )
}
