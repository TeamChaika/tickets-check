import Link from 'next/link'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TicketStatsBar } from '@/components/tickets/TicketStats'
import { TicketTable } from '@/components/tickets/TicketTable'
import { TicketSearch } from '@/components/tickets/TicketSearch'
import { ExportButton } from '@/components/tickets/ExportButton'
import { ScanButton } from '@/components/tickets/ScanButton'
import type { Ticket, Event, TicketStats } from '@/types'

export const revalidate = 0

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ q?: string }>
}

async function getData(id: string, query: string) {
  const supabase = await createClient()

  let ticketsQuery = supabase
    .from('tickets')
    .select('*')
    .eq('id_event', id)
    .eq('status', 'paid')
    .order('created_at', { ascending: true })

  if (query) {
    const q = `%${query}%`
    ticketsQuery = ticketsQuery.or(
      `firtsname.ilike.${q},lastname.ilike.${q},phone.ilike.${q}`
    )
  }

  const [{ data: event }, { data: tickets }] = await Promise.all([
    supabase.from('event').select('*').eq('id', id).single(),
    ticketsQuery,
  ])

  if (!event) return null

  const rows = (tickets ?? []) as Ticket[]
  const stats: TicketStats = {
    total_buyers: rows.length,
    total_tickets: rows.reduce((s, t) => s + (t.len ?? 0), 0),
    total_revenue: rows.reduce((s, t) => s + (t.price ?? 0), 0),
    total_checkins: rows.filter((t) => t.inhall === 1).length,
  }

  return { event: event as Event, tickets: rows, stats }
}

export default async function EventPage({ params, searchParams }: Props) {
  const [{ id }, { q = '' }] = await Promise.all([params, searchParams])
  const data = await getData(id, q.trim())

  if (!data) notFound()

  const { event, tickets, stats } = data

  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: '80px' }}>
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

      <main className="page-main">

        {/* Breadcrumb */}
        <nav style={{ marginBottom: '36px' }}>
          <Link href="/" style={{
            fontSize: '12px', color: 'var(--text-sub)', textDecoration: 'none',
            letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ fontSize: '14px' }}>←</span> Все события
          </Link>
        </nav>

        {/* Header */}
        <header style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--gold)',
              background: 'var(--gold-dim)', border: '1px solid var(--border-gold)',
              padding: '4px 10px', borderRadius: '4px',
            }}>
              Событие #{event.id}
            </span>
            {eventDate && (
              <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                {eventDate}{event.time ? ` · ${event.time.slice(0, 5)}` : ''}
              </span>
            )}
            <span style={{
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em',
              color: event.sale_on ? '#4ade80' : 'var(--text-sub)',
              background: event.sale_on ? 'rgba(74,222,128,0.1)' : 'var(--surface-2)',
              border: `1px solid ${event.sale_on ? 'rgba(74,222,128,0.2)' : 'var(--border)'}`,
              padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase',
            }}>
              {event.sale_on ? 'Продажи открыты' : 'Продажи закрыты'}
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700,
            letterSpacing: '-0.02em', color: 'var(--text)', lineHeight: 1.1, margin: 0,
          }}>
            {event.name}
          </h1>
        </header>

        {/* Stats — только без активного поиска */}
        {!q && (
          <section style={{ marginBottom: '40px' }}>
            <TicketStatsBar stats={stats} />
          </section>
        )}

        {/* Search + Export */}
        <section>
          <div className="toolbar">
            <div className="toolbar-left">
              <Suspense>
                <TicketSearch defaultValue={q} />
              </Suspense>
              {q && (
                <span style={{ fontSize: '12px', color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>
                  {tickets.length === 0
                    ? 'Ничего не найдено'
                    : `${tickets.length} ${tickets.length === 1 ? 'результат' : 'результатов'}`}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <ScanButton eventId={String(event.id)} />
              <ExportButton tickets={tickets} eventName={event.name} eventId={event.id} />
            </div>
          </div>
          <TicketTable tickets={tickets} />
        </section>

      </main>
    </div>
  )
}
