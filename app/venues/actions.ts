'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addVenue(formData: FormData) {
  const name = formData.get('name') as string
  const location = formData.get('location') as string
  const capacity = formData.get('capacity') as string
  const priceQuote = formData.get('priceQuote') as string
  const contactName = formData.get('contactName') as string
  const phone = formData.get('phone') as string
  const rating = formData.get('rating') as string
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string

  if (!name?.trim()) return { error: 'שם הוא שדה חובה' }

  await prisma.venue.create({
    data: {
      name: name.trim(),
      location: location || null,
      capacity: capacity ? parseInt(capacity) : null,
      priceQuote: priceQuote ? parseFloat(priceQuote) : null,
      contactName: contactName || null,
      phone: phone || null,
      rating: rating ? parseInt(rating) : null,
      status,
      notes: notes || null,
    }
  })
  revalidatePath('/venues')
}

export async function updateVenue(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const location = formData.get('location') as string
  const capacity = formData.get('capacity') as string
  const priceQuote = formData.get('priceQuote') as string
  const contactName = formData.get('contactName') as string
  const phone = formData.get('phone') as string
  const rating = formData.get('rating') as string
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string

  await prisma.venue.update({
    where: { id },
    data: {
      name,
      location: location || null,
      capacity: capacity ? parseInt(capacity) : null,
      priceQuote: priceQuote ? parseFloat(priceQuote) : null,
      contactName: contactName || null,
      phone: phone || null,
      rating: rating ? parseInt(rating) : null,
      status,
      notes: notes || null,
    }
  })
  revalidatePath('/venues')
}

export async function deleteVenue(id: string) {
  await prisma.venue.delete({ where: { id } })
  revalidatePath('/venues')
}
