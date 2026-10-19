import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import React from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

import './styles.css'

const titres = Nunito({ subsets: ['latin'], weight: ['700', '800'], variable: '--police-titres', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'ADET – Développement économique territorial · Kolda',
    template: '%s · ADET',
  },
  description:
    "Association pour la promotion du Développement Économique Territorial (ADET), basée à Kolda : formations, partenariats et valorisation des ressources locales en Casamance.",
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = { themeColor: '#244C8A' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={titres.variable}>
      <body>
        <a href="#contenu" className="lien-evitement">
          Aller au contenu
        </a>
        <Header />
        <main id="contenu">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
