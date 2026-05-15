'use client'

import {
  apiGuestStore, apiVendorStore, apiVenueStore, apiAttireStore,
  apiExpenseStore, apiTaskStore, apiQuoteStore, apiSettingsStore,
} from './api-store'
import {
  guestStore, vendorStore, venueStore, attireStore,
  expenseStore, taskStore, quoteStore, settingsStore,
} from './store'

function lsKey(table: string) {
  const map: Record<string, string> = {
    guests: 'wp_guests',
    vendors: 'wp_vendors',
    venues: 'wp_venues',
    attire_items: 'wp_attire',
    expenses: 'wp_expenses',
    tasks: 'wp_tasks',
    quotes: 'wp_quotes',
    media: 'wp_media',
    settings: 'wp_settings',
  }
  return map[table]
}

function lsGet<T>(table: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const v = localStorage.getItem(lsKey(table))
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function lsSet(table: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(lsKey(table), JSON.stringify(value))
  } catch { /* ignore */ }
}

function makeSyncStore(table: string, api: ReturnType<typeof makeApiSlice>, ls: LsSlice) {
  return {
    getAll: async () => {
      try {
        const data = await api.getAll()
        lsSet(table, data)
        return data
      } catch {
        return ls.getAll()
      }
    },
    getById: async (id: string) => {
      try {
        return await api.getById(id)
      } catch {
        return ls.getById(id)
      }
    },
    create: async (data: Record<string, unknown>) => {
      try {
        const result = await api.create(data)
        // Refresh cache
        const all = await api.getAll()
        lsSet(table, all)
        return result
      } catch {
        return ls.create(data)
      }
    },
    update: async (id: string, data: Record<string, unknown>) => {
      try {
        const result = await api.update(id, data)
        const all = await api.getAll()
        lsSet(table, all)
        return result
      } catch {
        return ls.update(id, data)
      }
    },
    delete: async (id: string) => {
      try {
        await api.delete(id)
        const all = await api.getAll()
        lsSet(table, all)
      } catch {
        ls.delete(id)
      }
    },
  }
}

// Type helpers
type ApiStore = { getAll: () => Promise<unknown[]>; getById: (id: string) => Promise<unknown>; create: (d: Record<string, unknown>) => Promise<unknown>; update: (id: string, d: Record<string, unknown>) => Promise<unknown>; delete: (id: string) => Promise<unknown> }
type LsSlice = { getAll: () => unknown[]; getById: (id: string) => unknown; create: (d: unknown) => unknown; update: (id: string, d: unknown) => void; delete: (id: string) => void }
function makeApiSlice(store: ApiStore) { return store }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export const syncGuestStore = makeSyncStore('guests', makeApiSlice(apiGuestStore), {
  getAll: guestStore.getAll,
  getById: (id) => guestStore.getById(id),
  create: (d) => guestStore.create(d as unknown as Parameters<typeof guestStore.create>[0]),
  update: (id, d) => guestStore.update(id, d as unknown as Parameters<typeof guestStore.update>[1]),
  delete: (id) => guestStore.delete(id),
})

export const syncVendorStore = makeSyncStore('vendors', makeApiSlice(apiVendorStore), {
  getAll: vendorStore.getAll,
  getById: (id) => vendorStore.getById(id),
  create: (d) => vendorStore.create(d as unknown as Parameters<typeof vendorStore.create>[0]),
  update: (id, d) => vendorStore.update(id, d as unknown as Parameters<typeof vendorStore.update>[1]),
  delete: (id) => vendorStore.delete(id),
})

export const syncVenueStore = makeSyncStore('venues', makeApiSlice(apiVenueStore), {
  getAll: venueStore.getAll,
  getById: (id) => venueStore.getById(id),
  create: (d) => venueStore.create(d as unknown as Parameters<typeof venueStore.create>[0]),
  update: (id, d) => venueStore.update(id, d as unknown as Parameters<typeof venueStore.update>[1]),
  delete: (id) => venueStore.delete(id),
})

export const syncAttireStore = makeSyncStore('attire_items', makeApiSlice(apiAttireStore), {
  getAll: attireStore.getAll,
  getById: (id) => attireStore.getById(id),
  create: (d) => attireStore.create(d as unknown as Parameters<typeof attireStore.create>[0]),
  update: (id, d) => attireStore.update(id, d as unknown as Parameters<typeof attireStore.update>[1]),
  delete: (id) => attireStore.delete(id),
})

export const syncExpenseStore = makeSyncStore('expenses', makeApiSlice(apiExpenseStore), {
  getAll: expenseStore.getAll,
  getById: () => undefined,
  create: (d) => expenseStore.create(d as unknown as Parameters<typeof expenseStore.create>[0]),
  update: (id, d) => expenseStore.update(id, d as unknown as Parameters<typeof expenseStore.update>[1]),
  delete: (id) => expenseStore.delete(id),
})

export const syncTaskStore = makeSyncStore('tasks', makeApiSlice(apiTaskStore), {
  getAll: taskStore.getAll,
  getById: () => undefined,
  create: (d) => taskStore.create(d as unknown as Parameters<typeof taskStore.create>[0]),
  update: (id, d) => taskStore.update(id, d as unknown as Parameters<typeof taskStore.update>[1]),
  delete: (id) => taskStore.delete(id),
})

export const syncQuoteStore = {
  getAll: async () => {
    try {
      const data = await apiQuoteStore.getAll()
      lsSet('quotes', data)
      return data
    } catch {
      return quoteStore.getAll()
    }
  },
  getByEntity: async (entityType: string, entityId: string) => {
    try {
      return await apiQuoteStore.getByEntity(entityType, entityId)
    } catch {
      return quoteStore.getByEntity(entityType as Parameters<typeof quoteStore.getByEntity>[0], entityId)
    }
  },
  create: async (data: Record<string, unknown>) => {
    try {
      const result = await apiQuoteStore.create(data)
      const all = await apiQuoteStore.getAll()
      lsSet('quotes', all)
      return result
    } catch {
      return quoteStore.create(data as Parameters<typeof quoteStore.create>[0])
    }
  },
  update: async (id: string, data: Record<string, unknown>) => {
    try {
      const result = await apiQuoteStore.update(id, data)
      const all = await apiQuoteStore.getAll()
      lsSet('quotes', all)
      return result
    } catch {
      return quoteStore.update(id, data)
    }
  },
  delete: async (id: string) => {
    try {
      await apiQuoteStore.delete(id)
    } catch {
      quoteStore.delete(id)
    }
  },
  setSelected: async (id: string, entityType: string, entityId: string) => {
    try {
      await apiQuoteStore.setSelected(id, entityType, entityId)
    } catch {
      quoteStore.setSelected(id, entityType as Parameters<typeof quoteStore.setSelected>[1], entityId)
    }
  },
}

export const syncSettingsStore = {
  get: async () => {
    try {
      const data = await apiSettingsStore.get()
      if (data) lsSet('settings', data)
      return data ?? settingsStore.get()
    } catch {
      return settingsStore.get()
    }
  },
  update: async (data: Record<string, unknown>) => {
    try {
      const result = await apiSettingsStore.update(data)
      lsSet('settings', result)
      return result
    } catch {
      settingsStore.update(data)
    }
  },
}
