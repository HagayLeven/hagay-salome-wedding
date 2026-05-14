'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addVendor(formData: FormData) {
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const contactName = formData.get('contactName') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const priceQuote = formData.get('priceQuote') as string
  const rating = formData.get('rating') as string
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string

  if (!name?.trim()) return { error: 'שם הוא שדה חובה' }

  await prisma.vendor.create({
    data: {
      name: name.trim(),
      category,
      contactName: contactName || null,
      phone: phone || null,
      email: email || null,
      priceQuote: priceQuote ? parseFloat(priceQuote) : null,
      rating: rating ? parseInt(rating) : null,
      status,
      notes: notes || null,
    }
  })
  revalidatePath('/vendors')
}

export async function updateVendor(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const contactName = formData.get('contactName') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const priceQuote = formData.get('priceQuote') as string
  const rating = formData.get('rating') as string
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string

  await prisma.vendor.update({
    where: { id },
    data: {
      name,
      category,
      contactName: contactName || null,
      phone: phone || null,
      email: email || null,
      priceQuote: priceQuote ? parseFloat(priceQuote) : null,
      rating: rating ? parseInt(rating) : null,
      status,
      notes: notes || null,
    }
  })
  revalidatePath('/vendors')
}

export async function deleteVendor(id: string) {
  await prisma.vendor.delete({ where: { id } })
  revalidatePath('/vendors')
}
