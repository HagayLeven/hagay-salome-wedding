'use client'

import { useState } from 'react'
import { addVenue, updateVenue, deleteVenue } from './actions'

type Venue = {
  id: string
  name: string
  location: string | null
  capacity: number | null
  priceQuote: number | null
  contactName: string | null
  phone: string | null
  notes: string | null
  rating: number | null
  status: string
}

const statusLabel: Record<string, string> = {
  interested: 'מתעניינים', visited: 'ביקרנו', booked: 'הזמנו', rejected: 'דחינו'
}
const statusColor: Record<string, string> = {
  interested: 'bg-blue-50 text-blue-600',
  visited: 'bg-yellow-50 text-yellow-700',
  booked: 'bg-green-100 text-green-700',
  rejected: 'bg-red-50 text-red-500',
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-gray-300 text-sm">☆☆☆☆☆</span>
  return <span className="text-yellow-400 text-sm">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
}

function formatILS(n: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n)
}

type FormProps = { onClose: () => void; initial?: Venue }

function VenueForm({ onClose, initial }: FormProps) {
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    if (initial) { await updateVenue(initial.id, formData) }
    else { await addVenue(formData) }
    setPending(false)
    onClose()
    window.location.reload()
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-pink-100 mb-4">
      <h3 className="font-bold text-gray-700 mb-4">{initial ? 'עריכת אולם' : 'הוספת אולם'}</h3>
      <form action={handleSubmit} className="grid sm:grid-cols-2 gap-3">
        <input name="name" defaultValue={initial?.name} placeholder="שם אולם *" required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input name="location" defaultValue={initial?.location ?? ''} placeholder="מיקום" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input name="capacity" defaultValue={initial?.capacity ?? ''} placeholder="קיבולת" type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input name="priceQuote" defaultValue={initial?.priceQuote ?? ''} placeholder="הצעת מחיר (₪)" type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input name="contactName" defaultValue={initial?.contactName ?? ''} placeholder="איש קשר" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input name="phone" defaultValue={initial?.phone ?? ''} placeholder="טלפון" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <select name="rating" defaultValue={initial?.rating ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">דירוג</option>
          {[1,2,3,4,5].map(r => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
        </select>
        <select name="status" defaultValue={initial?.status ?? 'interested'} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="interested">מתעניינים</option>
          <option value="visited">ביקרנו</option>
          <option value="booked">הזמנו</option>
          <option value="rejected">דחינו</option>
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

export default function VenuesClient({ initialVenues }: { initialVenues: Venue[] }) {
  const [venues, setVenues] = useState(initialVenues)
  const [showForm, setShowForm] = useState(false)
  const [editVenue, setEditVenue] = useState<Venue | null>(null)
  const [compare, setCompare] = useState<string[]>([])

  async function handleDelete(id: string) {
    if (!confirm('למחוק אולם?')) return
    await deleteVenue(id)
    setVenues(vs => vs.filter(v => v.id !== id))
    setCompare(c => c.filter(i => i !== id))
  }

  function toggleCompare(id: string) {
    setCompare(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const compareVenues = venues.filter(v => compare.includes(v.id))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setShowForm(true); setEditVenue(null) }} className="px-4 py-1.5 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600">
          + הוסף אולם
        </button>
      </div>

      {(showForm && !editVenue) && <VenueForm onClose={() => setShowForm(false)} />}
      {editVenue && <VenueForm onClose={() => setEditVenue(null)} initial={editVenue} />}

      {/* Compare panel */}
      {compareVenues.length >= 2 && (
        <div className="bg-white rounded-2xl shadow-md p-4 border border-yellow-200">
          <h3 className="font-bold text-gray-700 mb-3">📊 השוואת אולמות</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 text-right font-medium text-gray-500">שדה</th>
                  {compareVenues.map(v => (
                    <th key={v.id} className="py-2 text-right font-medium text-gray-700">{v.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="py-2 text-gray-500">מיקום</td>
                  {compareVenues.map(v => <td key={v.id} className="py-2">{v.location ?? '—'}</td>)}
                </tr>
                <tr>
                  <td className="py-2 text-gray-500">קיבולת</td>
                  {compareVenues.map(v => <td key={v.id} className="py-2">{v.capacity ? `${v.capacity} איש` : '—'}</td>)}
                </tr>
                <tr>
                  <td className="py-2 text-gray-500">מחיר</td>
                  {compareVenues.map(v => <td key={v.id} className="py-2">{v.priceQuote ? formatILS(v.priceQuote) : '—'}</td>)}
                </tr>
                <tr>
                  <td className="py-2 text-gray-500">דירוג</td>
                  {compareVenues.map(v => <td key={v.id} className="py-2"><Stars rating={v.rating} /></td>)}
                </tr>
                <tr>
                  <td className="py-2 text-gray-500">סטטוס</td>
                  {compareVenues.map(v => (
                    <td key={v.id} className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[v.status]}`}>
                        {statusLabel[v.status]}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.length === 0 && (
          <div className="col-span-3 text-center text-gray-400 py-8">אין אולמות</div>
        )}
        {venues.map(v => (
          <div key={v.id} className={`bg-white rounded-2xl shadow-md p-4 border transition-all ${compare.includes(v.id) ? 'border-yellow-300 shadow-yellow-100' : 'border-pink-50'}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-bold text-gray-800">{v.name}</div>
                {v.location && <div className="text-xs text-gray-400">{v.location}</div>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[v.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {statusLabel[v.status] ?? v.status}
              </span>
            </div>
            <Stars rating={v.rating} />
            <div className="text-sm space-y-1 mt-2">
              {v.capacity && <div className="text-gray-600">👥 {v.capacity} איש</div>}
              {v.priceQuote && <div className="text-pink-600 font-medium">{formatILS(v.priceQuote)}</div>}
              {v.contactName && <div className="text-gray-500 text-xs">📞 {v.contactName}{v.phone ? ` — ${v.phone}` : ''}</div>}
            </div>
            {v.notes && <div className="text-xs text-gray-400 border-t border-gray-50 pt-2 mt-2">{v.notes}</div>}
            <div className="flex gap-2 pt-2 mt-1 border-t border-gray-50">
              <button onClick={() => toggleCompare(v.id)} className={`text-xs px-2 py-1 rounded ${compare.includes(v.id) ? 'bg-yellow-100 text-yellow-700' : 'text-gray-400 hover:text-yellow-500'}`}>
                {compare.includes(v.id) ? '✓ בהשוואה' : '+ השווה'}
              </button>
              <button onClick={() => { setEditVenue(v); setShowForm(false) }} className="text-xs text-blue-500 hover:underline">עריכה</button>
              <button onClick={() => handleDelete(v.id)} className="text-xs text-red-400 hover:underline">מחיקה</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
