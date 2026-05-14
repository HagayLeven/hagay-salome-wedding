'use client'

import { useState } from 'react'
import { addTask, toggleTask, deleteTask } from './actions'

type Task = {
  id: string
  title: string
  dueDate: Date | null
  completed: boolean
  category: string | null
}

const CATEGORIES = ['אולם', 'ספקים', 'מוזמנים', 'ביגוד', 'נסיעות', 'אחר']

export default function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [filterCat, setFilterCat] = useState('all')
  const [pending, setPending] = useState(false)

  const open = tasks.filter(t => !t.completed)
  const done = tasks.filter(t => t.completed)

  const filtered = (showCompleted ? tasks : open).filter(t => {
    if (filterCat !== 'all' && t.category !== filterCat) return false
    return true
  })

  async function handleAdd(formData: FormData) {
    setPending(true)
    await addTask(formData)
    setPending(false)
    setShowForm(false)
    window.location.reload()
  }

  async function handleToggle(id: string, completed: boolean) {
    await toggleTask(id, !completed)
    setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: !completed } : t))
  }

  async function handleDelete(id: string) {
    await deleteTask(id)
    setTasks(ts => ts.filter(t => t.id !== id))
  }

  const isOverdue = (t: Task) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-3">
        <div className="bg-white rounded-xl p-3 text-center border border-pink-50 shadow-sm flex-1">
          <div className="text-2xl font-bold text-pink-600">{open.length}</div>
          <div className="text-xs text-gray-400">פתוחות</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-green-50 shadow-sm flex-1">
          <div className="text-2xl font-bold text-green-500">{done.length}</div>
          <div className="text-xs text-gray-400">הושלמו</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
          <option value="all">כל הקטגוריות</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer">
          <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} className="rounded" />
          הצג הושלמות
        </label>
        <div className="flex-1" />
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-1.5 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600">
          + הוסף משימה
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-md p-4 border border-pink-100">
          <form action={handleAdd} className="grid sm:grid-cols-2 gap-3">
            <input name="title" placeholder="כותרת משימה *" required className="border border-gray-200 rounded-lg px-3 py-2 text-sm sm:col-span-2" />
            <input name="dueDate" type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <select name="category" className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="">קטגוריה (אופציונלי)</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">ביטול</button>
              <button type="submit" disabled={pending} className="px-4 py-2 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50">
                {pending ? '...' : 'שמור'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task list */}
      <div className="bg-white rounded-2xl shadow-md border border-pink-50 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {open.length === 0 ? '🎉 כל המשימות הושלמו!' : 'אין משימות'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(t => (
              <div key={t.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-pink-50/20 transition-colors ${t.completed ? 'opacity-60' : ''}`}>
                <button
                  onClick={() => handleToggle(t.id, t.completed)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${t.completed ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-pink-400'}`}
                >
                  {t.completed && <span className="text-white text-xs">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${t.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {t.title}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {t.dueDate && (
                      <span className={`text-xs ${isOverdue(t) ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {isOverdue(t) ? '⚠️ ' : ''}עד {new Date(t.dueDate).toLocaleDateString('he-IL')}
                      </span>
                    )}
                    {t.category && (
                      <span className="text-xs bg-pink-50 text-pink-500 px-1.5 py-0.5 rounded">{t.category}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
