'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const AddTicketModal = dynamic(
  () => import('./AddTicketModal').then(m => m.AddTicketModal),
  { ssr: false }
)

export function AddTicketButton({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: '7px', padding: '10px 16px', fontSize: '13px', fontWeight: 500,
          color: 'var(--text)', background: 'var(--surface-2)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.02em',
          transition: 'background 0.2s', width: '100%',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-2)')}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Добавить
      </button>

      {open && (
        <AddTicketModal
          eventId={eventId}
          onClose={() => setOpen(false)}
          onAdded={() => {}}
        />
      )}
    </>
  )
}
