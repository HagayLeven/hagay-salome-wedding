'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addAttireItem(formData: FormData) {
  const category = formData.get('category') as string
  const name = formData.get('name') as string
  const storeName = formData.get('storeName') as string
  const priceQuote = formData.get('priceQuote') as string
  const rating = formData.get('rating') as string
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string

  if (!name?.trim()) return { error: 'שם הוא שדה חובה' }

  await prisma.attireItem.create({
    data: {
      category,
      name: name.trim(),
      storeName: storeName || null,
      priceQuote: priceQuote ? parseFloat(priceQuote) : null,
      rating: rating ? parseInt(rating) : null,
      status,
      notes: notes || null,
    }
  })
  revalidatePath('/attire')
}

export async function updateAttireItem(id: string, formData: FormData) {
  const category = formData.get('category') as string
  const name = formData.get('name') as string
  const storeName = formData.get('storeName') as string
  const priceQuote = formData.get('priceQuote') as string
  const rating = formData.get('rating') as string
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string

  await prisma.attireItem.update({
    where: { id },
    data: {
      category,
      name,
      storeName: storeName || null,
      priceQuote: priceQuote ? parseFloat(priceQuote) : null,
      rating: rating ? parseInt(rating) : null,
      status,
      notes: notes || null,
    }
  })
  revalidatePath('/attire')
}

export async function deleteAttireItem(id: string) {
  await prisma.attireItem.delete({ where: { id } })
  revalidatePath('/attire')
}
