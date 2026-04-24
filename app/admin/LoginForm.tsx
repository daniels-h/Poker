'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/sessions')
      router.refresh()
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(138,115,64,0.4)',
    borderRadius: 2,
    padding: '10px 14px',
    color: 'var(--ivory)',
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
    outline: 'none',
  }

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(138,115,64,0.6)',
        borderRadius: 4,
        padding: '36px 32px',
        maxWidth: 380,
        margin: '0 auto',
      }}
    >
      <div className="font-mono uppercase mb-1" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.2em' }}>Admin Access</div>
      <div className="font-fraunces text-ivory mb-6" style={{ fontSize: 28 }}>The Floor</div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className="font-mono"
            style={{ fontSize: 12, color: 'var(--loss)', border: '1px solid rgba(214,96,88,0.4)', borderRadius: 2, padding: '8px 12px', letterSpacing: '0.05em' }}
          >
            {error}
          </div>
        )}
        <div>
          <div className="font-mono uppercase mb-2" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.15em' }}>Email</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={inputStyle} />
        </div>
        <div>
          <div className="font-mono uppercase mb-2" style={{ fontSize: 10, color: 'var(--brass)', letterSpacing: '0.15em' }}>Password</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: 'var(--brass)',
            color: 'var(--ink)',
            border: 'none',
            borderRadius: 2,
            padding: '11px',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Signing in…' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
