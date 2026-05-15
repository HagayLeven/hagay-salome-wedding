import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/turso'
import { migrate } from '@/lib/migrate'

let initialized = false

async function ensureInit() {
  if (!initialized) {
    await migrate()
    initialized = true
  }
}

type Params = { params: Promise<{ table: string }> }

const ALLOWED_TABLES = new Set([
  'guests', 'vendors', 'venues', 'attire_items',
  'expenses', 'tasks', 'quotes', 'media', 'settings',
])

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export async function GET(req: NextRequest, { params }: Params) {
  await ensureInit()
  const { table } = await params

  if (!ALLOWED_TABLES.has(table)) {
    return json({ error: 'Unknown table' }, 400)
  }

  const id = req.nextUrl.searchParams.get('id')

  if (table === 'settings') {
    const result = await db.execute('SELECT * FROM settings WHERE id = ?', ['main'])
    return json(result.rows[0] ?? null)
  }

  if (id) {
    const result = await db.execute(`SELECT * FROM ${table} WHERE id = ?`, [id])
    return json(result.rows[0] ?? null)
  }

  const result = await db.execute(`SELECT * FROM ${table} ORDER BY created_at DESC`)
  return json(result.rows)
}

export async function POST(req: NextRequest, { params }: Params) {
  await ensureInit()
  const { table } = await params

  if (!ALLOWED_TABLES.has(table) || table === 'settings') {
    return json({ error: 'Not allowed' }, 400)
  }

  const body = await req.json()
  const id = crypto.randomUUID()
  const created_at = new Date().toISOString()
  const record = { id, created_at, ...body }

  const keys = Object.keys(record)
  const placeholders = keys.map(() => '?').join(', ')
  const values = keys.map(k => record[k])

  await db.execute(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
    values,
  )

  return json(record, 201)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  await ensureInit()
  const { table } = await params

  if (!ALLOWED_TABLES.has(table)) {
    return json({ error: 'Unknown table' }, 400)
  }

  const body = await req.json()

  if (table === 'settings') {
    const keys = Object.keys(body)
    const setClause = keys.map(k => `${k} = ?`).join(', ')
    const values = [...keys.map(k => body[k]), 'main']
    await db.execute(`UPDATE settings SET ${setClause} WHERE id = ?`, values)
    const result = await db.execute('SELECT * FROM settings WHERE id = ?', ['main'])
    return json(result.rows[0])
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return json({ error: 'id required' }, 400)

  const keys = Object.keys(body)
  const setClause = keys.map(k => `${k} = ?`).join(', ')
  const values = [...keys.map(k => body[k]), id]
  await db.execute(`UPDATE ${table} SET ${setClause} WHERE id = ?`, values)

  const result = await db.execute(`SELECT * FROM ${table} WHERE id = ?`, [id])
  return json(result.rows[0])
}

export async function DELETE(req: NextRequest, { params }: Params) {
  await ensureInit()
  const { table } = await params

  if (!ALLOWED_TABLES.has(table) || table === 'settings') {
    return json({ error: 'Not allowed' }, 400)
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return json({ error: 'id required' }, 400)

  await db.execute(`DELETE FROM ${table} WHERE id = ?`, [id])
  return json({ ok: true })
}
