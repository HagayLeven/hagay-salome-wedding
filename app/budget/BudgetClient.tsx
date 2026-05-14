'use client'

import { useState } from 'react'
import { setBudget, addExpense, deleteExpense, togglePaid } from './actions'

type Expense = {
  id: string
  category: string
  description: string
  amount: number
  isPaid: boolean
  date: Date
  notes: string | null
}

const CATEGORIES = [
  'אולם', 'קייטרינג', 'צלם/וידאו', 'DJ', 'פרחים/עיצוב',
  'שמלה', 'חליפה', 'הסעות', 'מקום לינה', 'הזמנות', 'אחר'
]

function formatILS(n: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n)
}

type Props = {
  initialBudget: number
  initialExpenses: Expense[]
}

export default function BudgetClient({ initialBudget, initialExpenses }: Props) {
  const [totalBudget, setTotalBudget] = useState(initialBudget)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [pending, setPending] = useState(false)

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const totalPaid = expenses.filter(e => e.isPaid).reduce((s, e) => s + e.amount, 0)
  const remaining = totalBudget - totalSpent
  const budgetPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0

  // Category breakdown
  const byCategory: Record<string, { total: number; paid: number }> = {}
  for (const e of expenses) {
    if (!byCategory[e.category]) byCategory[e.category] = { total: 0, paid: 0 }
    byCategory[e.category].total += e.amount
    if (e.isPaid) byCategory[e.category].paid += e.amount
  }

  async function handleSetBudget(formData: FormData) {
    setPending(true)
    await setBudget(formData)
    const val = parseFloat(formData.get('totalBudget') as string)
    if (!isNaN(val)) setTotalBudget(val)
    setPending(false)
    setShowBudgetForm(false)
  }

  async function handleAddExpense(formData: FormData) {
    setPending(true)
    await addExpense(formData)
    setPending(false)
    setShowExpenseForm(false)
    window.location.reload()
  }

  async function handleToggle(id: string, isPaid: boolean) {
    await togglePaid(id, !isPaid)
    setExpenses(es => es.map(e => e.id === id ? { ...e, isPaid: !isPaid } : e))
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק הוצאה?')) return
    await deleteExpense(id)
    setExpenses(es => es.filter(e => e.id !== id))
  }

  return (
    <div className="space-y-5">
      {/* Budget overview */}
      <div className="bg-white rounded-2xl shadow-md p-5 border border-pink-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-700">סיכום תקציב</h2>
          <button onClick={() => setShowBudgetForm(!showBudgetForm)} className="text-sm text-pink-500 hover:underline">
            {showBudgetForm ? 'ביטול' : 'עדכן תקציב'}
          </button>
        </div>

        {showBudgetForm && (
          <form action={handleSetBudget} className="flex gap-2 mb-4">
            <input name="totalBudget" type="number" defaultValue={totalBudget || ''} placeholder="תקציב כולל (₪)" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <button type="submit" disabled={pending} className="px-4 py-2 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50">
              {pending ? '...' : 'שמור'}
            </button>
          </form>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-700">{formatILS(totalBudget)}</div>
            <div className="text-xs text-gray-400">תקציב כולל</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-500">{formatILS(totalSpent)}</div>
            <div className="text-xs text-gray-400">מחויב</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{formatILS(totalPaid)}</div>
            <div className="text-xs text-gray-400">שולם</div>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-blue-600'}`}>{formatILS(remaining)}</div>
            <div className="text-xs text-gray-400">נשאר</div>
          </div>
        </div>

        {totalBudget > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{budgetPercent}% נוצל</span>
              <span>{formatILS(totalSpent)} / {formatILS(totalBudget)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${budgetPercent > 90 ? 'bg-red-500' : budgetPercent > 70 ? 'bg-yellow-400' : 'bg-green-500'}`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5 border border-pink-50">
          <h3 className="font-bold text-gray-700 mb-3">פירוט לפי קטגוריה</h3>
          <div className="space-y-2">
            {Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total).map(([cat, { total, paid }]) => (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-600 truncate">{cat}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-pink-400"
                    style={{ width: totalSpent > 0 ? `${(total / totalSpent) * 100}%` : '0' }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-700 w-24 text-left">{formatILS(total)}</div>
                <div className="text-xs text-green-600 w-20 text-left">{paid > 0 ? `שולם ${formatILS(paid)}` : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses list */}
      <div className="bg-white rounded-2xl shadow-md border border-pink-50">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-700">הוצאות</h3>
          <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="px-3 py-1.5 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600">
            + הוסף הוצאה
          </button>
        </div>

        {showExpenseForm && (
          <div className="p-4 border-b border-gray-50 bg-pink-50/30">
            <form action={handleAddExpense} className="grid sm:grid-cols-2 gap-2">
              <select name="category" className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input name="description" placeholder="תיאור *" required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input name="amount" type="number" placeholder="סכום (₪) *" required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input name="notes" placeholder="הערות" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowExpenseForm(false)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">ביטול</button>
                <button type="submit" disabled={pending} className="px-4 py-1.5 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50">
                  {pending ? '...' : 'שמור'}
                </button>
              </div>
            </form>
          </div>
        )}

        {expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-400">אין הוצאות עדיין</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {expenses.map(e => (
              <div key={e.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-pink-50/20 transition-colors ${e.isPaid ? 'opacity-70' : ''}`}>
                <button onClick={() => handleToggle(e.id, e.isPaid)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${e.isPaid ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'}`}>
                  {e.isPaid && <span className="text-white text-xs">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${e.isPaid ? 'line-through text-gray-400' : 'text-gray-800'}`}>{e.description}</div>
                  <div className="text-xs text-gray-400">{e.category} · {new Date(e.date).toLocaleDateString('he-IL')}</div>
                </div>
                <div className={`font-bold text-sm ${e.isPaid ? 'text-green-600' : 'text-gray-700'}`}>{formatILS(e.amount)}</div>
                {e.isPaid && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">שולם</span>}
                <button onClick={() => handleDelete(e.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
