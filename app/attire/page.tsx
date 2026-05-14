'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Star } from 'lucide-react'
import { attireStore, formatILS } from '@/lib/store'
import ItemMediaDrawer from '@/components/ui/ItemMediaDrawer'
import type { AttireItem, AttireCategory, AttireStatus } from '@/lib/types'

const CATS: { key: AttireCategory | 'ALL'; label: string; icon: string }[] = [
  { key: 'ALL', label: 'הכל', icon: '👗' },
  { key: 'DRESS', label: 'שמלת כלה', icon: '👰' },
  { key: 'SUIT', label: 'חליפת חתן', icon: '🤵' },
  { key: 'VENUE_OUTFIT', label: 'בגדי אולם', icon: '✨' },
  { key: 'PARTY_OUTFIT', label: 'בגדי מסיבה', icon: '🎉' },
  { key: 'JEWELRY', label: 'תכשיטים', icon: '💍' },
  { key: 'SHOES', label: 'נעליים', icon: '👠' },
]
const STATUS: Record<AttireStatus, string> = { BROWSING: 'עיון', TRYING: 'התנסות', ORDERED: 'הוזמן', READY: 'מוכן' }

function Stars({ rating, onChange }: { rating?: number; onChange?: (r: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={13} fill={s <= (rating || 0) ? 'var(--gold)' : 'none'}
          color={s <= (rating || 0) ? 'var(--gold)' : 'var(--border)'}
          style={{ cursor: onChange ? 'pointer' : 'default' }}
          onClick={() => onChange?.(s)} />
      ))}
    </div>
  )
}

function AddDrawer({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: '', category: 'DRESS' as AttireCategory, designer: '', store: '', price: '', notes: '' })
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  function save() {
    if (!form.name.trim()) return
    attireStore.create({ ...form, price: form.price ? parseFloat(form.price) : undefined, status: 'BROWSING' })
    setForm({ name: '', category: 'DRESS', designer: '', store: '', price: '', notes: '' })
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
            <h3 style={{ fontWeight: 700, marginBottom: '1.1rem' }}>הוספת פריט ביגוד</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="input" placeholder="שם הפריט *" value={form.name} onChange={e => upd('name', e.target.value)} />
              <select className="input" value={form.category} onChange={e => upd('category', e.target.value)}>
                {CATS.filter(c => c.key !== 'ALL').map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input className="input" placeholder="מעצב/ת" value={form.designer} onChange={e => upd('designer', e.target.value)} />
                <input className="input" placeholder="חנות" value={form.store} onChange={e => upd('store', e.target.value)} />
              </div>
              <input className="input" placeholder="מחיר ₪" type="number" value={form.price} onChange={e => upd('price', e.target.value)} />
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

export default function AttirePage() {
  const [items, setItems] = useState<AttireItem[]>([])
  const [tab, setTab] = useState<AttireCategory | 'ALL'>('ALL')
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(() => setItems(attireStore.getAll()), [])
  useEffect(() => { load() }, [load])

  const visible = tab === 'ALL' ? items : items.filter(i => i.category === tab)

  function updateStatus(id: string, status: AttireStatus) { attireStore.update(id, { status }); load() }
  function updateRating(id: string, rating: number) { attireStore.update(id, { rating }); load() }
  function del(id: string) { if (!confirm('למחוק פריט?')) return; attireStore.delete(id); load() }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h1 className="font-display" style={{ fontSize: '2rem', color: 'var(--charcoal)', lineHeight: 1 }}>ביגוד</h1>
        <button className="btn btn-gold" onClick={() => setShowAdd(true)}><Plus size={15} /> הוסף</button>
      </div>

      <div className="tab-bar" style={{ marginBottom: '1.1rem' }}>
        {CATS.map(c => {
          const count = c.key === 'ALL' ? items.length : items.filter(i => i.category === c.key).length
          return (
            <button key={c.key} onClick={() => setTab(c.key)} className={`tab-pill${tab === c.key ? ' active' : ''}`}>
              {c.icon} {c.label} {count > 0 && <span style={{ opacity: .65 }}>{count}</span>}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="card empty-state">
          <span style={{ fontSize: 48 }}>👗</span><h3>אין פריטים</h3><p>הוסף פריט ביגוד ראשון</p>
          <button className="btn btn-gold" onClick={() => setShowAdd(true)}><Plus size={15} /> הוסף פריט</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
          {visible.map((item, i) => (
            <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 5) * 0.05 }} className="card" style={{ padding: '1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--charcoal)' }}>{item.name}</div>
                  {item.designer && <div style={{ fontSize: '0.72rem', color: 'var(--gray-muted)', marginTop: 1 }}>{item.designer}</div>}
                  {item.store && <div style={{ fontSize: '0.72rem', color: 'var(--gray-muted)' }}>{item.store}</div>}
                  <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Stars rating={item.rating} onChange={r => updateRating(item.id, r)} />
                    {item.price && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--charcoal)' }}>{formatILS(item.price)}</span>}
                  </div>
                </div>
                <span className={`chip ${item.status === 'READY' ? 'chip-confirmed' : item.status === 'ORDERED' ? 'chip-sent' : 'chip-pending'}`}>
                  {STATUS[item.status]}
                </span>
              </div>
              <div style={{ marginTop: '0.85rem', display: 'flex', gap: 4 }}>
                {(Object.keys(STATUS) as AttireStatus[]).map(s => (
                  <button key={s} onClick={() => updateStatus(item.id, s)} className="btn"
                    style={{ flex: 1, fontSize: '0.62rem', padding: '3px 4px', minHeight: 26,
                      background: item.status === s ? 'var(--charcoal)' : 'var(--bg)',
                      color: item.status === s ? 'white' : 'var(--gray-muted)',
                      border: `1px solid ${item.status === s ? 'var(--charcoal)' : 'var(--border)'}` }}>
                    {STATUS[s]}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ItemMediaDrawer entityId={item.id} entityName={item.name} entityType="attire" />
                <button onClick={() => del(item.id)} style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: 'var(--danger)', cursor: 'pointer', opacity: .6 }}>מחיקה</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AddDrawer open={showAdd} onClose={() => setShowAdd(false)} onSave={() => { load(); setShowAdd(false) }} />
    </div>
  )
}
