'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { userStore } from '@/lib/store'
import type { WeddingUser, UserSide, PermissionLevel, UserPermissions } from '@/lib/types'

const SIDE_LABEL: Record<UserSide, string> = { GROOM: 'צד חתן', BRIDE: 'צד כלה' }
const SIDE_COLOR: Record<UserSide, string> = { GROOM: '#6B9FD4', BRIDE: '#C9A96E' }

const MODULES: { key: keyof UserPermissions; label: string }[] = [
  { key: 'guests',  label: 'מוזמנים' },
  { key: 'vendors', label: 'ספקים' },
  { key: 'venues',  label: 'אולמות' },
  { key: 'attire',  label: 'ביגוד' },
  { key: 'budget',  label: 'תקציב' },
  { key: 'tasks',   label: 'משימות' },
  { key: 'gallery', label: 'גלריה' },
]

const PERM_OPTS: { value: PermissionLevel; label: string; color: string }[] = [
  { value: 'edit',   label: 'עריכה',  color: '#4CAF82' },
  { value: 'view',   label: 'צפייה',  color: '#6B9FD4' },
  { value: 'hidden', label: 'מוסתר', color: '#CCC' },
]

const AVATAR_COLORS = ['#C9A96E','#6B9FD4','#4CAF82','#E05C5C','#9B59B6','#F0A04B']

function initials(name: string) {
  return name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function PermToggle({ value, onChange }: { value: PermissionLevel; onChange: (v: PermissionLevel) => void }) {
  const idx = PERM_OPTS.findIndex(o => o.value === value)
  const opt = PERM_OPTS[idx]
  return (
    <button
      onClick={() => onChange(PERM_OPTS[(idx + 1) % 3].value)}
      style={{
        fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20,
        background: opt.color + '22', color: opt.color,
        border: `1px solid ${opt.color}44`, cursor: 'pointer', transition: 'all .15s',
        minWidth: 54, textAlign: 'center',
      }}
    >
      {opt.label}
    </button>
  )
}

function UserDrawer({
  open, onClose, onSave, editing,
}: {
  open: boolean; onClose: () => void; onSave: () => void; editing?: WeddingUser | null
}) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [side, setSide] = useState<UserSide>('GROOM')
  const [perms, setPerms] = useState<UserPermissions>({ ...userStore.DEFAULT_PERMISSIONS })

  useEffect(() => {
    if (editing) {
      setName(editing.name); setRole(editing.role); setSide(editing.side); setPerms({ ...editing.permissions })
    } else {
      setName(''); setRole(''); setSide('GROOM'); setPerms({ ...userStore.DEFAULT_PERMISSIONS })
    }
  }, [editing, open])

  const setFamilyPreset = () => setPerms({ ...userStore.FAMILY_PERMISSIONS })
  const setOwnerPreset  = () => setPerms({ ...userStore.DEFAULT_PERMISSIONS })

  function save() {
    if (!name.trim()) return
    const data = { name: name.trim(), role: role.trim(), side, permissions: perms }
    if (editing) {
      userStore.update(editing.id, data)
    } else {
      userStore.create(data)
    }
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
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white',
              borderRadius: '24px 24px 0 0', padding: '1.5rem 1.25rem 2.5rem',
              zIndex: 70, boxShadow: '0 -8px 40px rgba(0,0,0,.15)', maxHeight: '90vh', overflowY: 'auto',
            }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>{editing ? 'עריכת משתמש' : 'הוספת משתמש'}</h3>

            {/* Name + Role */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <input className="input" placeholder="שם מלא *" value={name} onChange={e => setName(e.target.value)} />
              <input className="input" placeholder="תפקיד (אמא, אבא…)" value={role} onChange={e => setRole(e.target.value)} />
            </div>

            {/* Side */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {(['GROOM', 'BRIDE'] as UserSide[]).map(s => (
                <button key={s} onClick={() => setSide(s)} className="btn"
                  style={{
                    flex: 1, fontWeight: 600,
                    background: side === s ? SIDE_COLOR[s] : 'var(--bg)',
                    color: side === s ? 'white' : 'var(--gray-muted)',
                    border: `2px solid ${side === s ? SIDE_COLOR[s] : 'var(--border)'}`,
                  }}>
                  {SIDE_LABEL[s]}
                </button>
              ))}
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray-muted)', alignSelf: 'center' }}>פרסט מהיר:</span>
              <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }} onClick={setOwnerPreset}>בעלים</button>
              <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }} onClick={setFamilyPreset}>משפחה</button>
            </div>

            {/* Permissions */}
            <div style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--gray-muted)', fontWeight: 600 }}>
                <span>מודול</span>
                <span>הרשאה (לחץ לשינוי)</span>
              </div>
              {MODULES.map(m => (
                <div key={m.key} style={{ padding: '0.55rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--charcoal)' }}>{m.label}</span>
                  <PermToggle value={perms[m.key]} onChange={v => setPerms(p => ({ ...p, [m.key]: v }))} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>ביטול</button>
              <button className="btn btn-gold" style={{ flex: 2 }} onClick={save}>שמור</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<WeddingUser[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<WeddingUser | null>(null)

  const load = useCallback(() => setUsers(userStore.getAll()), [])
  useEffect(() => { load() }, [load])

  function del(id: string) {
    if (!confirm('למחוק משתמש?')) return
    userStore.delete(id); load()
  }

  const byGroom = users.filter(u => u.side === 'GROOM')
  const byBride  = users.filter(u => u.side === 'BRIDE')

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '2rem', color: 'var(--charcoal)', lineHeight: 1 }}>משתמשים</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-muted)', marginTop: 4 }}>ניהול גישה לבני המשפחה</p>
        </div>
        <button className="btn btn-gold" onClick={() => { setEditing(null); setShowAdd(true) }}><Plus size={15} /> הוסף</button>
      </div>

      {users.length === 0 ? (
        <div className="card empty-state">
          <span style={{ fontSize: 48 }}>👥</span>
          <h3>אין משתמשים עדיין</h3>
          <p>הוסף את בני המשפחה כדי לשתף איתם את האפליקציה</p>
          <button className="btn btn-gold" onClick={() => { setEditing(null); setShowAdd(true) }}><Plus size={15} /> הוסף משתמש</button>
        </div>
      ) : (
        <>
          {[{ side: 'GROOM' as UserSide, list: byGroom }, { side: 'BRIDE' as UserSide, list: byBride }]
            .filter(g => g.list.length > 0)
            .map(({ side, list }) => (
              <div key={side} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: SIDE_COLOR[side] }} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: SIDE_COLOR[side] }}>{SIDE_LABEL[side]}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {list.map((user, i) => (
                    <motion.div key={user.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }} className="card" style={{ padding: '1rem 1.1rem' }}>
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                        {/* Avatar */}
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                          background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.9rem',
                        }}>
                          {initials(user.name)}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--charcoal)' }}>{user.name}</div>
                              {user.role && <div style={{ fontSize: '0.75rem', color: 'var(--gray-muted)' }}>{user.role}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => { setEditing(user); setShowAdd(true) }}
                                style={{ background: 'none', border: 'none', color: 'var(--gray-muted)', cursor: 'pointer', padding: 4 }}>
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => del(user.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--border)', cursor: 'pointer', padding: 4 }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--border)')}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Permissions grid */}
                          <div style={{ marginTop: '0.65rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {MODULES.map(m => {
                              const p = user.permissions[m.key]
                              if (p === 'hidden') return null
                              const opt = PERM_OPTS.find(o => o.value === p)!
                              return (
                                <span key={m.key} style={{
                                  fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 12,
                                  background: opt.color + '18', color: opt.color, border: `1px solid ${opt.color}33`,
                                }}>
                                  {m.label}
                                  {p === 'edit' && <Check size={9} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />}
                                </span>
                              )
                            })}
                            {MODULES.filter(m => user.permissions[m.key] === 'hidden').map(m => (
                              <span key={m.key} style={{
                                fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 12,
                                background: '#f0f0f0', color: '#aaa', border: '1px solid #e0e0e0', textDecoration: 'line-through',
                              }}>
                                {m.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
        </>
      )}

      <UserDrawer
        open={showAdd}
        editing={editing}
        onClose={() => { setShowAdd(false); setEditing(null) }}
        onSave={() => { load(); setShowAdd(false); setEditing(null) }}
      />
    </div>
  )
}
