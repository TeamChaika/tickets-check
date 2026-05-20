'use client'

import { useState, useTransition } from 'react'
import type { Ticket } from '@/types'
import { setCheckIn } from '@/app/actions'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency', currency: 'RUB', maximumFractionDigits: 0,
  }).format(amount)
}

const HEADERS = ['#', 'Имя', 'Фамилия', 'Телефон', 'Билетов', 'Сумма', 'Дата покупки', '']

const th: React.CSSProperties = {
  padding: '14px 18px',
  textAlign: 'left',
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--text-sub)',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--border)',
}

const td: React.CSSProperties = {
  padding: '15px 18px',
  fontSize: '13.5px',
  color: 'var(--text)',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
}

function CheckInCounter({ ticket }: { ticket: Ticket }) {
  const max = ticket.len ?? 1
  const [count, setCount] = useState(ticket.inhall ?? 0)
  const [pending, startTransition] = useTransition()

  function change(next: number) {
    setCount(next)
    startTransition(() => setCheckIn(ticket.id, next, ticket.id_event))
  }

  const isFull    = count >= max
  const isPartial = count > 0 && count < max
  const accent = isFull ? '#4ade80' : isPartial ? 'var(--gold)' : 'var(--text-dim)'
  const bg     = isFull ? 'rgba(74,222,128,0.08)' : isPartial ? 'var(--gold-dim)' : 'var(--surface-2)'
  const border = isFull ? 'rgba(74,222,128,0.2)'  : isPartial ? 'var(--border-gold)' : 'var(--border)'

  const btnBase: React.CSSProperties = {
    width: '26px', height: '28px', background: 'transparent', border: 'none',
    cursor: 'pointer', fontSize: '16px', fontWeight: 600, lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: accent,
  }

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      border: `1px solid ${border}`, borderRadius: '6px',
      background: bg, overflow: 'hidden',
      opacity: pending ? 0.65 : 1, transition: 'all 0.15s',
    }}>
      <button
        onClick={() => change(Math.max(0, count - 1))}
        disabled={pending || count === 0}
        style={{ ...btnBase, opacity: count === 0 ? 0.25 : 1, cursor: count === 0 ? 'default' : 'pointer' }}
      >−</button>
      <span style={{
        minWidth: max > 1 ? '34px' : '22px', textAlign: 'center',
        fontSize: '11px', fontWeight: 700, color: accent,
        userSelect: 'none', letterSpacing: '0.02em',
      }}>
        {max > 1 ? `${count}/${max}` : (count > 0 ? '✓' : '·')}
      </span>
      <button
        onClick={() => change(Math.min(max, count + 1))}
        disabled={pending || count >= max}
        style={{ ...btnBase, opacity: count >= max ? 0.25 : 1, cursor: count >= max ? 'default' : 'pointer' }}
      >+</button>
    </div>
  )
}

function TicketRow({ ticket, idx }: { ticket: Ticket; idx: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? 'var(--gold-glow)' : 'transparent', transition: 'background 0.15s' }}
    >
      <td style={{ ...td, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums', width: '48px' }}>{idx + 1}</td>
      <td style={{ ...td, fontWeight: 500 }}>{ticket.firtsname}</td>
      <td style={{ ...td, color: hovered ? 'var(--text)' : 'var(--text-sub)' }}>
        {ticket.lastname ?? <span style={{ color: 'var(--text-dim)' }}>—</span>}
      </td>
      <td style={{ ...td, fontFamily: 'var(--font-geist-mono), monospace', fontSize: '12.5px', color: 'var(--text-sub)' }}>
        {ticket.phone}
      </td>
      <td style={{ ...td, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '28px', height: '28px', borderRadius: '6px',
          background: ticket.len > 1 ? 'var(--gold-dim)' : 'transparent',
          color: ticket.len > 1 ? 'var(--gold)' : 'var(--text-sub)',
          fontSize: '13px', fontWeight: ticket.len > 1 ? 600 : 400,
        }}>
          {ticket.len}
        </span>
      </td>
      <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
        {formatMoney(ticket.price)}
      </td>
      <td style={{ ...td, color: 'var(--text-sub)', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '12px' }}>
        {formatDate(ticket.created_at)}
      </td>
      <td style={{ ...td, paddingRight: '16px' }}>
        <CheckInCounter ticket={ticket} />
      </td>
    </tr>
  )
}

function MobileCard({ ticket, idx }: { ticket: Ticket; idx: number }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {/* Row 1: index + name + tickets badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', flexShrink: 0 }}>{idx + 1}</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ticket.firtsname}{ticket.lastname ? ` ${ticket.lastname}` : ''}
          </span>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: '28px', height: '24px', padding: '0 8px',
          borderRadius: '5px', flexShrink: 0,
          background: ticket.len > 1 ? 'var(--gold-dim)' : 'var(--surface-2)',
          color: ticket.len > 1 ? 'var(--gold)' : 'var(--text-sub)',
          fontSize: '12px', fontWeight: 600,
        }}>
          {ticket.len} бил.
        </span>
      </div>

      {/* Row 2: phone + amount */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '13px', color: 'var(--text-sub)', letterSpacing: '0.02em',
        }}>
          {ticket.phone}
        </span>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
          {formatMoney(ticket.price)}
        </span>
      </div>

      {/* Row 3: date + check-in */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px', color: 'var(--text-dim)' }}>
          {formatDate(ticket.created_at)}
        </span>
        <CheckInCounter ticket={ticket} />
      </div>
    </div>
  )
}

const emptyState = (
  <div style={{
    padding: '60px 24px', textAlign: 'center',
    color: 'var(--text-dim)', fontSize: '14px',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    background: 'var(--surface)',
  }}>
    Нет данных
  </div>
)

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) return emptyState

  const headerBar = (
    <div style={{
      padding: '14px 18px 12px',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: '12px', color: 'var(--text-sub)', letterSpacing: '0.04em' }}>
        {tickets.length} записей
      </span>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: 'var(--gold)', boxShadow: '0 0 8px var(--gold)', display: 'inline-block',
      }} />
    </div>
  )

  return (
    <>
      {/* Desktop table */}
      <div className="ticket-table-wrap" style={{
        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        overflow: 'hidden', background: 'var(--surface)',
      }}>
        {headerBar}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {HEADERS.map((h) => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, idx) => (
                <TicketRow key={ticket.id} ticket={ticket} idx={idx} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="ticket-cards-wrap">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 4px 6px',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{tickets.length} записей</span>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--gold)', boxShadow: '0 0 8px var(--gold)', display: 'inline-block',
          }} />
        </div>
        {tickets.map((ticket, idx) => (
          <MobileCard key={ticket.id} ticket={ticket} idx={idx} />
        ))}
      </div>
    </>
  )
}
