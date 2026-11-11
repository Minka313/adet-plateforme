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
  // L'espace pro s'installe comme une application à part, qui s'ouvre directement sur /espace
  manifest: '/espace.webmanifest',
  appleWebApp: { capable: true, title: 'ADET Pro', statusBarStyle: 'default' },
  icons: { apple: '/brand/icon-192.png' },
}

export const viewport: Viewport = { themeColor: '#FFFFFF' }

export default function RacineEspace({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${titres.variable} ${texte.variable}`}>
      <body className="espace">{children}</body>
    </html>
  )
}
