'use client'
import { useState } from 'react'
import { useLang } from '@/lib/lang-context'
import type { Lang } from '@/lib/i18n'

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'he', flag: '🇮🇱', label: 'עב' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
]

export default function LangToggle() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const current = LANGS.find(l => l.code === lang) ?? LANGS[0]

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
          fontSize: '0.72rem', fontWeight: 600, color: 'var(--charcoal)',
          width: '100%', justifyContent: 'center',
        }}
        aria-label="Change language"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 90 }}
          />
          <div style={{
            position: 'absolute', bottom: '110%', left: 0, right: 0,
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,.12)',
            overflow: 'hidden', zIndex: 100,
          }}>
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '8px 12px', border: 'none',
                  background: lang === l.code ? 'var(--gold-pale)' : 'white',
                  cursor: 'pointer', fontSize: '0.78rem', fontWeight: lang === l.code ? 700 : 400,
                  color: lang === l.code ? 'var(--gold)' : 'var(--charcoal)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
                {lang === l.code && <span style={{ marginRight: 'auto', marginLeft: 'auto' }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
