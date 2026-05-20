import { ImageResponse } from 'next/og'

export const contentType = 'image/png'
export const size = { width: 180, height: 180 }

export default function AppleIcon() {
  const s = 180
  const r = s / 192

  return new ImageResponse(
    (
      <div style={{
        width: s, height: s,
        background: '#0a0a0a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: s * 0.22,
      }}>
        <div style={{
          position: 'absolute',
          inset: Math.round(s * 0.08),
          borderRadius: Math.round(s * 0.16),
          border: `${Math.round(2 * r)}px solid rgba(201,169,110,0.35)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Math.round(6 * r) }}>
            <div style={{ width: Math.round(70 * r), height: Math.round(4 * r), background: '#c9a96e', borderRadius: Math.round(2 * r) }} />
            <div style={{ fontSize: Math.round(54 * r), color: '#c9a96e', lineHeight: '1', fontFamily: 'sans-serif', fontWeight: 700 }}>✓</div>
            <div style={{ width: Math.round(50 * r), height: Math.round(3 * r), background: 'rgba(201,169,110,0.4)', borderRadius: Math.round(2 * r) }} />
          </div>
        </div>
      </div>
    ),
    { width: s, height: s }
  )
}
