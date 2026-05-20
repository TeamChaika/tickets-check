import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tickets Admin',
    short_name: 'Билеты',
    description: 'Управление билетами на события',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/icon?id=192', sizes: '192x192', type: 'image/png' },
      { src: '/icon?id=512', sizes: '512x512', type: 'image/png' },
      { src: '/icon?id=512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
