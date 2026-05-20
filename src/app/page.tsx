import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import { SignOutButton } from '@/components/SignOutButton'
import type { Event } from '@/types'

export const revalidate = 60

async function getEvents() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('event')
    .select('*')
    .order('date', { ascending: false })
  return (data ?? []) as Event[]
}

export default async function HomePage() {
  const events = await getEvents()

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: '80px' }}>
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

      <main className="page-main" style={{ paddingTop: '48px' }}>

        {/* Header */}
        <header style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <p style={{
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--gold)', margin: '0 0 12px',
              }}>
                Управление билетами
              </p>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700,
                letterSpacing: '-0.02em', color: 'var(--text)',
                lineHeight: 1.1, margin: 0,
              }}>
                Все события
              </h1>
              {events.length > 0 && (
                <p style={{ fontSize: '13px', color: 'var(--text-sub)', margin: '10px 0 0' }}>
                  {events.length} {events.length === 1 ? 'событие' : events.length < 5 ? 'события' : 'событий'}
                </p>
              )}
            </div>
            <SignOutButton />
          </div>
        </header>

        {/* Events grid */}
        {events.length === 0 ? (
          <div style={{
            padding: '80px 24px', textAlign: 'center',
            color: 'var(--text-dim)', fontSize: '14px',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            background: 'var(--surface)',
          }}>
            Нет событий
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
