'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useRef } from 'react'

export function TicketSearch({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    }, 300)
  }

  return (
    <div className="search-wrap">
      <div style={{
        position: 'absolute', left: '14px', top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-dim)',
        pointerEvents: 'none',
        fontSize: '14px',
        transition: 'color 0.2s',
      }}>
        ⌕
      </div>
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Имя, фамилия или телефон…"
        style={{
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px 10px 36px',
          fontSize: '13.5px',
          color: 'var(--text)',
          outline: 'none',
          transition: 'border-color 0.2s',
          opacity: isPending ? 0.6 : 1,
        }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      />
      {isPending && (
        <div style={{
          position: 'absolute', right: '12px', top: '50%',
          transform: 'translateY(-50%)',
          width: '12px', height: '12px',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--gold)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
      )}
    </div>
  )
}
