'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { mediaStore } from '@/lib/store'
import type { MediaItem } from '@/lib/types'

const FILTERS = [
  { key: 'all', label: 'הכל' },
  { key: 'vendor', label: 'ספקים' },
  { key: 'venue', label: 'אולמות' },
  { key: 'attire', label: 'ביגוד' },
  { key: 'inspiration', label: 'השראה' },
]

export default function GalleryPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [filter, setFilter] = useState('all')
  const [lightbox, setLightbox] = useState<MediaItem | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => setItems(mediaStore.getAll())
  useEffect(() => { load() }, [])

  const visible = filter === 'all' ? items : items.filter(i => i.entityType === filter)

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        mediaStore.create({
          url: ev.target?.result as string,
          type: file.type.startsWith('video') ? 'video' : 'image',
          entityType: 'inspiration',
        })
        load()
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function del(id: string) { mediaStore.delete(id); load() }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h1 className="font-display" style={{ fontSize: '2rem', color: 'var(--charcoal)', lineHeight: 1 }}>גלריה</h1>
        <button className="btn btn-gold" onClick={() => fileRef.current?.click()}><Upload size={15} /> העלה</button>
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleUpload} />
      </div>

      <div className="tab-bar" style={{ marginBottom: '1.1rem' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`tab-pill${filter === f.key ? ' active' : ''}`}>{f.label}</button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card empty-state" style={{ cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
          <ImageIcon size={48} /><h3>הגלריה ריקה</h3><p>לחץ להעלאת תמונות ראשונות</p>
          <button className="btn btn-gold"><Upload size={15} /> העלה תמונות</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
          {visible.map(item => (
            <motion.div key={item.id} layout initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: 'var(--border)' }}
              onClick={() => setLightbox(item)}>
              {item.type === 'image'
                ? <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              }
              <button onClick={e => { e.stopPropagation(); del(item.id) }}
                style={{ position: 'absolute', top: 4, left: 4, width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(0,0,0,.5)', border: 'none', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={28} />
            </button>
            {lightbox.type === 'image'
              ? <img src={lightbox.url} alt="" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
              : <video src={lightbox.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12 }} onClick={e => e.stopPropagation()} />
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
