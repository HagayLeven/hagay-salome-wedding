'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check } from 'lucide-react'
import CircularRing from '@/components/ui/CircularRing'
import { taskStore, getDaysToWedding } from '@/lib/store'
import type { Task, TaskAssignee, TaskPriority } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

const PRIORITY_COLOR: Record<TaskPriority, string> = { HIGH: '#E05C5C', MEDIUM: '#F0A04B', LOW: '#4CAF82' }

function AddDrawer({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const { t } = useLang()
  const [form, setForm] = useState({ title: '', description: '', assignee: 'BOTH' as TaskAssignee, priority: 'MEDIUM' as TaskPriority, dueDate: '' })
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  function save() {
    if (!form.title.trim()) return
    taskStore.create({ ...form, completed: false, dueDate: form.dueDate || undefined })
    setForm({ title: '', description: '', assignee: 'BOTH', priority: 'MEDIUM', dueDate: '' })
    onSave()
  }
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 60 }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white',
              borderRadius: '24px 24px 0 0', padding: '1.5rem 1.25rem 2rem', zIndex: 70, boxShadow: '0 -8px 40px rgba(0,0,0,.15)' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontWeight: 700, marginBottom: '1.1rem' }}>{t('addTaskTitle')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="input" placeholder={`${t('taskTitle')} *`} value={form.title} onChange={e => upd('title', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <select className="input" value={form.assignee} onChange={e => upd('assignee', e.target.value)}>
                  <option value="BOTH">{t('assignee_both')}</option>
                  <option value="HAGAY">{t('assignee_hagay')}</option>
                  <option value="SALOME">{t('assignee_salome')}</option>
                </select>
                <select className="input" value={form.priority} onChange={e => upd('priority', e.target.value)}>
                  <option value="HIGH">{t('priority_high')}</option>
                  <option value="MEDIUM">{t('priority_medium')}</option>
                  <option value="LOW">{t('priority_low')}</option>
                </select>
              </div>
              <input className="input" type="date" value={form.dueDate} onChange={e => upd('dueDate', e.target.value)} />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>{t('cancel')}</button>
                <button className="btn btn-gold" style={{ flex: 2 }} onClick={save}>{t('save')}</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function TasksPage() {
  const { t } = useLang()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [days, setDays] = useState(0)

  const PRIORITY_LABEL: Record<TaskPriority, string> = { HIGH: t('priority_high'), MEDIUM: t('priority_medium'), LOW: t('priority_low') }
  const ASSIGNEE_LABEL: Record<TaskAssignee, string> = { HAGAY: t('assignee_hagay'), SALOME: t('assignee_salome'), BOTH: t('assignee_both') }

  const load = useCallback(() => { setTasks(taskStore.getAll()); setDays(getDaysToWedding()) }, [])
  useEffect(() => { load() }, [load])

  const total = tasks.length
  const done  = tasks.filter(t => t.completed).length
  const open  = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)

  function toggle(id: string, completed: boolean) {
    taskStore.update(id, { completed: !completed, completedAt: !completed ? new Date().toISOString() : undefined })
    load()
  }
  function del(id: string) {
    if (!confirm(t('delete') + '?')) return
    taskStore.delete(id); load()
  }

  function TaskItem({ task }: { task: Task }) {
    return (
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '0.85rem 1.1rem', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => toggle(task.id, task.completed)}
          style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 2,
            border: `2px solid ${task.completed ? '#4CAF82' : PRIORITY_COLOR[task.priority]}`,
            background: task.completed ? '#4CAF82' : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}>
          {task.completed && <Check size={12} color="white" strokeWidth={3} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: '0.875rem', color: task.completed ? 'var(--gray-muted)' : 'var(--charcoal)',
            textDecoration: task.completed ? 'line-through' : 'none' }}>
            {task.title}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: PRIORITY_COLOR[task.priority], fontWeight: 600 }}>
              {PRIORITY_LABEL[task.priority]}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--gray-muted)' }}>
              {ASSIGNEE_LABEL[task.assignee]}
            </span>
            {task.dueDate && (
              <span style={{ fontSize: '0.68rem', color: 'var(--gray-muted)' }}>
                {new Date(task.dueDate).toLocaleDateString('he-IL')}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => del(task.id)} style={{ background: 'none', border: 'none', fontSize: '1rem', color: 'var(--border)', cursor: 'pointer', padding: 2, lineHeight: 1 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--border)')}>×</button>
      </motion.div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h1 className="font-display" style={{ fontSize: '2rem', color: 'var(--charcoal)', lineHeight: 1 }}>{t('tasks')}</h1>
        <button className="btn btn-gold" onClick={() => setShowAdd(true)}><Plus size={15} /> {t('add')}</button>
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card-lg" style={{ padding: '1.5rem', marginBottom: '1.1rem', background: 'linear-gradient(135deg, #FDF6EC, #F8F5F0)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
          <CircularRing value={done} max={Math.max(total, 1)} size="md" centerText={`${done}/${total}`} label={t('completed_tasks')} />
          <CircularRing value={365 - days} max={365} size="md" centerText={String(days)} centerSub={t('daysToWedding')} label={t('toWedding')} />
          <CircularRing value={open.filter(t => t.priority === 'HIGH').length} max={Math.max(open.length, 1)} size="md"
            centerText={String(open.filter(t => t.priority === 'HIGH').length)} label={t('urgent')} color="#E05C5C" />
        </div>
      </motion.div>

      {/* Open tasks */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .07 }}
        className="card" style={{ overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ padding: '0.85rem 1.1rem', borderBottom: '1px solid var(--border)' }}>
          <div className="section-bar-title"><div className="section-bar-accent" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('openTasksSection')} ({open.length})</span>
          </div>
        </div>
        {open.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <Check size={40} /><h3>{t('allDone')}</h3>
          </div>
        ) : (
          <AnimatePresence>{open.sort((a,b) => { const p = { HIGH: 0, MEDIUM: 1, LOW: 2 }; return p[a.priority] - p[b.priority] }).map(t => <TaskItem key={t.id} task={t} />)}</AnimatePresence>
        )}
      </motion.div>

      {/* Done tasks */}
      {completed.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}
          className="card" style={{ overflow: 'hidden', opacity: .75 }}>
          <div style={{ padding: '0.85rem 1.1rem', borderBottom: '1px solid var(--border)' }}>
            <div className="section-bar-title"><div className="section-bar-accent" style={{ background: '#4CAF82' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-md)' }}>{t('completedSection')} ({completed.length})</span>
            </div>
          </div>
          <AnimatePresence>{completed.map(t => <TaskItem key={t.id} task={t} />)}</AnimatePresence>
        </motion.div>
      )}

      <AddDrawer open={showAdd} onClose={() => setShowAdd(false)} onSave={() => { load(); setShowAdd(false) }} />
    </div>
  )
}
