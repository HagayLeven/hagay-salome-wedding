import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const guests = sqliteTable('guests', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  side: text('side'), // 'GROOM' | 'BRIDE'
  group_type: text('group_type'), // 'FAMILY' | 'FRIENDS' | 'WORK' | 'ARMY' | 'OTHER'
  rsvp_status: text('rsvp_status').default('PENDING'), // 'PENDING' | 'CONFIRMED' | 'DECLINED'
  invitation_sent: integer('invitation_sent').default(0),
  invitation_sent_at: text('invitation_sent_at'),
  invitation_acknowledged: integer('invitation_acknowledged').default(0),
  invitation_acknowledged_at: text('invitation_acknowledged_at'),
  attendance_confirmed: integer('attendance_confirmed').default(0),
  attendance_confirmed_at: text('attendance_confirmed_at'),
  note: text('note'),
  created_at: text('created_at'),
})

export const vendors = sqliteTable('vendors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category'),
  contact_name: text('contact_name'),
  phone: text('phone'),
  email: text('email'),
  price_quote: real('price_quote'),
  rating: integer('rating'),
  status: text('status'),
  notes: text('notes'),
  created_at: text('created_at'),
})

export const venues = sqliteTable('venues', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location'),
  capacity: integer('capacity'),
  indoor: integer('indoor'),
  kosher: integer('kosher'),
  parking: integer('parking'),
  price_per_person: real('price_per_person'),
  flat_price: real('flat_price'),
  contact_name: text('contact_name'),
  phone: text('phone'),
  rating: integer('rating'),
  status: text('status'),
  notes: text('notes'),
  created_at: text('created_at'),
})

export const attire_items = sqliteTable('attire_items', {
  id: text('id').primaryKey(),
  category: text('category'),
  name: text('name'),
  designer: text('designer'),
  store: text('store'),
  price: real('price'),
  rating: integer('rating'),
  status: text('status'),
  notes: text('notes'),
  created_at: text('created_at'),
})

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  description: text('description'),
  category: text('category'),
  amount: real('amount'),
  is_paid: integer('is_paid').default(0),
  date: text('date'),
  notes: text('notes'),
  created_at: text('created_at'),
})

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title'),
  description: text('description'),
  completed: integer('completed').default(0),
  priority: text('priority'),
  assignee: text('assignee'),
  due_date: text('due_date'),
  category: text('category'),
  completed_at: text('completed_at'),
  created_at: text('created_at'),
})

export const quotes = sqliteTable('quotes', {
  id: text('id').primaryKey(),
  entity_type: text('entity_type'),
  entity_id: text('entity_id'),
  entity_name: text('entity_name'),
  title: text('title'),
  amount: real('amount'),
  currency: text('currency'),
  is_selected: integer('is_selected').default(0),
  note: text('note'),
  received_at: text('received_at'),
  valid_until: text('valid_until'),
  created_at: text('created_at'),
})

export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  url: text('url'),
  type: text('type'),
  caption: text('caption'),
  entity_type: text('entity_type'),
  entity_id: text('entity_id'),
  entity_name: text('entity_name'),
  created_at: text('created_at'),
})

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey().default('main'),
  wedding_date: text('wedding_date'),
  groom_name: text('groom_name'),
  bride_name: text('bride_name'),
  total_budget: real('total_budget'),
  whatsapp_template: text('whatsapp_template'),
  language: text('language'),
})
