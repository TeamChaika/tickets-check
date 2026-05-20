'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Ticket } from '@/types'

export async function toggleCheckIn(ticketId: string, currentInhall: number | null, eventId: string) {
  const supabase = await createClient()
  const next = currentInhall === 1 ? null : 1
  await supabase.from('tickets').update({ inhall: next }).eq('id', ticketId)
  revalidatePath(`/events/${eventId}`)
}

export type ScanResult =
  | { status: 'ok';      ticket: Ticket }
  | { status: 'already'; ticket: Ticket }
  | { status: 'not_found' }
  | { status: 'wrong_event' }

export async function checkInByQr(uuid: string, eventId: string): Promise<ScanResult> {
  const supabase = await createClient()
  const { data } = await supabase.from('tickets').select('*').eq('id', uuid).single()
  if (!data) return { status: 'not_found' }

  const ticket = data as Ticket
  if (String(ticket.id_event) !== String(eventId)) return { status: 'wrong_event' }
  if (ticket.inhall === 1) return { status: 'already', ticket }

  await supabase.from('tickets').update({ inhall: 1 }).eq('id', uuid)
  revalidatePath(`/events/${eventId}`)
  return { status: 'ok', ticket: { ...ticket, inhall: 1 } }
}
