'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save } from 'lucide-react'
import { settingsStore } from '@/lib/store'
import type { Settings } from '@/lib/types'
import { useLang } from '@/lib/lang-context'
import type { Lang } from '@/lib/i18n'

const LANG_OPTIONS: { code: Lang; flag: string; label: string }[] = [
  { code: 'he', flag: '🇮🇱', label: 'עברית' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
]

export default function SettingsPage() {
  const [form, setForm] = useState<Settings | null>(null)
  const [saved, setSaved] = useState(false)
  const { lang, setLang } = useLang()

  useEffect(() => { setForm(settingsStore.get()) }, [])

  if (!form) return null

  const upd = (k: string, v: string | number) => setForm(f => f ? { ...f, [k]: v } : f)

  function save() {
    if (!form) return
    settingsStore.update(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 className="font-display" style={{ fontSize: '2rem', color: 'var(--charcoal)', marginBottom: '1.5rem' }}>הגדרות</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '1.25rem' }}>
          <div className="section-bar">
            <div className="section-bar-title"><div className="section-bar-accent" />
              <span style={{ fontWeight: 600 }}>פרטי החתונה</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label className="label-caps" style={{ display: 'block', marginBottom: 6 }}>תאריך החתונה</label>
              <input className="input" type="date" value={form.weddingDate} onChange={e => upd('weddingDate', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: 6 }}>שם החתן</label>
                <input className="input" value={form.groomName} onChange={e => upd('groomName', e.target.value)} />
              </div>
              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: 6 }}>שם הכלה</label>
                <input className="input" value={form.brideName} onChange={e => upd('brideName', e.target.value)} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .07 }}
          className="card" style={{ padding: '1.25rem' }}>
          <div className="section-bar">
            <div className="section-bar-title"><div className="section-bar-accent" />
              <span style={{ fontWeight: 600 }}>תקציב</span>
            </div>
          </div>
          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 6 }}>תקציב כולל ₪</label>
            <input className="input" type="number" value={form.totalBudget} onChange={e => upd('totalBudget', parseFloat(e.target.value) || 0)} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}
          className="card" style={{ padding: '1.25rem' }}>
          <div className="section-bar">
            <div className="section-bar-title"><div className="section-bar-accent" />
              <span style={{ fontWeight: 600 }}>הודעת וואטסאפ</span>
            </div>
          </div>
          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 6 }}>טמפלייט הזמנה (השתמש ב-{'{name}'} לשם)</label>
            <textarea className="input" value={form.whatsappTemplate} onChange={e => upd('whatsappTemplate', e.target.value)} style={{ minHeight: 100 }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .18 }}
          className="card" style={{ padding: '1.25rem' }}>
          <div className="section-bar">
            <div className="section-bar-title"><div className="section-bar-accent" />
              <span style={{ fontWeight: 600 }}>שפת הממשק</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {LANG_OPTIONS.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); settingsStore.update({ language: l.code }) }}
                className="btn"
                style={{
                  flex: 1, gap: 6, fontSize: '0.85rem',
                  background: lang === l.code ? 'var(--gold)' : 'white',
                  color: lang === l.code ? 'white' : 'var(--charcoal)',
                  border: `1.5px solid ${lang === l.code ? 'var(--gold)' : 'var(--border)'}`,
                  fontWeight: lang === l.code ? 700 : 400,
                }}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </motion.div>

        <button className="btn btn-gold" onClick={save} style={{ fontSize: '0.95rem', gap: 8 }}>
          <Save size={16} /> {saved ? '✓ נשמר!' : 'שמור הגדרות'}
        </button>
      </div>
    </div>
  )
}
