import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const entityType = formData.get('entityType') as string
    const entityId = formData.get('entityId') as string
    const caption = formData.get('caption') as string

    if (!file) {
      return NextResponse.json({ error: 'לא נשלח קובץ' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const ext = file.name.split('.').pop() ?? 'bin'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    const url = `/uploads/${filename}`
    const isVideo = file.type.startsWith('video/')
    const type = isVideo ? 'video' : 'image'

    const media = await prisma.media.create({
      data: {
        url,
        type,
        caption: caption || null,
        vendorId: entityType === 'vendor' ? entityId : undefined,
        venueId: entityType === 'venue' ? entityId : undefined,
        attireItemId: entityType === 'attire' ? entityId : undefined,
      }
    })

    return NextResponse.json({ url, id: media.id })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'שגיאה בהעלאת קובץ' }, { status: 500 })
  }
}
