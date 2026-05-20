import type { TicketStats } from '@/types'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
}

function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '28px 28px 24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* top accent line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '1px',
        background: accent
          ? 'linear-gradient(90deg, var(--gold), transparent)'
          : 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)',
      }} />

      <p style={{
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-sub)',
        margin: '0 0 14px',
      }}>
        {label}
      </p>

      <p style={{
        fontSize: 'clamp(28px, 3vw, 36px)',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color: accent ? 'var(--gold)' : 'var(--text)',
        margin: 0,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </p>

      {sub && (
        <p style={{
          fontSize: '12px',
          color: 'var(--text-dim)',
          margin: '8px 0 0',
        }}>
          {sub}
        </p>
      )}
    </div>
  )
}

export function TicketStatsBar({ stats }: { stats: TicketStats }) {
  const revenue = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(stats.total_revenue)

  return (
    <div className="stats-grid">
      <StatCard label="Покупателей" value={String(stats.total_buyers)} />
      <StatCard label="Билетов продано" value={String(stats.total_tickets)} />
      <StatCard label="Выручка" value={revenue} accent />
    </div>
  )
}
