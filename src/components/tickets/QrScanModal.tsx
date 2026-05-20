'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { checkInByQr, type ScanResult } from '@/app/actions'
import type { Ticket } from '@/types'

interface Props {
  eventId: string
  onClose: () => void
}

type Phase = 'scanning' | 'result'

function ResultView({ result, onAgain, onClose }: {
  result: ScanResult
  onAgain: () => void
  onClose: () => void
}) {
  const isOk      = result.status === 'ok'
  const isAlready = result.status === 'already'
  const ticket    = (result as { ticket?: Ticket }).ticket

  const accent = isOk ? '#4ade80' : isAlready ? 'var(--gold)' : '#f87171'
  const icon   = isOk ? '✓' : isAlready ? '↩' : '✕'
  const title  = isOk ? 'Чекин выполнен' : isAlready ? 'Уже в зале' : result.status === 'wrong_event' ? 'Другое событие' : 'Билет не найден'

  return (
    <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        background: `${accent}1a`, border: `2px solid ${accent}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '32px', color: accent,
      }}>
        {icon}
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '18px', fontWeight: 700, color: accent, margin: '0 0 8px' }}>{title}</p>
        {ticket && (
          <>
            <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
              {ticket.firtsname}{ticket.lastname ? ` ${ticket.lastname}` : ''}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-sub)', margin: '0 0 4px', fontFamily: 'monospace' }}>
              {ticket.phone}
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', fontWeight: 600, color: 'var(--gold)',
              background: 'var(--gold-dim)', border: '1px solid var(--border-gold)',
              padding: '3px 10px', borderRadius: '4px', marginTop: '4px',
            }}>
              {ticket.len} {ticket.len === 1 ? 'билет' : ticket.len < 5 ? 'билета' : 'билетов'}
            </span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
        <button onClick={onAgain} style={btnStyle('var(--gold-dim)', 'var(--gold)', 'var(--border-gold)')}>
          Следующий
        </button>
        <button onClick={onClose} style={btnStyle('var(--surface-2)', 'var(--text-sub)', 'var(--border)')}>
          Закрыть
        </button>
      </div>
    </div>
  )
}

function btnStyle(bg: string, color: string, border: string): React.CSSProperties {
  return {
    flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)',
    border: `1px solid ${border}`, background: bg, color,
    fontSize: '13px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em',
  }
}

const TICKET_URL_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

export function QrScanModal({ eventId, onClose }: Props) {
  const scannerRef  = useRef<{ clear: () => void } | null>(null)
  const mountedRef  = useRef(false)
  const [phase, setPhase]   = useState<Phase>('scanning')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [pending, startTransition] = useTransition()

  function handleDecode(text: string) {
    const match = text.match(TICKET_URL_RE)
    if (!match) return
    const uuid = match[0]
    scannerRef.current?.clear()
    startTransition(async () => {
      const res = await checkInByQr(uuid, eventId)
      setResult(res)
      setPhase('result')
    })
  }

  function restart() {
    setPhase('scanning')
    setResult(null)
  }

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let instance: any = null

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      instance = new Html5Qrcode('qr-reader')
      scannerRef.current = { clear: () => { try { instance?.stop() } catch { /* ignore */ } } }
      instance.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        handleDecode,
        () => {},
      ).catch(() => {})
    })

    return () => {
      try { instance?.stop() } catch { /* ignore */ }
    }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', width: '100%', maxWidth: '400px',
        padding: '28px 24px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', margin: '0 0 4px' }}>
              Сканер
            </p>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              QR Чекин
            </h2>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--surface-2)',
            color: 'var(--text-sub)', cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {phase === 'scanning' && (
          <>
            <div id="qr-reader" style={{
              borderRadius: 'var(--radius-sm)', overflow: 'hidden',
              border: '1px solid var(--border)',
              minHeight: '280px',
              background: 'var(--bg)',
            }} />
            {pending && (
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-sub)', marginTop: '12px' }}>
                Обработка…
              </p>
            )}
            {!pending && (
              <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-dim)', marginTop: '12px' }}>
                Наведите камеру на QR-код билета
              </p>
            )}
          </>
        )}

        {phase === 'result' && result && (
          <ResultView result={result} onAgain={restart} onClose={onClose} />
        )}
      </div>
    </div>
  )
}
