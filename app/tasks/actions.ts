'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addTask(formData: FormData) {
  const title = formData.get('title') as string
  const dueDate = formData.get('dueDate') as string
  const category = formData.get('category') as string

  if (!title?.trim()) return { error: 'כותרת היא שדה חובה' }

  await prisma.task.create({
    data: {
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      category: category || null,
    }
  })
  revalidatePath('/tasks')
}

export async function toggleTask(id: string, completed: boolean) {
  await prisma.task.update({ where: { id }, data: { completed } })
  revalidatePath('/tasks')
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } })
  revalidatePath('/tasks')
}
