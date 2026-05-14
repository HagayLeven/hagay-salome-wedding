import { Guest, Vendor, Venue, AttireItem, Expense, Task, MediaItem, Settings, ActivityItem, WeddingUser, UserPermissions } from './types'

const KEYS = {
  guests: 'wp_guests',
  vendors: 'wp_vendors',
  venues: 'wp_venues',
  attire: 'wp_attire',
  expenses: 'wp_expenses',
  tasks: 'wp_tasks',
  media: 'wp_media',
  settings: 'wp_settings',
  activity: 'wp_activity',
  users: 'wp_users',
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function set<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function logActivity(description: string) {
  const items = get<ActivityItem[]>(KEYS.activity, [])
  items.unshift({ id: uid(), type: 'action', description, createdAt: new Date().toISOString() })
  set(KEYS.activity, items.slice(0, 20))
}

// ── Guests ──────────────────────────────────────────────
export const guestStore = {
  getAll: () => get<Guest[]>(KEYS.guests, []),
  getById: (id: string) => get<Guest[]>(KEYS.guests, []).find(g => g.id === id),
  create: (data: Omit<Guest, 'id' | 'createdAt'>) => {
    const guest: Guest = { ...data, id: uid(), createdAt: new Date().toISOString() }
    const all = get<Guest[]>(KEYS.guests, [])
    set(KEYS.guests, [guest, ...all])
    logActivity(`מוזמן חדש נוסף: ${guest.name}`)
    return guest
  },
  update: (id: string, data: Partial<Guest>) => {
    const all = get<Guest[]>(KEYS.guests, []).map(g => g.id === id ? { ...g, ...data } : g)
    set(KEYS.guests, all)
  },
  delete: (id: string) => {
    const all = get<Guest[]>(KEYS.guests, [])
    const name = all.find(g => g.id === id)?.name
    set(KEYS.guests, all.filter(g => g.id !== id))
    if (name) logActivity(`מוזמן הוסר: ${name}`)
  },
}

// ── Vendors ──────────────────────────────────────────────
export const vendorStore = {
  getAll: () => get<Vendor[]>(KEYS.vendors, []),
  getById: (id: string) => get<Vendor[]>(KEYS.vendors, []).find(v => v.id === id),
  create: (data: Omit<Vendor, 'id' | 'createdAt'>) => {
    const v: Vendor = { ...data, id: uid(), createdAt: new Date().toISOString() }
    set(KEYS.vendors, [v, ...get<Vendor[]>(KEYS.vendors, [])])
    logActivity(`ספק חדש נוסף: ${v.name}`)
    return v
  },
  update: (id: string, data: Partial<Vendor>) => {
    set(KEYS.vendors, get<Vendor[]>(KEYS.vendors, []).map(v => v.id === id ? { ...v, ...data } : v))
  },
  delete: (id: string) => {
    set(KEYS.vendors, get<Vendor[]>(KEYS.vendors, []).filter(v => v.id !== id))
  },
}

// ── Venues ──────────────────────────────────────────────
export const venueStore = {
  getAll: () => get<Venue[]>(KEYS.venues, []),
  getById: (id: string) => get<Venue[]>(KEYS.venues, []).find(v => v.id === id),
  create: (data: Omit<Venue, 'id' | 'createdAt'>) => {
    const v: Venue = { ...data, id: uid(), createdAt: new Date().toISOString() }
    set(KEYS.venues, [v, ...get<Venue[]>(KEYS.venues, [])])
    logActivity(`אולם חדש נוסף: ${v.name}`)
    return v
  },
  update: (id: string, data: Partial<Venue>) => {
    set(KEYS.venues, get<Venue[]>(KEYS.venues, []).map(v => v.id === id ? { ...v, ...data } : v))
  },
  delete: (id: string) => {
    set(KEYS.venues, get<Venue[]>(KEYS.venues, []).filter(v => v.id !== id))
  },
}

// ── Attire ──────────────────────────────────────────────
export const attireStore = {
  getAll: () => get<AttireItem[]>(KEYS.attire, []),
  getById: (id: string) => get<AttireItem[]>(KEYS.attire, []).find(a => a.id === id),
  create: (data: Omit<AttireItem, 'id' | 'createdAt'>) => {
    const a: AttireItem = { ...data, id: uid(), createdAt: new Date().toISOString() }
    set(KEYS.attire, [a, ...get<AttireItem[]>(KEYS.attire, [])])
    return a
  },
  update: (id: string, data: Partial<AttireItem>) => {
    set(KEYS.attire, get<AttireItem[]>(KEYS.attire, []).map(a => a.id === id ? { ...a, ...data } : a))
  },
  delete: (id: string) => {
    set(KEYS.attire, get<AttireItem[]>(KEYS.attire, []).filter(a => a.id !== id))
  },
}

// ── Expenses ──────────────────────────────────────────────
export const expenseStore = {
  getAll: () => get<Expense[]>(KEYS.expenses, []),
  create: (data: Omit<Expense, 'id' | 'createdAt'>) => {
    const e: Expense = { ...data, id: uid(), createdAt: new Date().toISOString() }
    set(KEYS.expenses, [e, ...get<Expense[]>(KEYS.expenses, [])])
    logActivity(`הוצאה חדשה נוספה: ₪${e.amount.toLocaleString()} - ${e.description}`)
    return e
  },
  update: (id: string, data: Partial<Expense>) => {
    set(KEYS.expenses, get<Expense[]>(KEYS.expenses, []).map(e => e.id === id ? { ...e, ...data } : e))
  },
  delete: (id: string) => {
    set(KEYS.expenses, get<Expense[]>(KEYS.expenses, []).filter(e => e.id !== id))
  },
}

// ── Tasks ──────────────────────────────────────────────
export const taskStore = {
  getAll: () => get<Task[]>(KEYS.tasks, []),
  create: (data: Omit<Task, 'id' | 'createdAt'>) => {
    const t: Task = { ...data, id: uid(), createdAt: new Date().toISOString() }
    set(KEYS.tasks, [t, ...get<Task[]>(KEYS.tasks, [])])
    return t
  },
  update: (id: string, data: Partial<Task>) => {
    set(KEYS.tasks, get<Task[]>(KEYS.tasks, []).map(t => t.id === id ? { ...t, ...data } : t))
  },
  delete: (id: string) => {
    set(KEYS.tasks, get<Task[]>(KEYS.tasks, []).filter(t => t.id !== id))
  },
}

// ── Media ──────────────────────────────────────────────
export const mediaStore = {
  getAll: () => get<MediaItem[]>(KEYS.media, []),
  getByEntity: (entityType: string, entityId?: string) =>
    get<MediaItem[]>(KEYS.media, []).filter(m =>
      m.entityType === entityType && (!entityId || m.entityId === entityId)
    ),
  create: (data: Omit<MediaItem, 'id' | 'createdAt'>) => {
    const m: MediaItem = { ...data, id: uid(), createdAt: new Date().toISOString() }
    set(KEYS.media, [m, ...get<MediaItem[]>(KEYS.media, [])])
    return m
  },
  delete: (id: string) => {
    set(KEYS.media, get<MediaItem[]>(KEYS.media, []).filter(m => m.id !== id))
  },
}

// ── Settings ──────────────────────────────────────────────
const defaultSettings: Settings = {
  weddingDate: '2026-12-31',
  groomName: 'חגי',
  brideName: 'סלומה',
  totalBudget: 0,
  whatsappTemplate: 'שלום {name}! 🎊 חגי וסלומה שמחים להזמין אותך לחתונתם! 💍 נשמח לראותך חוגג איתנו.',
  language: 'he',
}

export const settingsStore = {
  get: () => get<Settings>(KEYS.settings, defaultSettings),
  update: (data: Partial<Settings>) => {
    const current = get<Settings>(KEYS.settings, defaultSettings)
    set(KEYS.settings, { ...current, ...data })
  },
}

// ── Activity ──────────────────────────────────────────────
export const activityStore = {
  getAll: () => get<ActivityItem[]>(KEYS.activity, []),
}

// ── Users ──────────────────────────────────────────────
const DEFAULT_PERMISSIONS: UserPermissions = {
  guests: 'edit', vendors: 'edit', venues: 'edit',
  attire: 'edit', budget: 'edit', tasks: 'edit', gallery: 'edit',
}
const FAMILY_PERMISSIONS: UserPermissions = {
  guests: 'view', vendors: 'view', venues: 'view',
  attire: 'view', budget: 'hidden', tasks: 'view', gallery: 'view',
}

export const userStore = {
  getAll: () => get<WeddingUser[]>(KEYS.users, []),
  create: (data: Omit<WeddingUser, 'id' | 'createdAt'>) => {
    const users = userStore.getAll()
    const user: WeddingUser = { ...data, id: uid(), createdAt: new Date().toISOString() }
    set(KEYS.users, [...users, user])
    return user
  },
  update: (id: string, data: Partial<WeddingUser>) => {
    const users = userStore.getAll().map(u => u.id === id ? { ...u, ...data } : u)
    set(KEYS.users, users)
  },
  delete: (id: string) => {
    set(KEYS.users, userStore.getAll().filter(u => u.id !== id))
  },
  DEFAULT_PERMISSIONS,
  FAMILY_PERMISSIONS,
}

// ── Utils ──────────────────────────────────────────────
export function getDaysToWedding(): number {
  const settings = settingsStore.get()
  const wedding = new Date(settings.weddingDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  wedding.setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
}

export function formatILS(n: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n)
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function buildWhatsAppLink(phone: string) {
  const cleaned = phone.replace(/^0/, '972').replace(/[-\s]/g, '')
  return `https://wa.me/${cleaned}`
}
