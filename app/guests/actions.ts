'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addGuest(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const side = formData.get('side') as string
  const group = formData.get('group') as string
  const notes = formData.get('notes') as string

  if (!name?.trim()) return { error: 'שם הוא שדה חובה' }

  await prisma.guest.create({
    data: { name: name.trim(), phone: phone || null, side, group, notes: notes || null }
  })
  revalidatePath('/guests')
}

export async function updateRSVP(id: string, rsvp: string) {
  await prisma.guest.update({ where: { id }, data: { rsvp } })
  revalidatePath('/guests')
}

export async function deleteGuest(id: string) {
  await prisma.guest.delete({ where: { id } })
  revalidatePath('/guests')
}

export async function updateGuest(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const side = formData.get('side') as string
  const group = formData.get('group') as string
  const notes = formData.get('notes') as string
  const rsvp = formData.get('rsvp') as string

  await prisma.guest.update({
    where: { id },
    data: { name, phone: phone || null, side, group, notes: notes || null, rsvp }
  })
  revalidatePath('/guests')
}
