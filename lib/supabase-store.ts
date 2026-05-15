'use client'
import { useEffect } from 'react'
import { supabase } from './supabase'
import type { Guest, Vendor, Venue, AttireItem, Expense, Task, Settings, Quote } from './types'

// ── Guests ──────────────────────────────────────────────
export const guestStore = {
  async getAll(): Promise<Guest[]> {
    const { data } = await supabase.from('guests').select('*').order('created_at', { ascending: false })
    return (data || []).map(mapGuest)
  },
  async getById(id: string): Promise<Guest | undefined> {
    const { data } = await supabase.from('guests').select('*').eq('id', id).single()
    return data ? mapGuest(data) : undefined
  },
  async create(input: Omit<Guest, 'id' | 'createdAt'>): Promise<Guest> {
    const { data, error } = await supabase.from('guests').insert([{
      name: input.name, phone: input.phone, whatsapp: input.whatsapp,
      side: input.side, group: input.group, rsvp_status: input.rsvpStatus,
      invitation_sent: input.invitationSent, invitation_sent_at: input.invitationSentAt,
      invitation_acknowledged: input.invitationAcknowledged, invitation_acknowledged_at: input.invitationAcknowledgedAt,
      attendance_confirmed: input.attendanceConfirmed, attendance_confirmed_at: input.attendanceConfirmedAt,
      note: input.note,
    }]).select().single()
    if (error) throw error
    return mapGuest(data)
  },
  async update(id: string, input: Partial<Guest>): Promise<void> {
    const patch: Record<string, unknown> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.phone !== undefined) patch.phone = input.phone
    if (input.whatsapp !== undefined) patch.whatsapp = input.whatsapp
    if (input.side !== undefined) patch.side = input.side
    if (input.group !== undefined) patch.group = input.group
    if (input.rsvpStatus !== undefined) patch.rsvp_status = input.rsvpStatus
    if (input.invitationSent !== undefined) patch.invitation_sent = input.invitationSent
    if (input.invitationSentAt !== undefined) patch.invitation_sent_at = input.invitationSentAt
    if (input.invitationAcknowledged !== undefined) patch.invitation_acknowledged = input.invitationAcknowledged
    if (input.invitationAcknowledgedAt !== undefined) patch.invitation_acknowledged_at = input.invitationAcknowledgedAt
    if (input.attendanceConfirmed !== undefined) patch.attendance_confirmed = input.attendanceConfirmed
    if (input.attendanceConfirmedAt !== undefined) patch.attendance_confirmed_at = input.attendanceConfirmedAt
    if (input.note !== undefined) patch.note = input.note
    await supabase.from('guests').update(patch).eq('id', id)
  },
  async delete(id: string): Promise<void> {
    await supabase.from('guests').delete().eq('id', id)
  },
}

function mapGuest(r: Record<string, unknown>): Guest {
  return {
    id: r.id as string,
    name: r.name as string,
    phone: (r.phone as string) || '',
    whatsapp: (r.whatsapp as string) || '',
    side: r.side as Guest['side'],
    group: r.group as Guest['group'],
    rsvpStatus: r.rsvp_status as Guest['rsvpStatus'],
    invitationSent: (r.invitation_sent as boolean) || false,
    invitationSentAt: r.invitation_sent_at as string | undefined,
    invitationAcknowledged: (r.invitation_acknowledged as boolean) || false,
    invitationAcknowledgedAt: r.invitation_acknowledged_at as string | undefined,
    attendanceConfirmed: (r.attendance_confirmed as boolean) || false,
    attendanceConfirmedAt: r.attendance_confirmed_at as string | undefined,
    note: r.note as string | undefined,
    createdAt: r.created_at as string,
  }
}

// ── Vendors ──────────────────────────────────────────────
export const vendorStore = {
  async getAll(): Promise<Vendor[]> {
    const { data } = await supabase.from('vendors').select('*').order('created_at', { ascending: false })
    return (data || []).map(mapVendor)
  },
  async getById(id: string): Promise<Vendor | undefined> {
    const { data } = await supabase.from('vendors').select('*').eq('id', id).single()
    return data ? mapVendor(data) : undefined
  },
  async create(input: Omit<Vendor, 'id' | 'createdAt'>): Promise<Vendor> {
    const { data, error } = await supabase.from('vendors').insert([{
      name: input.name, category: input.category, contact_name: input.contactName,
      phone: input.phone, email: input.email, price_quote: input.priceQuote,
      rating: input.rating, status: input.status, notes: input.notes, photos: input.photos || [],
    }]).select().single()
    if (error) throw error
    return mapVendor(data)
  },
  async update(id: string, input: Partial<Vendor>): Promise<void> {
    const patch: Record<string, unknown> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.category !== undefined) patch.category = input.category
    if (input.contactName !== undefined) patch.contact_name = input.contactName
    if (input.phone !== undefined) patch.phone = input.phone
    if (input.email !== undefined) patch.email = input.email
    if (input.priceQuote !== undefined) patch.price_quote = input.priceQuote
    if (input.rating !== undefined) patch.rating = input.rating
    if (input.status !== undefined) patch.status = input.status
    if (input.notes !== undefined) patch.notes = input.notes
    if (input.photos !== undefined) patch.photos = input.photos
    await supabase.from('vendors').update(patch).eq('id', id)
  },
  async delete(id: string): Promise<void> {
    await supabase.from('vendors').delete().eq('id', id)
  },
}

function mapVendor(r: Record<string, unknown>): Vendor {
  return {
    id: r.id as string,
    name: r.name as string,
    category: r.category as Vendor['category'],
    contactName: r.contact_name as string | undefined,
    phone: r.phone as string | undefined,
    email: r.email as string | undefined,
    priceQuote: r.price_quote as number | undefined,
    rating: r.rating as number | undefined,
    status: r.status as Vendor['status'],
    notes: r.notes as string | undefined,
    photos: (r.photos as string[]) || [],
    createdAt: r.created_at as string,
  }
}

// ── Venues ──────────────────────────────────────────────
export const venueStore = {
  async getAll(): Promise<Venue[]> {
    const { data } = await supabase.from('venues').select('*').order('created_at', { ascending: false })
    return (data || []).map(mapVenue)
  },
  async getById(id: string): Promise<Venue | undefined> {
    const { data } = await supabase.from('venues').select('*').eq('id', id).single()
    return data ? mapVenue(data) : undefined
  },
  async create(input: Omit<Venue, 'id' | 'createdAt'>): Promise<Venue> {
    const { data, error } = await supabase.from('venues').insert([{
      name: input.name, location: input.location, capacity: input.capacity,
      indoor: input.indoor, kosher: input.kosher, parking: input.parking,
      price_per_person: input.pricePerPerson, flat_price: input.flatPrice,
      contact_name: input.contactName, phone: input.phone,
      rating: input.rating, status: input.status, notes: input.notes, photos: input.photos || [],
    }]).select().single()
    if (error) throw error
    return mapVenue(data)
  },
  async update(id: string, input: Partial<Venue>): Promise<void> {
    const patch: Record<string, unknown> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.location !== undefined) patch.location = input.location
    if (input.capacity !== undefined) patch.capacity = input.capacity
    if (input.indoor !== undefined) patch.indoor = input.indoor
    if (input.kosher !== undefined) patch.kosher = input.kosher
    if (input.parking !== undefined) patch.parking = input.parking
    if (input.pricePerPerson !== undefined) patch.price_per_person = input.pricePerPerson
    if (input.flatPrice !== undefined) patch.flat_price = input.flatPrice
    if (input.contactName !== undefined) patch.contact_name = input.contactName
    if (input.phone !== undefined) patch.phone = input.phone
    if (input.rating !== undefined) patch.rating = input.rating
    if (input.status !== undefined) patch.status = input.status
    if (input.notes !== undefined) patch.notes = input.notes
    if (input.photos !== undefined) patch.photos = input.photos
    await supabase.from('venues').update(patch).eq('id', id)
  },
  async delete(id: string): Promise<void> {
    await supabase.from('venues').delete().eq('id', id)
  },
}

function mapVenue(r: Record<string, unknown>): Venue {
  return {
    id: r.id as string,
    name: r.name as string,
    location: r.location as string | undefined,
    capacity: r.capacity as number | undefined,
    indoor: r.indoor as boolean | undefined,
    kosher: r.kosher as boolean | undefined,
    parking: r.parking as boolean | undefined,
    pricePerPerson: r.price_per_person as number | undefined,
    flatPrice: r.flat_price as number | undefined,
    contactName: r.contact_name as string | undefined,
    phone: r.phone as string | undefined,
    rating: r.rating as number | undefined,
    status: r.status as Venue['status'],
    notes: r.notes as string | undefined,
    photos: (r.photos as string[]) || [],
    createdAt: r.created_at as string,
  }
}

// ── Attire ──────────────────────────────────────────────
export const attireStore = {
  async getAll(): Promise<AttireItem[]> {
    const { data } = await supabase.from('attire_items').select('*').order('created_at', { ascending: false })
    return (data || []).map(mapAttire)
  },
  async getById(id: string): Promise<AttireItem | undefined> {
    const { data } = await supabase.from('attire_items').select('*').eq('id', id).single()
    return data ? mapAttire(data) : undefined
  },
  async create(input: Omit<AttireItem, 'id' | 'createdAt'>): Promise<AttireItem> {
    const { data, error } = await supabase.from('attire_items').insert([{
      category: input.category, name: input.name, designer: input.designer,
      store: input.store, price: input.price, rating: input.rating,
      status: input.status, notes: input.notes, photos: input.photos || [],
    }]).select().single()
    if (error) throw error
    return mapAttire(data)
  },
  async update(id: string, input: Partial<AttireItem>): Promise<void> {
    const patch: Record<string, unknown> = {}
    if (input.category !== undefined) patch.category = input.category
    if (input.name !== undefined) patch.name = input.name
    if (input.designer !== undefined) patch.designer = input.designer
    if (input.store !== undefined) patch.store = input.store
    if (input.price !== undefined) patch.price = input.price
    if (input.rating !== undefined) patch.rating = input.rating
    if (input.status !== undefined) patch.status = input.status
    if (input.notes !== undefined) patch.notes = input.notes
    if (input.photos !== undefined) patch.photos = input.photos
    await supabase.from('attire_items').update(patch).eq('id', id)
  },
  async delete(id: string): Promise<void> {
    await supabase.from('attire_items').delete().eq('id', id)
  },
}

function mapAttire(r: Record<string, unknown>): AttireItem {
  return {
    id: r.id as string,
    category: r.category as AttireItem['category'],
    name: r.name as string,
    designer: r.designer as string | undefined,
    store: r.store as string | undefined,
    price: r.price as number | undefined,
    rating: r.rating as number | undefined,
    status: r.status as AttireItem['status'],
    notes: r.notes as string | undefined,
    photos: (r.photos as string[]) || [],
    createdAt: r.created_at as string,
  }
}

// ── Expenses ──────────────────────────────────────────────
export const expenseStore = {
  async getAll(): Promise<Expense[]> {
    const { data } = await supabase.from('expenses').select('*').order('created_at', { ascending: false })
    return (data || []).map(mapExpense)
  },
  async create(input: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const { data, error } = await supabase.from('expenses').insert([{
      description: input.description, category: input.category, amount: input.amount,
      is_paid: input.isPaid, date: input.date, receipt: input.receipt, notes: input.notes,
    }]).select().single()
    if (error) throw error
    return mapExpense(data)
  },
  async update(id: string, input: Partial<Expense>): Promise<void> {
    const patch: Record<string, unknown> = {}
    if (input.description !== undefined) patch.description = input.description
    if (input.category !== undefined) patch.category = input.category
    if (input.amount !== undefined) patch.amount = input.amount
    if (input.isPaid !== undefined) patch.is_paid = input.isPaid
    if (input.date !== undefined) patch.date = input.date
    if (input.receipt !== undefined) patch.receipt = input.receipt
    if (input.notes !== undefined) patch.notes = input.notes
    await supabase.from('expenses').update(patch).eq('id', id)
  },
  async delete(id: string): Promise<void> {
    await supabase.from('expenses').delete().eq('id', id)
  },
}

function mapExpense(r: Record<string, unknown>): Expense {
  return {
    id: r.id as string,
    description: r.description as string,
    category: r.category as Expense['category'],
    amount: r.amount as number,
    isPaid: (r.is_paid as boolean) || false,
    date: r.date as string,
    receipt: r.receipt as string | undefined,
    notes: r.notes as string | undefined,
    createdAt: r.created_at as string,
  }
}

// ── Tasks ──────────────────────────────────────────────
export const taskStore = {
  async getAll(): Promise<Task[]> {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    return (data || []).map(mapTask)
  },
  async create(input: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const { data, error } = await supabase.from('tasks').insert([{
      title: input.title, description: input.description, completed: input.completed,
      priority: input.priority, assignee: input.assignee, due_date: input.dueDate,
      category: input.category, completed_at: input.completedAt,
    }]).select().single()
    if (error) throw error
    return mapTask(data)
  },
  async update(id: string, input: Partial<Task>): Promise<void> {
    const patch: Record<string, unknown> = {}
    if (input.title !== undefined) patch.title = input.title
    if (input.description !== undefined) patch.description = input.description
    if (input.completed !== undefined) patch.completed = input.completed
    if (input.priority !== undefined) patch.priority = input.priority
    if (input.assignee !== undefined) patch.assignee = input.assignee
    if (input.dueDate !== undefined) patch.due_date = input.dueDate
    if (input.category !== undefined) patch.category = input.category
    if (input.completedAt !== undefined) patch.completed_at = input.completedAt
    await supabase.from('tasks').update(patch).eq('id', id)
  },
  async delete(id: string): Promise<void> {
    await supabase.from('tasks').delete().eq('id', id)
  },
}

function mapTask(r: Record<string, unknown>): Task {
  return {
    id: r.id as string,
    title: r.title as string,
    description: r.description as string | undefined,
    completed: (r.completed as boolean) || false,
    priority: r.priority as Task['priority'],
    assignee: r.assignee as Task['assignee'],
    dueDate: r.due_date as string | undefined,
    category: r.category as string | undefined,
    completedAt: r.completed_at as string | undefined,
    createdAt: r.created_at as string,
  }
}

// ── Settings ──────────────────────────────────────────────
export const settingsStore = {
  async get(): Promise<Settings> {
    const { data } = await supabase.from('budget').select('*').limit(1).single()
    if (!data) return {
      weddingDate: '2026-12-31', groomName: 'חגי', brideName: 'סלומה',
      totalBudget: 0, whatsappTemplate: '', language: 'he',
    }
    return {
      weddingDate: data.wedding_date || '2026-12-31',
      groomName: data.groom_name || 'חגי',
      brideName: data.bride_name || 'סלומה',
      totalBudget: data.total_budget || 0,
      whatsappTemplate: data.whatsapp_template || '',
      language: (data.language as 'he' | 'en') || 'he',
    }
  },
  async update(input: Partial<Settings>): Promise<void> {
    const { data: existing } = await supabase.from('budget').select('id').limit(1).single()
    const patch: Record<string, unknown> = {}
    if (input.weddingDate !== undefined) patch.wedding_date = input.weddingDate
    if (input.groomName !== undefined) patch.groom_name = input.groomName
    if (input.brideName !== undefined) patch.bride_name = input.brideName
    if (input.totalBudget !== undefined) patch.total_budget = input.totalBudget
    if (input.whatsappTemplate !== undefined) patch.whatsapp_template = input.whatsappTemplate
    if (input.language !== undefined) patch.language = input.language
    if (existing) {
      await supabase.from('budget').update(patch).eq('id', existing.id)
    } else {
      await supabase.from('budget').insert([patch])
    }
  },
}

// ── Quotes ──────────────────────────────────────────────
export const quoteStore = {
  async getAll(): Promise<Quote[]> {
    const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false })
    return (data || []).map(mapQuote)
  },
  async getByEntity(entityType: Quote['entityType'], entityId: string): Promise<Quote[]> {
    const { data } = await supabase.from('quotes').select('*')
      .eq('entity_type', entityType).eq('entity_id', entityId)
      .order('created_at', { ascending: false })
    return (data || []).map(mapQuote)
  },
  async create(input: Omit<Quote, 'id' | 'createdAt'>): Promise<Quote> {
    const { data, error } = await supabase.from('quotes').insert([{
      entity_type: input.entityType, entity_id: input.entityId, entity_name: input.entityName,
      title: input.title, amount: input.amount, currency: input.currency || 'ILS',
      is_selected: input.isSelected || false, note: input.note,
      received_at: input.receivedAt, valid_until: input.validUntil,
      installments: input.installments || [],
    }]).select().single()
    if (error) throw error
    return mapQuote(data)
  },
  async update(id: string, input: Partial<Quote>): Promise<void> {
    const patch: Record<string, unknown> = {}
    if (input.title !== undefined) patch.title = input.title
    if (input.amount !== undefined) patch.amount = input.amount
    if (input.currency !== undefined) patch.currency = input.currency
    if (input.isSelected !== undefined) patch.is_selected = input.isSelected
    if (input.note !== undefined) patch.note = input.note
    if (input.validUntil !== undefined) patch.valid_until = input.validUntil
    if (input.installments !== undefined) patch.installments = input.installments
    await supabase.from('quotes').update(patch).eq('id', id)
  },
  async delete(id: string): Promise<void> {
    await supabase.from('quotes').delete().eq('id', id)
  },
  async setSelected(id: string, entityType: Quote['entityType'], entityId: string): Promise<void> {
    // Deselect all for this entity
    await supabase.from('quotes').update({ is_selected: false })
      .eq('entity_type', entityType).eq('entity_id', entityId)
    // Select this one
    await supabase.from('quotes').update({ is_selected: true }).eq('id', id)
  },
}

function mapQuote(r: Record<string, unknown>): Quote {
  return {
    id: r.id as string,
    entityType: r.entity_type as Quote['entityType'],
    entityId: r.entity_id as string,
    entityName: r.entity_name as string | undefined,
    title: r.title as string,
    amount: r.amount as number,
    currency: (r.currency as string) || 'ILS',
    isSelected: (r.is_selected as boolean) || false,
    note: r.note as string | undefined,
    receivedAt: r.received_at as string,
    validUntil: r.valid_until as string | undefined,
    installments: (r.installments as Quote['installments']) || [],
    createdAt: r.created_at as string,
  }
}

// ── Realtime ──────────────────────────────────────────────
export function useRealtime(table: string, callback: () => void) {
  useEffect(() => {
    const channel = supabase.channel(`realtime:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => callback())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [table, callback])
}
