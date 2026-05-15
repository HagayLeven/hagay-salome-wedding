'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Check } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import CircularRing from '@/components/ui/CircularRing'
import { expenseStore, settingsStore, formatILS } from '@/lib/store'
import type { Expense, ExpenseCategory } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

function AddDrawer({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const { t } = useLang()
  const CATS_ADD: { key: ExpenseCategory; label: string }[] = [
    { key: 'VENUE', label: t('cat_venue') }, { key: 'CATERING', label: t('cat_catering') },
    { key: 'PHOTOGRAPHY', label: t('cat_photography') }, { key: 'MUSIC', label: t('cat_music') },
    { key: 'ATTIRE', label: t('cat_attire') }, { key: 'BEAUTY', label: t('cat_beauty') }, { key: 'OTHER', label: t('cat_other') },
  ]
  const [form, setForm] = useState({ description: '', category: 'OTHER' as ExpenseCategory, amount: '', isPaid: false, notes: '' })
  const upd = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  function save() {
    if (!form.description || !form.amount) return
    expenseStore.create({ ...form, amount: parseFloat(form.amount), date: new Date().toISOString() })
    setForm({ description: '', category: 'OTHER', amount: '', isPaid: false, notes: '' })
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
            <h3 style={{ fontWeight: 700, marginBottom: '1.1rem' }}>{t('addExpenseTitle')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="input" placeholder={`${t('description')} *`} value={form.description} onChange={e => upd('description', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <select className="input" value={form.category} onChange={e => upd('category', e.target.value)}>
                  {CATS_ADD.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
                <input className="input" placeholder={`${t('amount')} *`} type="number" value={form.amount} onChange={e => upd('amount', e.target.value)} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPaid} onChange={e => upd('isPaid', e.target.checked)} />
                {t('isPaid')}
              </label>
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

export default function BudgetPage() {
  const { t } = useLang()

  const CATS: { key: ExpenseCategory; label: string; color: string }[] = [
    { key: 'VENUE',       label: t('cat_venue'),        color: '#C9A96E' },
    { key: 'CATERING',    label: t('cat_catering'),     color: '#6B9FD4' },
    { key: 'PHOTOGRAPHY', label: t('cat_photography'),  color: '#4CAF82' },
    { key: 'MUSIC',       label: t('cat_music'),        color: '#F0A04B' },
    { key: 'ATTIRE',      label: t('cat_attire'),       color: '#E05C5C' },
    { key: 'BEAUTY',      label: t('cat_beauty'),       color: '#9B59B6' },
    { key: 'OTHER',       label: t('cat_other'),        color: '#999'    },
  ]

  function catLabel(k: string) { return CATS.find(c => c.key === k)?.label || k }
  function catColor(k: string) { return CATS.find(c => c.key === k)?.color || '#999' }

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [totalBudget, setTotalBudget] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const [editBudget, setEditBudget] = useState(false)

  const load = useCallback(() => {
    setExpenses(expenseStore.getAll())
    const s = settingsStore.get()
    setTotalBudget(s.totalBudget)
    setBudgetInput(String(s.totalBudget || ''))
  }, [])

  useEffect(() => { load() }, [load])

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const totalPaid  = expenses.filter(e => e.isPaid).reduce((s, e) => s + e.amount, 0)
  const remaining  = totalBudget - totalSpent
  const pct        = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0
  const ringColor  = pct > 90 ? '#E05C5C' : pct > 70 ? '#F0A04B' : '#C9A96E'

  const byCategory = CATS.map(c => ({
    ...c, amount: expenses.filter(e => e.category === c.key).reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.amount > 0)

  function saveBudget() {
    const n = parseFloat(budgetInput) || 0
    settingsStore.update({ totalBudget: n })
    setTotalBudget(n)
    setEditBudget(false)
  }

  function togglePaid(id: string, isPaid: boolean) {
    expenseStore.update(id, { isPaid: !isPaid })
    load()
  }

  function deleteExpense(id: string) {
    if (!confirm(t('delete') + '?')) return
    expenseStore.delete(id)
    load()
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '2rem', color: 'var(--charcoal)', lineHeight: 1 }}>{t('budget')}</h1>
        </div>
        <button className="btn btn-gold" onClick={() => setShowAdd(true)}><Plus size={15} /> {t('addExpense')}</button>
      </div>

      {/* Hero ring */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card-lg" style={{ padding: '2rem 1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #FDF6EC, #F8F5F0)', marginBottom: '1.1rem' }}>
        <CircularRing value={totalSpent} max={Math.max(totalBudget, totalSpent, 1)} size="xl"
          centerText={`${pct}%`} centerSub={t('usedBudget')} color={ringColor} />
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--charcoal)', fontVariantNumeric: 'tabular-nums' }}>{formatILS(totalSpent)}</div>
            <div className="label-caps">{t('spent')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#4CAF82', fontVariantNumeric: 'tabular-nums' }}>{formatILS(totalPaid)}</div>
            <div className="label-caps">{t('paid')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: remaining < 0 ? '#E05C5C' : 'var(--charcoal)', fontVariantNumeric: 'tabular-nums' }}>
              {formatILS(remaining)}
            </div>
            <div className="label-caps">{t('remaining')}</div>
          </div>
        </div>

        {/* Budget setting */}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {editBudget ? (
            <>
              <input className="input" type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)}
                style={{ width: 140, textAlign: 'center' }} placeholder={t('budgetAmount')} />
              <button className="btn btn-gold" style={{ minHeight: 36, padding: '0 12px' }} onClick={saveBudget}>{t('save')}</button>
            </>
          ) : (
            <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={() => setEditBudget(true)}>
              {t('totalBudgetLabel')}: {totalBudget > 0 ? formatILS(totalBudget) : t('budgetNotSet')} ✏️
            </button>
          )}
        </div>
      </motion.div>

      {/* Donut chart */}
      {byCategory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}
          className="card" style={{ padding: '1.25rem', marginBottom: '1.1rem' }}>
          <div className="section-bar">
            <div className="section-bar-title"><div className="section-bar-accent" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('categoryBreakdown')}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={byCategory} dataKey="amount" nameKey="label" cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70} paddingAngle={3}
                  animationBegin={0} animationDuration={800}>
                  {byCategory.map((c) => <Cell key={c.key} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatILS(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {byCategory.map(c => (
                <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', flex: 1, color: 'var(--gray-md)' }}>{c.label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--charcoal)' }}>{formatILS(c.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Expenses list */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}
        className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div className="section-bar-title"><div className="section-bar-accent" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('allExpenses')}</span>
          </div>
        </div>
        {expenses.length === 0 ? (
          <div className="empty-state">
            <Plus size={48} /><h3>{t('noExpenses')}</h3><p>{t('addFirstExpense')}</p>
          </div>
        ) : (
          <div>
            {expenses.map((e, i) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.85rem 1.1rem', borderBottom: i < expenses.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: catColor(e.category), flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--charcoal)' }}>{e.description}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-muted)', marginTop: 2 }}>
                    {catLabel(e.category)} · {new Date(e.date).toLocaleDateString('he-IL')}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--charcoal)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatILS(e.amount)}
                </div>
                <button onClick={() => togglePaid(e.id, e.isPaid)}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${e.isPaid ? '#4CAF82' : 'var(--border)'}`,
                    background: e.isPaid ? '#4CAF82' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, transition: 'all .2s' }}>
                  {e.isPaid && <Check size={13} color="white" strokeWidth={3} />}
                </button>
                <button onClick={() => deleteExpense(e.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--border)', cursor: 'pointer', padding: 4, transition: 'color .15s' }}
                  onMouseEnter={e2 => (e2.currentTarget.style.color = 'var(--danger)')}
                  onMouseLeave={e2 => (e2.currentTarget.style.color = 'var(--border)')}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <AddDrawer open={showAdd} onClose={() => setShowAdd(false)} onSave={() => { load(); setShowAdd(false) }} />
    </div>
  )
}
