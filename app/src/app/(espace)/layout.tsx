import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Public_Sans } from 'next/font/google'
import React from 'react'

import './espace.css'

const titres = Bricolage_Grotesque({ subsets: ['latin'], variable: '--police-titres', display: 'swap', axes: ['opsz'] })
const texte = Public_Sans({ subsets: ['latin'], variable: '--police-texte', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Espace pro', template: '%s · Espace pro ADET' },
  // Outil interne : jamais dans les moteurs de recherche
  robots: { index: false, follow: false },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = { themeColor: '#FFFFFF' }

export default function RacineEspace({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${titres.variable} ${texte.variable}`}>
      <body className="espace">{children}</body>
    </html>
  )
}
