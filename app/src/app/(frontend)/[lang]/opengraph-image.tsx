import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

import { estLangue } from '@/i18n/config'
import { getAssociation } from '@/lib/payload'

export const alt = 'ADET – Kolda, Casamance, Sénégal'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Image de partage (réseaux sociaux, WhatsApp) générée aux couleurs de l'ADET. */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: brut } = await params
  const lang = estLangue(brut) ? brut : 'fr'
  const asso = await getAssociation(lang)
  const logo = await readFile(path.join(process.cwd(), 'public/brand/adet-logo-blanc.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          color: 'white',
          background: 'radial-gradient(circle at 80% 20%, #2a56b8 0%, #0f2240 55%), #0f2240',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={220} height={140} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 26, color: '#F9DB5F', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 18 }}>
            {lang === 'fr' ? 'Kolda · Casamance · Sénégal' : 'Kolda · Casamance · Senegal'}
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.08, maxWidth: 1000 }}>{asso.accroche || asso.nom}</div>
        </div>
        <div style={{ display: 'flex', height: 12, width: '100%' }}>
          {['#244C8A', '#F9DB5F', '#0B7A1E', '#00586E', '#FFAE5D', '#3C6EF1'].map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
      </div>
    ),
    size,
  )
}
