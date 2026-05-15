'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError('אימייל או סיסמה שגויים. נסה שוב.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #FDF6EC 0%, #F8F5F0 100%)',
      padding: '1.5rem',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: '2.5rem 2rem' }}>
        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="font-display" style={{ fontSize: '2rem', color: 'var(--charcoal)', marginBottom: 4 }}>
            ברוכים הבאים
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-muted)' }}>מתכנן החתונה שלכם</div>
          <div style={{ width: 48, height: 2, background: 'var(--gold)', margin: '1rem auto 0', borderRadius: 9999 }} />
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--charcoal)', marginBottom: 6 }}>
              כתובת אימייל
            </label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ direction: 'ltr', textAlign: 'right' }}
            />
          </div>

          <div>
            <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--charcoal)', marginBottom: 6 }}>
              סיסמה
            </label>
            <input
              id="login-password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
              background: '#FFF0F0', border: '1px solid var(--danger)',
              fontSize: '0.82rem', color: 'var(--danger)',
            }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-gold"
            type="submit"
            disabled={loading}
            style={{ marginTop: '0.5rem', fontSize: '1rem', padding: '0.75rem' }}
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-muted)' }}>
            ✦ חגי &amp; סלומה ✦
          </div>
        </div>
      </div>
    </div>
  )
}
