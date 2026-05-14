'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Star, Phone, MapPin } from 'lucide-react'
import { venueStore, formatILS } from '@/lib/store'
import type { Venue, VenueStatus } from '@/lib/types'
import ItemMediaDrawer from '@/components/ui/ItemMediaDrawer'

const STATUS: Record<VenueStatus, { label: string; cls: string }> = {
  INTERESTED: { label: 'מעניין',  cls: 'chip chip-pending'  },
  VISITED:    { label: 'ביקרנו', cls: 'chip chip-sent'     },
  BOOKED:     { label: 'הוזמן',  cls: 'chip chip-confirmed' },
  REJECTED:   { label: 'דחינו',  cls: 'chip chip-declined'  },
}

function Stars({ rating, onChange }: { rating?: number; onChange?: (r: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={14} fill={s <= (rating || 0) ? 'var(--gold)' : 'none'}
          color={s <= (rating || 0) ? 'var(--gold)' : 'var(--border)'}
          style={{ cursor: onChange ? 'pointer' : 'default' }}
          onClick={() => onChange?.(s)} />
      ))}
    </div>
  )
}

function AddDrawer({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: '', location: '', capacity: '', pricePerPerson: '', phone: '', notes: '' })
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  function save() {
    if (!form.name.trim()) return
    venueStore.create({
      name: form.name, location: form.location, notes: form.notes, phone: form.phone, status: 'INTERESTED',
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
      pricePerPerson: form.pricePerPerson ? parseFloat(form.pricePerPerson) : undefined,
    })
    setForm({ name: '', location: '', capacity: '', pricePerPerson: '', phone: '', notes: '' })
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
            <h3 style={{ fontWeight: 700, marginBottom: '1.1rem' }}>הוספת אולם</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="input" placeholder="שם האולם *" value={form.name} onChange={e => upd('name', e.target.value)} />
              <input className="input" placeholder="מיקום" value={form.location} onChange={e => upd('location', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input className="input" placeholder="קיבולת אורחים" type="number" value={form.capacity} onChange={e => upd('capacity', e.target.value)} />
                <input className="input" placeholder="מחיר לאורח ₪" type="number" value={form.pricePerPerson} onChange={e => upd('pricePerPerson', e.target.value)} />
              </div>
              <input className="input" placeholder="טלפון" type="tel" value={form.phone} onChange={e => upd('phone', e.target.value)} />
              <textarea className="input" placeholder="הערות" value={form.notes} onChange={e => upd('notes', e.target.value)} style={{ minHeight: 72 }} />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
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

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(() => setVenues(venueStore.getAll()), [])
  useEffect(() => { load() }, [load])

  function updateStatus(id: string, status: VenueStatus) { venueStore.update(id, { status }); load() }
  function updateRating(id: string, rating: number) { venueStore.update(id, { rating }); load() }
  function del(id: string) { if (!confirm('למחוק אולם?')) return; venueStore.delete(id); load() }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h1 className="font-display" style={{ fontSize: '2rem', color: 'var(--charcoal)', lineHeight: 1 }}>אולמות</h1>
        <button className="btn btn-gold" onClick={() => setShowAdd(true)}><Plus size={15} /> הוסף</button>
      </div>

      {venues.length === 0 ? (
        <div className="card empty-state">
          <MapPin size={48} /><h3>אין אולמות</h3><p>הוסף את האולם הראשון שבדקתם</p>
          <button className="btn btn-gold" onClick={() => setShowAdd(true)}><Plus size={15} /> הוסף אולם</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {venues.map((v, i) => (
            <motion.div key={v.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 5) * 0.05 }} className="card" style={{ padding: '1.1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--charcoal)' }}>{v.name}</div>
                  {v.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: '0.75rem', color: 'var(--gray-muted)' }}>
                      <MapPin size={11} /> {v.location}
                    </div>
                  )}
                  <div style={{ marginTop: 6, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Stars rating={v.rating} onChange={r => updateRating(v.id, r)} />
                    {v.capacity && <span style={{ fontSize: '0.78rem', color: 'var(--gray-md)' }}>{v.capacity} אורחים</span>}
                    {v.pricePerPerson && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--charcoal)' }}>{formatILS(v.pricePerPerson)} / אורח</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={STATUS[v.status].cls}>{STATUS[v.status].label}</span>
                  {v.phone && (
                    <a href={`tel:${v.phone}`} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                      <Phone size={13} color="var(--gold)" />
                    </a>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '0.85rem', display: 'flex', gap: 4 }}>
                {(Object.keys(STATUS) as VenueStatus[]).map(s => (
                  <button key={s} onClick={() => updateStatus(v.id, s)} className="btn"
                    style={{ flex: 1, fontSize: '0.65rem', padding: '4px 4px', minHeight: 28,
                      background: v.status === s ? 'var(--charcoal)' : 'var(--bg)',
                      color: v.status === s ? 'white' : 'var(--gray-muted)',
                      border: `1px solid ${v.status === s ? 'var(--charcoal)' : 'var(--border)'}` }}>
                    {STATUS[s].label}
                  </button>
                ))}
              </div>
              {v.notes && <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--gray-muted)', fontStyle: 'italic' }}>{v.notes}</div>}
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ItemMediaDrawer entityId={v.id} entityName={v.name} entityType="venue" />
                <button onClick={() => del(v.id)} style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: 'var(--danger)', cursor: 'pointer', opacity: .6 }}>מחיקה</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AddDrawer open={showAdd} onClose={() => setShowAdd(false)} onSave={() => { load(); setShowAdd(false) }} />
    </div>
  )
}
