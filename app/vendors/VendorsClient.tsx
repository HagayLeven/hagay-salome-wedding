'use client'

import { useState } from 'react'
import { addVendor, updateVendor, deleteVendor } from './actions'

type Vendor = {
  id: string
  name: string
  category: string
  contactName: string | null
  phone: string | null
  email: string | null
  priceQuote: number | null
  rating: number | null
  status: string
  notes: string | null
}

const CATEGORIES = [
  'DJ', 'צלם/וידאו', 'קייטרינג', 'פרחים/עיצוב', 'מאפרת',
  'רב/מסדר קידושין', 'מסיבה אחרי', 'תסרוקת כלה', 'אחר'
]

const statusLabel: Record<string, string> = {
  searching: 'מחפשים', meeting: 'בפגישה', signed: 'חתמנו', deposit: 'מקדמה', paid: 'שולם'
}
const statusColor: Record<string, string> = {
  searching: 'bg-gray-100 text-gray-600',
  meeting: 'bg-blue-100 text-blue-600',
  signed: 'bg-green-100 text-green-700',
  deposit: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-emerald-100 text-emerald-700',
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-gray-300 text-sm">☆☆☆☆☆</span>
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

function formatILS(n: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n)
}

type FormProps = { onClose: () => void; initial?: Vendor }

function VendorForm({ onClose, initial }: FormProps) {
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    if (initial) {
      await updateVendor(initial.id, formData)
    } else {
      await addVendor(formData)
    }
    setPending(false)
    onClose()
    window.location.reload()
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-pink-100 mb-4">
      <h3 className="font-bold text-gray-700 mb-4">{initial ? 'עריכת ספק' : 'הוספת ספק'}</h3>
      <form action={handleSubmit} className="grid sm:grid-cols-2 gap-3">
        <input name="name" defaultValue={initial?.name} placeholder="שם ספק *" required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <select name="category" defaultValue={initial?.category ?? CATEGORIES[0]} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input name="contactName" defaultValue={initial?.contactName ?? ''} placeholder="איש קשר" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input name="phone" defaultValue={initial?.phone ?? ''} placeholder="טלפון" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input name="email" defaultValue={initial?.email ?? ''} placeholder="אימייל" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input name="priceQuote" defaultValue={initial?.priceQuote ?? ''} placeholder="הצעת מחיר (₪)" type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <select name="rating" defaultValue={initial?.rating ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">דירוג</option>
          {[1,2,3,4,5].map(r => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
        </select>
        <select name="status" defaultValue={initial?.status ?? 'searching'} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="searching">מחפשים</option>
          <option value="meeting">בפגישה</option>
          <option value="signed">חתמנו</option>
          <option value="deposit">מקדמה</option>
          <option value="paid">שולם</option>
        </select>
        <textarea name="notes" defaultValue={initial?.notes ?? ''} placeholder="הערות" className="border border-gray-200 rounded-lg px-3 py-2 text-sm sm:col-span-2 resize-none h-20" />
        <div className="sm:col-span-2 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">ביטול</button>
          <button type="submit" disabled={pending} className="px-4 py-2 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50">
            {pending ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function VendorsClient({ initialVendors }: { initialVendors: Vendor[] }) {
  const [vendors, setVendors] = useState(initialVendors)
  const [showForm, setShowForm] = useState(false)
  const [editVendor, setEditVendor] = useState<Vendor | null>(null)
  const [filterCat, setFilterCat] = useState('all')

  const filtered = filterCat === 'all' ? vendors : vendors.filter(v => v.category === filterCat)

  async function handleDelete(id: string) {
    if (!confirm('למחוק ספק?')) return
    await deleteVendor(id)
    setVendors(vs => vs.filter(v => v.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
          <option value="all">כל הקטגוריות</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => { setShowForm(true); setEditVendor(null) }} className="px-4 py-1.5 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600">
          + הוסף ספק
        </button>
      </div>

      {(showForm && !editVendor) && <VendorForm onClose={() => setShowForm(false)} />}
      {editVendor && <VendorForm onClose={() => setEditVendor(null)} initial={editVendor} />}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-3 text-center text-gray-400 py-8">אין ספקים</div>
        )}
        {filtered.map(v => (
          <div key={v.id} className="bg-white rounded-2xl shadow-md p-4 border border-pink-50 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-gray-800">{v.name}</div>
                <div className="text-xs text-gray-400">{v.category}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[v.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {statusLabel[v.status] ?? v.status}
              </span>
            </div>
            <Stars rating={v.rating} />
            {v.priceQuote && <div className="text-sm font-medium text-pink-600">{formatILS(v.priceQuote)}</div>}
            {v.contactName && <div className="text-xs text-gray-500">איש קשר: {v.contactName}</div>}
            {v.phone && <div className="text-xs text-gray-500 dir-ltr text-right">{v.phone}</div>}
            {v.email && <div className="text-xs text-gray-500 truncate">{v.email}</div>}
            {v.notes && <div className="text-xs text-gray-400 border-t border-gray-50 pt-2">{v.notes}</div>}
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setEditVendor(v); setShowForm(false) }} className="text-xs text-blue-500 hover:underline">עריכה</button>
              <button onClick={() => handleDelete(v.id)} className="text-xs text-red-400 hover:underline">מחיקה</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
