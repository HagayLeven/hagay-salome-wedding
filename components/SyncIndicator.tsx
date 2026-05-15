'use client'
import { useEffect, useState } from 'react'

type Status = 'connected' | 'syncing' | 'offline'

export default function SyncIndicator() {
  const [status, setStatus] = useState<Status>('connected')

  useEffect(() => {
    async function checkOnline() {
      if (!navigator.onLine) {
        setStatus('offline')
        return
      }
      setStatus('syncing')
      try {
        const res = await fetch('/api/db/settings', { cache: 'no-store' })
        setStatus(res.ok ? 'connected' : 'offline')
      } catch {
        setStatus('offline')
      }
    }

    checkOnline()
    window.addEventListener('online', checkOnline)
    window.addEventListener('offline', () => setStatus('offline'))

    const interval = setInterval(checkOnline, 30000)
    return () => {
      window.removeEventListener('online', checkOnline)
      window.removeEventListener('offline', () => setStatus('offline'))
      clearInterval(interval)
    }
  }, [])

  const dotColor = status === 'connected' ? '#4CAF82' : status === 'syncing' ? '#F0A04B' : '#E05C5C'

  return (
    <>
      {/* Dot indicator */}
      <div style={{
        position: 'fixed', top: 12, left: 12, zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'white', borderRadius: 9999,
        padding: '4px 10px 4px 6px',
        boxShadow: '0 1px 6px rgba(0,0,0,.10)',
        border: '1px solid var(--border)',
        fontSize: '0.7rem', color: 'var(--gray-muted)',
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: dotColor,
          boxShadow: status === 'connected' ? `0 0 0 3px ${dotColor}33` : undefined,
          animation: status === 'connected' ? 'pulse-dot 2s infinite' : undefined,
          flexShrink: 0,
        }} />
        {status === 'connected' && 'מחובר'}
        {status === 'syncing' && 'טוען...'}
        {status === 'offline' && 'לא מחובר'}
      </div>

      {/* Offline banner */}
      {status === 'offline' && (
        <div style={{
          position: 'fixed', bottom: 72, left: 0, right: 0, zIndex: 50,
          background: 'var(--danger)', color: 'white',
          textAlign: 'center', padding: '0.6rem 1rem',
          fontSize: '0.82rem', fontWeight: 600,
        }}>
          עובד במצב לא מקוון — שינויים יישמרו מקומית
        </div>
      )}

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}
