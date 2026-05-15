'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { quoteStore, expenseStore } from '@/lib/store'
import QuoteCard from './QuoteCard'
import type { Quote } from '@/lib/types'

function formatILS(n: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n)
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

interface AddQuoteDrawerProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Quote, 'id' | 'createdAt'>) => void
  entityType: Quote['entityType']
  entityId: string
  entityName?: string
  editQuote?: Quote | null
}

function AddQuoteDrawer({ open, onClose, onSave, entityType, entityId, entityName, editQuote }: AddQuoteDrawerProps) {
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [selectNow, setSelectNow] = useState(false)

  useEffect(() => {
    if (editQuote) {
      setAmount(String(editQuote.amount))
      setTitle(editQuote.title)
      setNote(editQuote.note || '')
      setValidUntil(editQuote.validUntil ? editQuote.validUntil.slice(0, 10) : '')
      setSelectNow(editQuote.isSelected)
    } else {
      setAmount(''); setTitle(''); setNote(''); setValidUntil(''); setSelectNow(false)
    }
  }, [editQuote, open])

  function handleSave() {
    if (!amount || !title.trim()) return
    onSave({
      entityType, entityId, entityName,
      title: title.trim(),
      amount: parseFloat(amount.replace(/,/g, '')),
      currency: 'ILS',
      isSelected: selectNow,
      note: note.trim() || undefined,
      receivedAt: new Date().toISOString(),
      validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
      installments: editQuote?.installments || [],
    })
  }

  function formatAmountInput(val: string) {
    const digits = val.replace(/[^\d]/g, '')
    if (!digits) return setAmount('')
    setAmount(parseInt(digits).toLocaleString('he-IL'))
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 80 }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white',
              borderRadius: '24px 24px 0 0', padding: '1.5rem 1.25rem 2rem', zIndex: 90,
              boxShadow: '0 -8px 40px rgba(0,0,0,.15)', maxHeight: '85vh', overflowY: 'auto',
            }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontWeight: 700, marginBottom: '1.1rem' }}>
              {editQuote ? 'עריכת הצעת מחיר' : 'הוספת הצעת מחיר'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>סכום (₪) *</label>
                <input
                  className="input"
                  placeholder="0"
                  value={amount}
                  onChange={e => formatAmountInput(e.target.value)}
                  type="text"
                  inputMode="numeric"
                  style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold)' }}
                />
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>כותרת / מה כלול *</label>
                <textarea
                  className="input"
                  placeholder="פרטי ההצעה..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ minHeight: 68 }}
                />
              </div>

              {/* Note */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>הערה (אופציונלי)</label>
                <input className="input" placeholder="הערה נוספת..." value={note} onChange={e => setNote(e.target.value)} />
              </div>

              {/* Valid until */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>בתוקף עד</label>
                <input className="input" type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
              </div>

              {/* Select now toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div
                  onClick={() => setSelectNow(s => !s)}
                  style={{
                    width: 40, height: 22, borderRadius: 9999, position: 'relative', cursor: 'pointer',
                    background: selectNow ? 'var(--gold)' : 'var(--border)',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 2, transition: 'right 0.2s',
                    right: selectNow ? 2 : 18,
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                  }} />
                </div>
                <span style={{ fontSize: '0.83rem', fontWeight: 500 }}>סמן כנבחרת מיד?</span>
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 4 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>ביטול</button>
                <button className="btn btn-gold" style={{ flex: 2 }} onClick={handleSave}
                  disabled={!amount || !title.trim()}>שמור הצעה</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Toast helper
function showToast(msg: string) {
  const el = document.createElement('div')
  el.textContent = msg
  Object.assign(el.style, {
    position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
    background: 'var(--charcoal)', color: 'white', padding: '0.6rem 1.2rem',
    borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, zIndex: '9999',
    whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,.2)',
  })
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 3000)
}

interface QuotesSectionProps {
  entityId: string
  entityType: Quote['entityType']
  entityName?: string
}

export default function QuotesSection({ entityId, entityType, entityName }: QuotesSectionProps) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [open, setOpen] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [editQuote, setEditQuote] = useState<Quote | null>(null)

  const load = useCallback(() => {
    setQuotes(quoteStore.getByEntity(entityType, entityId))
  }, [entityType, entityId])

  useEffect(() => { load() }, [load])

  function handleSave(data: Omit<Quote, 'id' | 'createdAt'>) {
    if (editQuote) {
      quoteStore.update(editQuote.id, data)
      if (data.isSelected) {
        quoteStore.setSelected(editQuote.id, entityType, entityId)
      }
    } else {
      const q = quoteStore.create(data)
      if (data.isSelected) {
        quoteStore.setSelected(q.id, entityType, entityId)
        // Add to budget
        expenseStore.create({
          description: `${entityName || entityType} — ${data.title}`,
          category: entityType === 'venue' ? 'VENUE' : entityType === 'attire' ? 'ATTIRE' : 'OTHER',
          amount: data.amount,
          isPaid: false,
          date: new Date().toISOString().slice(0, 10),
        })
        showToast(`הצעת ${entityName || ''} נוספה לתקציב: ${new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(data.amount)}`)
      }
    }
    load()
    setShowDrawer(false)
    setEditQuote(null)
  }

  function handleSelect(id: string) {
    quoteStore.setSelected(id, entityType, entityId)
    load()
    const q = quotes.find(q => q.id === id)
    if (q) {
      // Update/add expense
      expenseStore.create({
        description: `${entityName || entityType} — ${q.title}`,
        category: entityType === 'venue' ? 'VENUE' : entityType === 'attire' ? 'ATTIRE' : 'OTHER',
        amount: q.amount,
        isPaid: false,
        date: new Date().toISOString().slice(0, 10),
      })
      showToast(`הצעת ${entityName || ''} נוספה לתקציב: ${formatILS(q.amount)}`)
    }
    load()
  }

  function handleDelete(id: string) {
    quoteStore.delete(id)
    load()
  }

  function handleToggleInstallment(quoteId: string, installmentId: string, isPaid: boolean) {
    const q = quotes.find(x => x.id === quoteId)
    if (!q) return
    const installments = (q.installments || []).map(inst =>
      inst.id === installmentId ? { ...inst, isPaid, paidAt: isPaid ? new Date().toISOString() : undefined } : inst
    )
    quoteStore.update(quoteId, { installments })
    load()
  }

  const amounts = quotes.map(q => q.amount)
  const minAmt = amounts.length ? Math.min(...amounts) : 0
  const maxAmt = amounts.length ? Math.max(...amounts) : 0
  const selected = quotes.find(q => q.isSelected)

  return (
    <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
        }}
        aria-expanded={open}
      >
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--charcoal)' }}>
          הצעות מחיר {quotes.length > 0 && <span style={{ color: 'var(--gold)' }}>({quotes.length})</span>}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {selected && (
            <span style={{ fontSize: '0.7rem', color: '#2D7A55', fontWeight: 600 }}>
              ✓ {formatILS(selected.amount)}
            </span>
          )}
          {!selected && quotes.length > 0 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 600 }}>
              {formatILS(minAmt)}{quotes.length > 1 ? ` - ${formatILS(maxAmt)}` : ''}
            </span>
          )}
          {open ? <ChevronUp size={15} color="var(--gray-muted)" /> : <ChevronDown size={15} color="var(--gray-muted)" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}>
            <div style={{ paddingTop: '0.75rem' }}>
              {/* Summary bar */}
              {quotes.length > 1 && (
                <div style={{
                  display: 'flex', gap: 16, marginBottom: '0.75rem',
                  padding: '0.5rem 0.75rem', background: 'var(--bg)', borderRadius: 8,
                  fontSize: '0.72rem', color: 'var(--gray-muted)',
                }}>
                  <span>הכי זול: <strong style={{ color: 'var(--charcoal)' }}>{formatILS(minAmt)}</strong></span>
                  <span>הכי יקר: <strong style={{ color: 'var(--charcoal)' }}>{formatILS(maxAmt)}</strong></span>
                  {selected && <span>נבחר: <strong style={{ color: 'var(--gold)' }}>{formatILS(selected.amount)}</strong></span>}
                </div>
              )}

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {quotes.map((q, i) => (
                  <QuoteCard key={q.id} quote={q} index={i}
                    onSelect={handleSelect}
                    onEdit={q => { setEditQuote(q); setShowDrawer(true) }}
                    onDelete={handleDelete}
                    onToggleInstallment={handleToggleInstallment}
                  />
                ))}
              </div>

              {/* Add button */}
              <button
                className="btn btn-outline"
                style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.82rem' }}
                onClick={() => { setEditQuote(null); setShowDrawer(true) }}
              >
                <Plus size={14} /> הוסף הצעת מחיר
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && quotes.length === 0 && (
        <button
          className="btn btn-outline"
          style={{ marginTop: '0.5rem', fontSize: '0.78rem', padding: '4px 12px' }}
          onClick={() => { setOpen(true); setShowDrawer(true) }}
        >
          <Plus size={13} /> הוסף הצעת מחיר
        </button>
      )}

      <AddQuoteDrawer
        open={showDrawer}
        onClose={() => { setShowDrawer(false); setEditQuote(null) }}
        onSave={handleSave}
        entityType={entityType}
        entityId={entityId}
        entityName={entityName}
        editQuote={editQuote}
      />
    </div>
  )
}
