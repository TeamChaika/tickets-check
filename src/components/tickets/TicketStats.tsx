import type { TicketStats } from '@/types'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
  green?: boolean
}

function StatCard({ label, value, sub, accent, green }: StatCardProps) {
  const lineColor = accent
    ? 'linear-gradient(90deg, var(--gold), transparent)'
    : green
      ? 'linear-gradient(90deg, #4ade80, transparent)'
      : 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)'

  const valueColor = accent ? 'var(--gold)' : green ? '#4ade80' : 'var(--text)'

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${green ? 'rgba(74,222,128,0.15)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '28px 28px 24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '1px',
        background: lineColor,
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
        color: valueColor,
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

  const checkinPct = stats.total_buyers > 0
    ? Math.round((stats.total_checkins / stats.total_buyers) * 100)
    : 0

  return (
    <div className="stats-grid">
      <StatCard label="Покупателей" value={String(stats.total_buyers)} />
      <StatCard label="Билетов продано" value={String(stats.total_tickets)} />
      <StatCard label="Выручка" value={revenue} accent />
      <StatCard
        label="Вошли в зал"
        value={String(stats.total_checkins)}
        sub={`${checkinPct}% от покупателей`}
        green
      />
    </div>
  )
}
