'use client'

import { useState, useTransition } from 'react'
import { signIn } from '@/app/auth/actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', position: 'fixed', top: 0, left: 0, right: 0 }} />

      <div style={{
        width: '100%', maxWidth: '380px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '40px 36px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: '#0a0a0a', border: '1px solid rgba(201,169,110,0.3)',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', color: 'var(--gold)',
          }}>✓</div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', margin: '0 0 6px' }}>
            Tickets Admin
          </p>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            Вход
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-sub)' }}>
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              style={{
                padding: '11px 14px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', background: 'var(--bg)',
                color: 'var(--text)', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-sub)' }}>
              Пароль
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                padding: '11px 14px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', background: 'var(--bg)',
                color: 'var(--text)', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && (
            <p style={{
              fontSize: '13px', color: '#f87171',
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: '6px', padding: '10px 12px', margin: 0,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            style={{
              marginTop: '4px', padding: '13px',
              borderRadius: 'var(--radius-sm)', border: 'none',
              background: pending ? 'rgba(201,169,110,0.5)' : 'var(--gold)',
              color: '#0a0a0a', fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: pending ? 'wait' : 'pointer', transition: 'background 0.15s',
            }}
          >
            {pending ? 'Вход…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
