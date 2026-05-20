'use client'

import { useTransition } from 'react'
import { signOut } from '@/app/auth/actions'

export function SignOutButton() {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => signOut())}
      disabled={pending}
      style={{
        padding: '7px 14px', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)', background: 'transparent',
        color: 'var(--text-dim)', fontSize: '12px', fontWeight: 500,
        cursor: pending ? 'wait' : 'pointer', letterSpacing: '0.03em',
        transition: 'all 0.15s', opacity: pending ? 0.5 : 1,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.4)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)' }}
    >
      {pending ? 'Выход…' : 'Выйти'}
    </button>
  )
}
