'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Event } from '@/types'

function formatMoney(n: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function EventCard({ event }: { event: Event }) {
  const [hovered, setHovered] = useState(false)
  const date = formatDate(event.date)

  return (
    <Link
      href={`/events/${event.id}`}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--border-gold)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 32px rgba(201,169,110,0.08)' : 'none',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Image or placeholder */}
        <div style={{
          height: '160px',
          background: event.img_card
            ? `url(${event.img_card}) center/cover no-repeat`
            : 'linear-gradient(135deg, var(--surface-2) 0%, #1f1c18 100%)',
          position: 'relative',
          flexShrink: 0,
        }}>
          {/* overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.8) 100%)',
          }} />

          {/* Status badge */}
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <span style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: event.sale_on ? '#4ade80' : 'var(--text-sub)',
              background: event.sale_on ? 'rgba(74,222,128,0.15)' : 'rgba(0,0,0,0.6)',
              border: `1px solid ${event.sale_on ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
              padding: '3px 8px', borderRadius: '4px',
              backdropFilter: 'blur(8px)',
            }}>
              {event.sale_on ? 'Открыт' : 'Закрыт'}
            </span>
          </div>

          {/* ID badge */}
          <div style={{ position: 'absolute', bottom: '12px', left: '14px' }}>
            <span style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--gold)',
              opacity: 0.8,
            }}>
              #{event.id}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{
            fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em',
            color: 'var(--text)', margin: 0, lineHeight: 1.3,
          }}>
            {event.name}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto' }}>
            {date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>📅</span>
                <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                  {date}{event.time ? ` · ${event.time.slice(0, 5)}` : ''}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Цена от</span>
              <span style={{
                fontSize: '14px', fontWeight: 600, color: hovered ? 'var(--gold)' : 'var(--text)',
                fontVariantNumeric: 'tabular-nums',
                transition: 'color 0.2s',
              }}>
                {formatMoney(event.price)}
              </span>
            </div>
          </div>
        </div>

      </article>
    </Link>
  )
}
