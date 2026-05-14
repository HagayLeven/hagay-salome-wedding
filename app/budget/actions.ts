'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function setBudget(formData: FormData) {
  const totalBudget = parseFloat(formData.get('totalBudget') as string)
  if (isNaN(totalBudget)) return { error: 'סכום לא תקין' }

  await prisma.budgetConfig.upsert({
    where: { id: 'singleton' },
    update: { totalBudget },
    create: { id: 'singleton', totalBudget },
  })
  revalidatePath('/budget')
}

export async function addExpense(formData: FormData) {
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string)
  const notes = formData.get('notes') as string

  if (!description?.trim() || isNaN(amount)) return { error: 'שדות חובה חסרים' }

  await prisma.expense.create({
    data: { category, description: description.trim(), amount, notes: notes || null }
  })
  revalidatePath('/budget')
}

export async function updateExpense(id: string, formData: FormData) {
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string)
  const notes = formData.get('notes') as string

  await prisma.expense.update({
    where: { id },
    data: { category, description, amount, notes: notes || null }
  })
  revalidatePath('/budget')
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } })
  revalidatePath('/budget')
}

export async function togglePaid(id: string, isPaid: boolean) {
  await prisma.expense.update({ where: { id }, data: { isPaid } })
  revalidatePath('/budget')
}
