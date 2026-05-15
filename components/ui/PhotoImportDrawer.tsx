'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { guestStore } from '@/lib/store'
import type { Side, GuestGroup } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: () => void
}

type OcrResult = { name: string; phone: string; confidence: 'high' | 'medium' | 'low'; error?: string }

export default function PhotoImportDrawer({ open, onClose, onSave }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lowConf, setLowConf] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    nameHe: '',
    side: 'GROOM' as Side,
    group: 'FAMILY' as GuestGroup,
    note: '',
  })
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  function reset() {
    setPreview(null)
    setLoading(false)
    setLowConf(false)
    setSuccess(false)
    setForm({ name: '', phone: '', nameHe: '', side: 'GROOM', group: 'FAMILY', note: '' })
  }

  async function handleFile(file: File) {
    // Show preview
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setLoading(true)
    setLowConf(false)

    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/ocr', { method: 'POST', body: fd })
      const data: OcrResult = await res.json()

      setForm(f => ({
        ...f,
        name: data.name || '',
        phone: data.phone || '',
      }))

      if (data.confidence === 'low' || (!data.name && !data.phone)) {
        setLowConf(true)
      }
    } catch {
      setLowConf(true)
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  function save() {
    if (!form.name.trim()) return
    // Convert preview base64 to photoUrl
    guestStore.create({
      name: form.name,
      phone: form.phone,
      whatsapp: form.phone,
      side: form.side,
      group: form.group,
      note: form.note || undefined,
      nameHe: form.nameHe || undefined,
      photoUrl: preview || undefined,
      rsvpStatus: 'PENDING',
      invitationSent: false,
      invitationAcknowledged: false,
      attendanceConfirmed: false,
    } as Parameters<typeof guestStore.create>[0])

    setSuccess(true)
    setTimeout(() => {
      reset()
      onSave()
    }, 1200)
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 60 }}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: 'white', borderRadius: '24px 24px 0 0',
              padding: '1.5rem 1.25rem 2rem', zIndex: 70,
              boxShadow: '0 -8px 40px rgba(0,0,0,.15)',
              maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 1.25rem' }} />

            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>ייבוא מתמונה</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-muted)', marginBottom: '1rem' }}>
              צלם או העלה תמונה של איש קשר
            </p>

            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{ textAlign: 'center', padding: '2rem 0' }}
              >
                <CheckCircle2 size={48} color="#4CAF82" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 700, color: 'var(--charcoal)' }}>מוזמן נוסף בהצלחה!</div>
              </motion.div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                {/* Upload area */}
                {!preview ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border)', borderRadius: 12,
                      padding: '2rem 1rem', textAlign: 'center', cursor: 'pointer',
                      transition: 'border-color .15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <Camera size={32} color="var(--gold)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '0.85rem', color: 'var(--charcoal)', fontWeight: 600 }}>צלם או העלה תמונה</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-muted)', marginTop: 4 }}>
                      צילום מסך, כרטיס ביקור, WhatsApp
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <img
                      src={preview} alt="preview"
                      style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
                    />
                    {loading && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-muted)', fontSize: '0.82rem', paddingTop: 14 }}>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        מנתח תמונה...
                      </div>
                    )}
                    {!loading && (
                      <button
                        onClick={() => { reset(); fileRef.current?.click() }}
                        className="btn btn-ghost"
                        style={{ fontSize: '0.75rem', paddingRight: 0, marginTop: 10 }}
                      >
                        החלף תמונה
                      </button>
                    )}
                  </div>
                )}

                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleInputChange} />

                {/* Low confidence warning */}
                {lowConf && !loading && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#FFF9E6', border: '1px solid #E8C84A', borderRadius: 8,
                    padding: '0.6rem 0.85rem', fontSize: '0.78rem', color: '#7A6010',
                  }}>
                    <AlertCircle size={14} />
                    לא הצלחנו לקרוא את הפרטים — מלא ידנית
                  </div>
                )}

                {/* Form (shown after image selected) */}
                {(preview || true) && (
                  <>
                    <input className="input" placeholder="שם מלא *" value={form.name} onChange={e => upd('name', e.target.value)} />
                    <input className="input" placeholder="טלפון" type="tel" value={form.phone} onChange={e => upd('phone', e.target.value)} />
                    <input className="input" placeholder="שם בעברית (אופציונלי)" value={form.nameHe} onChange={e => upd('nameHe', e.target.value)} />

                    {/* Side toggle */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {([['GROOM', 'צד חתן 🔵'], ['BRIDE', 'צד כלה 🟡']] as const).map(([s, label]) => (
                        <button
                          key={s}
                          onClick={() => upd('side', s)}
                          className="btn"
                          style={{
                            flex: 1, fontSize: '0.82rem',
                            background: form.side === s ? (s === 'GROOM' ? '#6B9FD4' : '#C9A96E') : 'white',
                            color: form.side === s ? 'white' : 'var(--gray-md)',
                            border: `1.5px solid ${form.side === s ? 'transparent' : 'var(--border)'}`,
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Group */}
                    <select className="input" value={form.group} onChange={e => upd('group', e.target.value)}>
                      <option value="FAMILY">משפחה</option>
                      <option value="FRIENDS">חברים</option>
                      <option value="WORK">עבודה</option>
                      <option value="ARMY">צבא</option>
                      <option value="OTHER">אחר</option>
                    </select>

                    <input className="input" placeholder="הערה" value={form.note} onChange={e => upd('note', e.target.value)} />

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: 4 }}>
                      <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleClose}>ביטול</button>
                      <button className="btn btn-gold" style={{ flex: 2 }} onClick={save} disabled={!form.name.trim()}>
                        הוסף מוזמן
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
