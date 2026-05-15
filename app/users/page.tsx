'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Check } from 'lucide-react'
import { userStore } from '@/lib/store'
import type { WeddingUser, UserSide, PermissionLevel, UserPermissions } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

const SIDE_COLOR: Record<UserSide, string> = { GROOM: '#6B9FD4', BRIDE: '#C9A96E' }
const AVATAR_COLORS = ['#C9A96E','#6B9FD4','#4CAF82','#E05C5C','#9B59B6','#F0A04B']

function initials(name: string) {
  return name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function PermToggle({ value, onChange, labels }: { value: PermissionLevel; onChange: (v: PermissionLevel) => void; labels: { edit: string; view: string; hidden: string } }) {
  const PERM_OPTS: { value: PermissionLevel; label: string; color: string }[] = [
    { value: 'edit',   label: labels.edit,   color: '#4CAF82' },
    { value: 'view',   label: labels.view,   color: '#6B9FD4' },
    { value: 'hidden', label: labels.hidden, color: '#CCC' },
  ]
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
  const { t } = useLang()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [side, setSide] = useState<UserSide>('GROOM')
  const [perms, setPerms] = useState<UserPermissions>({ ...userStore.DEFAULT_PERMISSIONS })

  const MODULES: { key: keyof UserPermissions; label: string }[] = [
    { key: 'guests',  label: t('guests') },
    { key: 'vendors', label: t('vendors') },
    { key: 'venues',  label: t('venues') },
    { key: 'attire',  label: t('attire') },
    { key: 'budget',  label: t('budget') },
    { key: 'tasks',   label: t('tasks') },
    { key: 'gallery', label: t('gallery') },
  ]

  const SIDE_LABEL: Record<UserSide, string> = { GROOM: t('groomSide'), BRIDE: t('brideSide') }
  const permLabels = { edit: t('perm_edit'), view: t('perm_view'), hidden: t('perm_hidden') }

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
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>{editing ? t('editUser') : t('addUser')}</h3>

            {/* Name + Role */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <input className="input" placeholder={`${t('userName')} *`} value={name} onChange={e => setName(e.target.value)} />
              <input className="input" placeholder={t('userRole')} value={role} onChange={e => setRole(e.target.value)} />
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
              <span style={{ fontSize: '0.8rem', color: 'var(--gray-muted)', alignSelf: 'center' }}>{t('quickPreset')}</span>
              <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }} onClick={setOwnerPreset}>{t('owner')}</button>
              <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }} onClick={setFamilyPreset}>{t('familyPreset')}</button>
            </div>

            {/* Permissions */}
            <div style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--gray-muted)', fontWeight: 600 }}>
                <span>{t('module')}</span>
                <span>{t('permission')}</span>
              </div>
              {MODULES.map(m => (
                <div key={m.key} style={{ padding: '0.55rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--charcoal)' }}>{m.label}</span>
                  <PermToggle value={perms[m.key]} onChange={v => setPerms(p => ({ ...p, [m.key]: v }))} labels={permLabels} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>{t('cancel')}</button>
              <button className="btn btn-gold" style={{ flex: 2 }} onClick={save}>{t('save')}</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function UsersPage() {
  const { t } = useLang()
  const [users, setUsers] = useState<WeddingUser[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<WeddingUser | null>(null)

  const SIDE_LABEL: Record<UserSide, string> = { GROOM: t('groomSide'), BRIDE: t('brideSide') }
  const MODULES_LABELS: Record<string, string> = {
    guests: t('guests'), vendors: t('vendors'), venues: t('venues'),
    attire: t('attire'), budget: t('budget'), tasks: t('tasks'), gallery: t('gallery'),
  }
  const PERM_OPTS: { value: PermissionLevel; label: string; color: string }[] = [
    { value: 'edit',   label: t('perm_edit'),   color: '#4CAF82' },
    { value: 'view',   label: t('perm_view'),   color: '#6B9FD4' },
    { value: 'hidden', label: t('perm_hidden'), color: '#CCC' },
  ]

  const load = useCallback(() => setUsers(userStore.getAll()), [])
  useEffect(() => { load() }, [load])

  function del(id: string) {
    if (!confirm(t('delete') + '?')) return
    userStore.delete(id); load()
  }

  const byGroom = users.filter(u => u.side === 'GROOM')
  const byBride  = users.filter(u => u.side === 'BRIDE')

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '2rem', color: 'var(--charcoal)', lineHeight: 1 }}>{t('users')}</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-muted)', marginTop: 4 }}>{t('manageAccess')}</p>
        </div>
        <button className="btn btn-gold" onClick={() => { setEditing(null); setShowAdd(true) }}><Plus size={15} /> {t('add')}</button>
      </div>

      {users.length === 0 ? (
        <div className="card empty-state">
          <span style={{ fontSize: 48 }}>👥</span>
          <h3>{t('noUsers')}</h3>
          <p>{t('addFamilyMembers')}</p>
          <button className="btn btn-gold" onClick={() => { setEditing(null); setShowAdd(true) }}><Plus size={15} /> {t('addUser')}</button>
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
                            {Object.keys(user.permissions).filter(k => user.permissions[k as keyof UserPermissions] !== 'hidden').map(k => {
                              const p = user.permissions[k as keyof UserPermissions]
                              const opt = PERM_OPTS.find(o => o.value === p)!
                              return (
                                <span key={k} style={{
                                  fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 12,
                                  background: opt.color + '18', color: opt.color, border: `1px solid ${opt.color}33`,
                                }}>
                                  {MODULES_LABELS[k] || k}
                                  {p === 'edit' && <Check size={9} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />}
                                </span>
                              )
                            })}
                            {Object.keys(user.permissions).filter(k => user.permissions[k as keyof UserPermissions] === 'hidden').map(k => (
                              <span key={k} style={{
                                fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 12,
                                background: '#f0f0f0', color: '#aaa', border: '1px solid #e0e0e0', textDecoration: 'line-through',
                              }}>
                                {MODULES_LABELS[k] || k}
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
