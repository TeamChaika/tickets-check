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
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `id_event=eq.${eventId}`,
        },
        (payload) => {
          setTickets(prev =>
            prev.map(t =>
              t.id === (payload.new as Ticket).id
                ? { ...t, inhall: (payload.new as Ticket).inhall }
                : t
            )
          )
        }
      )
      .subscribe()

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
