'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Play, X, Upload, Image as ImageIcon } from 'lucide-react'
import { mediaStore } from '@/lib/store'
import type { MediaItem } from '@/lib/types'

interface Props {
  entityId: string
  entityName: string
  entityType: 'vendor' | 'venue' | 'attire'
  triggerLabel?: string
}

export default function ItemMediaDrawer({ entityId, entityName, entityType, triggerLabel }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<MediaItem[]>([])
  const [lightbox, setLightbox] = useState<MediaItem | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function load() {
    setItems(mediaStore.getAll().filter(m => m.entityId === entityId))
  }

  useEffect(() => { if (open) load() }, [open, entityId])

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        mediaStore.create({
          url: ev.target?.result as string,
          type: file.type.startsWith('video') ? 'video' : 'image',
          entityType,
          entityId,
          entityName,
        })
        load()
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function del(id: string) {
    mediaStore.delete(id)
    load()
  }

  const count = mediaStore.getAll().filter(m => m.entityId === entityId).length

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'none', border: '1px solid var(--border)',
          borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
          fontSize: '0.72rem', color: 'var(--gray-md)', transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--gray-md)' }}
      >
        <Camera size={12} />
        {triggerLabel || 'תמונות'}
        {count > 0 && (
          <span style={{ background: 'var(--gold)', color: 'white', borderRadius: 10, padding: '1px 6px', fontSize: '0.65rem', fontWeight: 700 }}>
            {count}
          </span>
        )}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 80 }} />

            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white',
                borderRadius: '24px 24px 0 0', padding: '1.25rem 1.25rem 2.5rem',
                zIndex: 90, boxShadow: '0 -8px 40px rgba(0,0,0,.2)',
                maxHeight: '80vh', overflowY: 'auto',
              }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 1rem' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{entityName}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-muted)' }}>
                    {items.length > 0 ? `${items.length} קבצים` : 'אין תמונות עדיין'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-gold" style={{ fontSize: '0.8rem', gap: 6 }}
                    onClick={() => fileRef.current?.click()}>
                    <Upload size={14} /> העלה
                  </button>
                  <button onClick={() => setOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-muted)', padding: 4 }}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              <input ref={fileRef} type="file" accept="image/*,video/*" multiple
                style={{ display: 'none' }} onChange={handleUpload} />

              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--gray-muted)', cursor: 'pointer',
                    background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}
                  onClick={() => fileRef.current?.click()}>
                  <ImageIcon size={40} style={{ opacity: .3, margin: '0 auto 0.75rem', display: 'block' }} />
                  <p style={{ fontSize: '0.85rem' }}>לחץ להעלאת תמונות וסרטונים</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.5rem' }}>
                  {/* Upload tile */}
                  <div onClick={() => fileRef.current?.click()}
                    style={{ aspectRatio: '1', borderRadius: 12, border: '2px dashed var(--border)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', gap: 6, color: 'var(--gray-muted)', transition: 'border-color .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                    <Upload size={20} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>הוסף</span>
                  </div>

                  {items.map(item => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden',
                        cursor: 'pointer', background: '#f0f0f0' }}
                      onClick={() => setLightbox(item)}>
                      {item.type === 'image'
                        ? <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (
                          <>
                            <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', background: 'rgba(0,0,0,.3)' }}>
                              <Play size={24} color="white" fill="white" />
                            </div>
                          </>
                        )
                      }
                      <button onClick={e => { e.stopPropagation(); del(item.id) }}
                        style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
                          background: 'rgba(0,0,0,.55)', border: 'none', color: 'white', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={11} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <button onClick={() => setLightbox(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.15)',
                border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%',
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
            {lightbox.type === 'image'
              ? <img src={lightbox.url} alt="" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }}
                  onClick={e => e.stopPropagation()} />
              : <video src={lightbox.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12 }}
                  onClick={e => e.stopPropagation()} />
            }
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
