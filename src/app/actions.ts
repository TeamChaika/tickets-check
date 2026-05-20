'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Ticket } from '@/types'

export async function setCheckIn(ticketId: string, count: number, eventId: string) {
  const supabase = await createClient()
  await supabase.from('tickets').update({ inhall: count > 0 ? count : null }).eq('id', ticketId)
  revalidatePath(`/events/${eventId}`)
}

export interface AddTicketInput {
  firtsname: string
  lastname: string
  phone: string
  len: number
  price: number
  eventId: string
}

export async function addTicket(input: AddTicketInput): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('tickets').insert({
    firtsname: input.firtsname.trim(),
    lastname: input.lastname.trim() || null,
    phone: input.phone.trim(),
    len: input.len,
    price: input.price,
    id_event: input.eventId,
    status: 'paid',
    pay: 'cash',
  })
  if (error) return { error: error.message }
  revalidatePath(`/events/${input.eventId}`)
  return {}
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
  const capacity = ticket.len ?? 1
  if ((ticket.inhall ?? 0) >= capacity) return { status: 'already', ticket }

  await supabase.from('tickets').update({ inhall: capacity }).eq('id', uuid)
  revalidatePath(`/events/${eventId}`)
  return { status: 'ok', ticket: { ...ticket, inhall: capacity } }
}
