import { db } from './turso'

let migrated = false

export async function migrate() {
  if (migrated) return
  migrated = true

  const statements = [
    `CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      whatsapp TEXT,
      side TEXT,
      group_type TEXT,
      rsvp_status TEXT DEFAULT 'PENDING',
      invitation_sent INTEGER DEFAULT 0,
      invitation_sent_at TEXT,
      invitation_acknowledged INTEGER DEFAULT 0,
      invitation_acknowledged_at TEXT,
      attendance_confirmed INTEGER DEFAULT 0,
      attendance_confirmed_at TEXT,
      note TEXT,
      created_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      contact_name TEXT,
      phone TEXT,
      email TEXT,
      price_quote REAL,
      rating INTEGER,
      status TEXT,
      notes TEXT,
      created_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS venues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      capacity INTEGER,
      indoor INTEGER,
      kosher INTEGER,
      parking INTEGER,
      price_per_person REAL,
      flat_price REAL,
      contact_name TEXT,
      phone TEXT,
      rating INTEGER,
      status TEXT,
      notes TEXT,
      created_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS attire_items (
      id TEXT PRIMARY KEY,
      category TEXT,
      name TEXT,
      designer TEXT,
      store TEXT,
      price REAL,
      rating INTEGER,
      status TEXT,
      notes TEXT,
      created_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      description TEXT,
      category TEXT,
      amount REAL,
      is_paid INTEGER DEFAULT 0,
      date TEXT,
      notes TEXT,
      created_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      completed INTEGER DEFAULT 0,
      priority TEXT,
      assignee TEXT,
      due_date TEXT,
      category TEXT,
      completed_at TEXT,
      created_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      entity_type TEXT,
      entity_id TEXT,
      entity_name TEXT,
      title TEXT,
      amount REAL,
      currency TEXT,
      is_selected INTEGER DEFAULT 0,
      note TEXT,
      received_at TEXT,
      valid_until TEXT,
      created_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      url TEXT,
      type TEXT,
      caption TEXT,
      entity_type TEXT,
      entity_id TEXT,
      entity_name TEXT,
      created_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'main',
      wedding_date TEXT,
      groom_name TEXT,
      bride_name TEXT,
      total_budget REAL,
      whatsapp_template TEXT,
      language TEXT
    )`,
  ]

  for (const sql of statements) {
    await db.execute(sql)
  }

  // Ensure default settings row exists
  await db.execute({
    sql: `INSERT OR IGNORE INTO settings (id, wedding_date, groom_name, bride_name, total_budget, whatsapp_template, language)
          VALUES ('main', '2026-12-31', 'חגי', 'סלומה', 0, 'שלום {name}! 🎊 חגי וסלומה שמחים להזמין אותך לחתונתם! 💍 נשמח לראותך חוגג איתנו.', 'he')`,
    args: [],
  })
}
