'use client'

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, options)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

function makeStore(table: string) {
  return {
    getAll: () => apiFetch(`/api/db/${table}`).catch(() => []),
    getById: (id: string) => apiFetch(`/api/db/${table}?id=${id}`).catch(() => null),
    create: (data: Record<string, unknown>) =>
      apiFetch(`/api/db/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      apiFetch(`/api/db/${table}?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiFetch(`/api/db/${table}?id=${id}`, { method: 'DELETE' }),
  }
}

export const apiGuestStore = makeStore('guests')
export const apiVendorStore = makeStore('vendors')
export const apiVenueStore = makeStore('venues')
export const apiAttireStore = makeStore('attire_items')
export const apiExpenseStore = makeStore('expenses')
export const apiTaskStore = makeStore('tasks')

export const apiQuoteStore = {
  ...makeStore('quotes'),
  getByEntity: async (type: string, id: string) => {
    const all = await apiFetch('/api/db/quotes').catch(() => [])
    return all.filter((q: Record<string, unknown>) => q.entity_type === type && q.entity_id === id)
  },
  setSelected: async (id: string, entityType: string, entityId: string) => {
    // Get all quotes for this entity, deselect all, then select the one
    const all = await apiFetch('/api/db/quotes').catch(() => [])
    const entityQuotes = all.filter(
      (q: Record<string, unknown>) => q.entity_type === entityType && q.entity_id === entityId
    )
    await Promise.all(
      entityQuotes.map((q: Record<string, unknown>) =>
        apiFetch(`/api/db/quotes?id=${q.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_selected: q.id === id ? 1 : 0 }),
        })
      )
    )
  },
}

export const apiSettingsStore = {
  get: () => apiFetch('/api/db/settings').catch(() => null),
  update: (data: Record<string, unknown>) =>
    apiFetch('/api/db/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
}
