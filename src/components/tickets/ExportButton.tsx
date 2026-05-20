'use client'

import { useState } from 'react'
import type { Ticket } from '@/types'

interface Props {
  tickets: Ticket[]
  eventName: string
  eventId: string | number
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function ExportButton({ tickets, eventName, eventId }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const { utils, writeFile } = await import('xlsx')

      const rows = tickets.map((t, i) => ({
        '№':             i + 1,
        'Имя':           t.firtsname,
        'Фамилия':       t.lastname ?? '',
        'Телефон':       t.phone,
        'Кол-во':        t.len,
        'Сумма (руб.)':  t.price,
        'Дата покупки':  formatDate(t.created_at),
      }))

      // Summary row
      const totalTickets = tickets.reduce((s, t) => s + (t.len ?? 0), 0)
      const totalRevenue = tickets.reduce((s, t) => s + (t.price ?? 0), 0)
      rows.push({
        '№':            '' as unknown as number,
        'Имя':          'ИТОГО',
        'Фамилия':      '',
        'Телефон':      '',
        'Кол-во':       totalTickets,
        'Сумма (руб.)': totalRevenue,
        'Дата покупки': '',
      })

      const ws = utils.json_to_sheet(rows)

      // Column widths
      ws['!cols'] = [
        { wch: 5 },   // №
        { wch: 16 },  // Имя
        { wch: 18 },  // Фамилия
        { wch: 16 },  // Телефон
        { wch: 8 },   // Кол-во
        { wch: 14 },  // Сумма
        { wch: 18 },  // Дата
      ]

      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, `Событие ${eventId}`)

      const date = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')
      writeFile(wb, `tickets_event${eventId}_${date}.xlsx`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading || tickets.length === 0}
      className="export-btn"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '7px',
        padding: '10px 16px',
        fontSize: '13px',
        fontWeight: 500,
        color: loading ? 'var(--text-dim)' : 'var(--gold)',
        background: 'var(--gold-dim)',
        border: '1px solid var(--border-gold)',
        borderRadius: 'var(--radius-sm)',
        cursor: loading || tickets.length === 0 ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.2s, background 0.2s',
        opacity: tickets.length === 0 ? 0.4 : 1,
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
        width: '100%',
      }}
      onMouseEnter={e => {
        if (!loading && tickets.length > 0)
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,169,110,0.2)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-dim)'
      }}
    >
      {loading ? (
        <>
          <span style={{
            width: '12px', height: '12px',
            border: '2px solid var(--border)',
            borderTopColor: 'var(--gold)',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.6s linear infinite',
          }} />
          Экспорт…
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 6l3 3 3-3M2 10v1.5A1.5 1.5 0 003.5 13h7A1.5 1.5 0 0012 11.5V10"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          XLSX
        </>
      )}
    </button>
  )
}
