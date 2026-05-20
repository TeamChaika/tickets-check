'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TicketStatsBar } from './TicketStats'
import { TicketTable } from './TicketTable'
import type { Ticket, TicketStats } from '@/types'

function computeStats(tickets: Ticket[]): TicketStats {
  return {
    total_buyers: tickets.length,
    total_tickets: tickets.reduce((s, t) => s + (t.len ?? 0), 0),
    total_revenue: tickets.reduce((s, t) => s + (t.price ?? 0), 0),
    total_checkins: tickets.reduce((s, t) => s + (t.inhall ?? 0), 0),
  }
}

interface Props {
  initialTickets: Ticket[]
  eventId: string
  showStats: boolean
}

export function RealtimeTickets({ initialTickets, eventId, showStats }: Props) {
  const [tickets, setTickets] = useState(initialTickets)
  const stats = computeStats(tickets)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`tickets-event-${eventId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tickets' },
        (payload) => {
          const updated = payload.new as Ticket
          if (String(updated.id_event) !== String(eventId)) return
          setTickets(prev =>
            prev.map(t => t.id === updated.id ? { ...t, inhall: updated.inhall } : t)
          )
        }
      )
      .subscribe((status) => {
        console.log('[Realtime]', status)
      })

    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  return (
    <>
      {showStats && (
        <section style={{ marginBottom: '40px' }}>
          <TicketStatsBar stats={stats} />
        </section>
      )}
      <TicketTable tickets={tickets} />
    </>
  )
}
