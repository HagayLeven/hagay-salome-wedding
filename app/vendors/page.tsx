'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Star, Phone, MessageCircle } from 'lucide-react'
import { vendorStore, buildWhatsAppLink } from '@/lib/store'
import ItemMediaDrawer from '@/components/ui/ItemMediaDrawer'
import QuotesSection from '@/components/ui/QuotesSection'
import PriceBadge from '@/components/ui/PriceBadge'
import type { Vendor, VendorCategory, VendorStatus } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

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
  const { t } = useLang()
  const CATS_ADD: { key: VendorCategory; label: string }[] = [
    { key: 'PHOTOGRAPHER', label: t('photographer') }, { key: 'DJ', label: t('dj') },
    { key: 'CATERING', label: t('catering') }, { key: 'DESIGN', label: t('design') },
    { key: 'BEAUTY', label: t('beauty') }, { key: 'RABBI', label: t('rabbi') }, { key: 'OTHER', label: t('other') },
  ]
  const [form, setForm] = useState({ name: '', category: 'OTHER' as VendorCategory, phone: '', priceQuote: '', notes: '' })
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  function save() {
    if (!form.name.trim()) return
    vendorStore.create({ ...form, priceQuote: form.priceQuote ? parseFloat(form.priceQuote) : undefined, status: 'SEARCHING', rating: undefined })
    setForm({ name: '', category: 'OTHER', phone: '', priceQuote: '', notes: '' })
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
            <h3 style={{ fontWeight: 700, marginBottom: '1.1rem' }}>{t('addVendorTitle')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="input" placeholder={`${t('vendorName')} *`} value={form.name} onChange={e => upd('name', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <select className="input" value={form.category} onChange={e => upd('category', e.target.value)}>
                  {CATS_ADD.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
                <input className="input" placeholder={t('phone')} type="tel" value={form.phone} onChange={e => upd('phone', e.target.value)} />
              </div>
              <input className="input" placeholder={t('priceQuote')} type="number" value={form.priceQuote} onChange={e => upd('priceQuote', e.target.value)} />
              <textarea className="input" placeholder={t('notes')} value={form.notes} onChange={e => upd('notes', e.target.value)} style={{ minHeight: 72 }} />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>{t('cancel')}</button>
                <button className="btn btn-gold" style={{ flex: 2 }} onClick={save}>{t('save')}</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function VendorsPage() {
  const { t } = useLang()

  const CATS: { key: VendorCategory | 'ALL'; label: string }[] = [
    { key: 'ALL', label: t('all_') }, { key: 'PHOTOGRAPHER', label: t('photographer') }, { key: 'DJ', label: t('dj') },
    { key: 'CATERING', label: t('catering') }, { key: 'DESIGN', label: t('design') },
    { key: 'BEAUTY', label: t('beauty') }, { key: 'RABBI', label: t('rabbi') }, { key: 'OTHER', label: t('other') },
  ]
  const STATUS: Record<VendorStatus, { label: string; cls: string }> = {
    SEARCHING: { label: t('status_searching'), cls: 'chip chip-searching' },
    MEETING:   { label: t('status_meeting'),   cls: 'chip chip-meeting' },
    PROPOSAL:  { label: t('status_proposal'),  cls: 'chip chip-pending' },
    SIGNED:    { label: t('status_signed'),    cls: 'chip chip-signed' },
    DEPOSIT:   { label: t('status_deposit'),   cls: 'chip chip-deposit' },
    PAID:      { label: t('status_paid'),      cls: 'chip chip-paid' },
  }

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [tab, setTab] = useState<VendorCategory | 'ALL'>('ALL')
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(() => setVendors(vendorStore.getAll()), [])
  useEffect(() => { load() }, [load])

  const visible = tab === 'ALL' ? vendors : vendors.filter(v => v.category === tab)

  function updateStatus(id: string, status: VendorStatus) {
    vendorStore.update(id, { status }); load()
  }
  function updateRating(id: string, rating: number) {
    vendorStore.update(id, { rating }); load()
  }
  function del(id: string) {
    if (!confirm(t('delete') + '?')) return
    vendorStore.delete(id); load()
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h1 className="font-display" style={{ fontSize: '2rem', color: 'var(--charcoal)', lineHeight: 1 }}>{t('vendors')}</h1>
        <button className="btn btn-gold" onClick={() => setShowAdd(true)}><Plus size={15} /> {t('add')}</button>
      </div>

      <div className="tab-bar" style={{ marginBottom: '1.1rem' }}>
        {CATS.map(c => {
          const count = c.key === 'ALL' ? vendors.length : vendors.filter(v => v.category === c.key).length
          return (
            <button key={c.key} onClick={() => setTab(c.key)} className={`tab-pill${tab === c.key ? ' active' : ''}`}>
              {c.label} {count > 0 && <span style={{ opacity: .65 }}>{count}</span>}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="card empty-state">
          <Plus size={48} /><h3>{t('noVendors')}</h3><p>{t('addFirstVendor')}</p>
          <button className="btn btn-gold" onClick={() => setShowAdd(true)}><Plus size={15} /> {t('addVendor')}</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visible.map((v, i) => (
            <motion.div key={v.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 5) * 0.05 }} className="card" style={{ padding: '1.1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                  <div className="icon-circle icon-circle-md icon-circle-ghost">
                    <span style={{ fontSize: '1.1rem' }}>
                      {v.category === 'PHOTOGRAPHER' ? '📷' : v.category === 'DJ' ? '🎧' : v.category === 'CATERING' ? '🍽' : v.category === 'BEAUTY' ? '💄' : v.category === 'RABBI' ? '✡️' : '🤝'}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--charcoal)' }}>{v.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-muted)', marginTop: 2 }}>
                      {CATS.find(c => c.key === v.category)?.label}
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Stars rating={v.rating} onChange={r => updateRating(v.id, r)} />
                      <PriceBadge entityId={v.id} entityType="vendor" />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={STATUS[v.status].cls}>{STATUS[v.status].label}</span>
                  {v.phone && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={`tel:${v.phone}`} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <Phone size={13} color="var(--gold)" />
                      </a>
                      <a href={buildWhatsAppLink(v.phone)} target="_blank" rel="noreferrer" style={{ width: 30, height: 30, borderRadius: '50%', background: '#E8FBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <MessageCircle size={13} color="#25D366" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Status stepper */}
              <div style={{ marginTop: '0.85rem', display: 'flex', gap: 4, overflowX: 'auto' }}>
                {(Object.keys(STATUS) as VendorStatus[]).map(s => (
                  <button key={s} onClick={() => updateStatus(v.id, s)}
                    className="btn" style={{
                      flex: 1, fontSize: '0.65rem', padding: '4px 6px', minHeight: 28,
                      background: v.status === s ? 'var(--charcoal)' : 'var(--bg)',
                      color: v.status === s ? 'white' : 'var(--gray-muted)',
                      border: `1px solid ${v.status === s ? 'var(--charcoal)' : 'var(--border)'}`,
                      whiteSpace: 'nowrap',
                    }}>{STATUS[s].label}</button>
                ))}
              </div>

              {v.notes && <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--gray-muted)', fontStyle: 'italic' }}>{v.notes}</div>}

              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ItemMediaDrawer entityId={v.id} entityName={v.name} entityType="vendor" />
                <button onClick={() => del(v.id)} style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: 'var(--danger)', cursor: 'pointer', opacity: .6 }}>{t('delete')}</button>
              </div>

              <QuotesSection entityId={v.id} entityType="vendor" entityName={v.name} />
            </motion.div>
          ))}
        </div>
      )}

      <AddDrawer open={showAdd} onClose={() => setShowAdd(false)} onSave={() => { load(); setShowAdd(false) }} />
    </div>
  )
}
