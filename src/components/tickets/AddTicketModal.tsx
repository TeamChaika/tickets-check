'use client'

import { useState, useTransition } from 'react'
import { addTicket } from '@/app/actions'

interface Props {
  eventId: string
  onClose: () => void
  onAdded: () => void
}

const inputStyle = (focused: boolean): React.CSSProperties => ({
  padding: '11px 14px', borderRadius: '8px',
  border: `1px solid ${focused ? 'rgba(201,169,110,0.5)' : 'var(--border)'}`,
  background: 'var(--bg)', color: 'var(--text)', fontSize: '14px',
  outline: 'none', width: '100%', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
})

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-sub)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export function AddTicketModal({ eventId, onClose, onAdded }: Props) {
  const [firtsname, setFirtsname] = useState('')
  const [lastname, setLastname]   = useState('')
  const [phone, setPhone]         = useState('')
  const [len, setLen]             = useState(1)
  const [price, setPrice]         = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [focusedField, setFocusedField] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firtsname.trim() || !phone.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await addTicket({
        firtsname, lastname, phone,
        len, price: Number(price) || 0,
        eventId,
      })
      if (result.error) {
        setError(result.error)
      } else {
        onAdded()
        onClose()
      }
    })
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', width: '100%', maxWidth: '420px',
        padding: '28px 24px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', margin: '0 0 4px' }}>
              Ручной билет
            </p>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Добавить гостя
            </h2>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--surface-2)',
            color: 'var(--text-sub)', cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Имя *">
              <input
                value={firtsname}
                onChange={e => setFirtsname(e.target.value)}
                onFocus={() => setFocusedField('firtsname')}
                onBlur={() => setFocusedField(null)}
                placeholder="Иван"
                required
                style={inputStyle(focusedField === 'firtsname')}
              />
            </Field>
            <Field label="Фамилия">
              <input
                value={lastname}
                onChange={e => setLastname(e.target.value)}
                onFocus={() => setFocusedField('lastname')}
                onBlur={() => setFocusedField(null)}
                placeholder="Иванов"
                style={inputStyle(focusedField === 'lastname')}
              />
            </Field>
          </div>

          <Field label="Телефон *">
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              placeholder="+7 999 000 00 00"
              type="tel"
              required
              style={inputStyle(focusedField === 'phone')}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Кол-во билетов">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button type="button" onClick={() => setLen(Math.max(1, len - 1))} style={{
                  width: '36px', height: '42px', borderRadius: '8px',
                  border: '1px solid var(--border)', background: 'var(--surface-2)',
                  color: 'var(--text)', fontSize: '18px', cursor: 'pointer', flexShrink: 0,
                }}>−</button>
                <span style={{
                  flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 700,
                  color: 'var(--gold)', userSelect: 'none',
                }}>{len}</span>
                <button type="button" onClick={() => setLen(Math.min(20, len + 1))} style={{
                  width: '36px', height: '42px', borderRadius: '8px',
                  border: '1px solid var(--border)', background: 'var(--surface-2)',
                  color: 'var(--text)', fontSize: '18px', cursor: 'pointer', flexShrink: 0,
                }}>+</button>
              </div>
            </Field>
            <Field label="Сумма (₽)">
              <input
                value={price}
                onChange={e => setPrice(e.target.value)}
                onFocus={() => setFocusedField('price')}
                onBlur={() => setFocusedField(null)}
                placeholder="0"
                type="number"
                min="0"
                style={inputStyle(focusedField === 'price')}
              />
            </Field>
          </div>

          {error && (
            <p style={{
              fontSize: '13px', color: '#f87171',
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: '6px', padding: '10px 12px', margin: 0,
            }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="submit"
              disabled={pending || !firtsname.trim() || !phone.trim()}
              style={{
                flex: 1, padding: '13px', borderRadius: '8px', border: 'none',
                background: pending || !firtsname.trim() || !phone.trim()
                  ? 'rgba(201,169,110,0.4)' : 'var(--gold)',
                color: '#0a0a0a', fontSize: '13px', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: pending ? 'wait' : 'pointer', transition: 'background 0.15s',
              }}
            >
              {pending ? 'Добавление…' : 'Добавить'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '13px 20px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'var(--surface-2)',
                color: 'var(--text-sub)', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
