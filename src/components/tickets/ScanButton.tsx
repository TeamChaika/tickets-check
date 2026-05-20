'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const QrScanModal = dynamic(
  () => import('./QrScanModal').then((m) => m.QrScanModal),
  { ssr: false }
)

export function ScanButton({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="export-btn"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: '7px', padding: '10px 16px', fontSize: '13px', fontWeight: 500,
          color: 'var(--text)', background: 'var(--surface-2)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.02em',
          transition: 'background 0.2s', width: '100%',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="9" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="1" y="9" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="2.5" y="2.5" width="1" height="1" fill="currentColor"/>
          <rect x="10.5" y="2.5" width="1" height="1" fill="currentColor"/>
          <rect x="2.5" y="10.5" width="1" height="1" fill="currentColor"/>
          <path d="M9 9h1.5M9 11h1.5M11 9v1.5M11 11v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Скан
      </button>

      {open && <QrScanModal eventId={eventId} onClose={() => setOpen(false)} />}
    </>
  )
}
