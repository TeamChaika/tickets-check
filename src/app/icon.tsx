import { ImageResponse } from 'next/og'

export function generateImageMetadata() {
  return [
    { id: '192', contentType: 'image/png' as const, size: { width: 192, height: 192 } },
    { id: '512', contentType: 'image/png' as const, size: { width: 512, height: 512 } },
  ]
}

export default function Icon({ id }: { id: string }) {
  const size = id === '512' ? 512 : 192
  const r = size / 192

  return new ImageResponse(
    (
      <div style={{
        width: size, height: size,
        background: '#0a0a0a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: size * 0.22,
      }}>
        <div style={{
          position: 'absolute',
          inset: Math.round(size * 0.08),
          borderRadius: Math.round(size * 0.16),
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
    { width: size, height: size }
  )
}
