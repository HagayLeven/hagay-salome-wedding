'use client'

import { useState } from 'react'
import { addAttireItem, updateAttireItem, deleteAttireItem } from './actions'

type AttireItem = {
  id: string
  category: string
  name: string
  storeName: string | null
  priceQuote: number | null
  rating: number | null
  status: string
  notes: string | null
}

const SECTIONS = [
  { key: 'dress', label: 'שמלת כלה', emoji: '👗' },
  { key: 'suit', label: 'חליפת חתן', emoji: '🤵' },
  { key: 'venue_outfit', label: 'בגדי אולם', emoji: '✨' },
  { key: 'party_outfit', label: 'בגדי מסיבה', emoji: '🎉' },
  { key: 'other', label: 'אחר', emoji: '👒' },
]

const statusLabel: Record<string, string> = {
  option: 'אופציה', trying: 'מנסים', chosen: 'נבחר', purchased: 'נרכש'
}
const statusColor: Record<string, string> = {
  option: 'bg-gray-100 text-gray-600',
  trying: 'bg-blue-100 text-blue-600',
  chosen: 'bg-yellow-100 text-yellow-700',
  purchased: 'bg-green-100 text-green-700',
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-gray-300 text-sm">☆☆☆☆☆</span>
  return <span className="text-yellow-400 text-sm">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
}

function formatILS(n: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n)
}

type FormProps = { onClose: () => void; initial?: AttireItem; defaultCategory?: string }

function AttireForm({ onClose, initial, defaultCategory }: FormProps) {
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    if (initial) await updateAttireItem(initial.id, formData)
    else await addAttireItem(formData)
    setPending(false)
    onClose()
    window.location.reload()
  }

  return (
    <div className="bg-pink-50 rounded-xl p-4 border border-pink-200 mb-3">
      <h4 className="font-semibold text-gray-700 mb-3">{initial ? 'עריכה' : 'הוספת פריט'}</h4>
      <form action={handleSubmit} className="grid sm:grid-cols-2 gap-2">
        <select name="category" defaultValue={initial?.category ?? defaultCategory ?? 'dress'} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          {SECTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <input name="name" defaultValue={initial?.name} placeholder="שם פריט *" required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input name="storeName" defaultValue={initial?.storeName ?? ''} placeholder="חנות / מעצב" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input name="priceQuote" defaultValue={initial?.priceQuote ?? ''} placeholder="מחיר (₪)" type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <select name="rating" defaultValue={initial?.rating ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">דירוג</option>
          {[1,2,3,4,5].map(r => <option key={r} value={r}>{'★'.repeat(r)}</option>)}
        </select>
        <select name="status" defaultValue={initial?.status ?? 'option'} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="option">אופציה</option>
          <option value="trying">מנסים</option>
          <option value="chosen">נבחר</option>
          <option value="purchased">נרכש</option>
        </select>
        <textarea name="notes" defaultValue={initial?.notes ?? ''} placeholder="הערות" className="border border-gray-200 rounded-lg px-3 py-2 text-sm sm:col-span-2 resize-none h-16" />
        <div className="sm:col-span-2 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">ביטול</button>
          <button type="submit" disabled={pending} className="px-4 py-1.5 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50">
            {pending ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function AttireClient({ initialItems }: { initialItems: AttireItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [showFormFor, setShowFormFor] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<AttireItem | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('למחוק פריט?')) return
    await deleteAttireItem(id)
    setItems(is => is.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-6">
      {SECTIONS.map(section => {
        const sectionItems = items.filter(i => i.category === section.key)
        return (
          <div key={section.key} className="bg-white rounded-2xl shadow-md p-5 border border-pink-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                <span>{section.emoji}</span> {section.label}
              </h2>
              <button
                onClick={() => { setShowFormFor(section.key); setEditItem(null) }}
                className="text-sm text-pink-500 hover:underline"
              >
                + הוסף
              </button>
            </div>

            {showFormFor === section.key && !editItem && (
              <AttireForm onClose={() => setShowFormFor(null)} defaultCategory={section.key} />
            )}
            {editItem && editItem.category === section.key && (
              <AttireForm onClose={() => setEditItem(null)} initial={editItem} />
            )}

            {sectionItems.length === 0 ? (
              <p className="text-gray-300 text-sm text-center py-3">אין פריטים</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {sectionItems.map(item => (
                  <div key={item.id} className={`rounded-xl p-3 border ${item.status === 'chosen' || item.status === 'purchased' ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[item.status]}`}>
                        {statusLabel[item.status]}
                      </span>
                    </div>
                    {item.storeName && <div className="text-xs text-gray-500 mt-0.5">{item.storeName}</div>}
                    <Stars rating={item.rating} />
                    {item.priceQuote && <div className="text-sm text-pink-600 mt-1">{formatILS(item.priceQuote)}</div>}
                    {item.notes && <div className="text-xs text-gray-400 mt-1">{item.notes}</div>}
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { setEditItem(item); setShowFormFor(null) }} className="text-xs text-blue-500 hover:underline">עריכה</button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:underline">מחיקה</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
