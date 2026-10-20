import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import React from 'react'

import { EnTete } from '@/components/EnTete'
import { JsonLd } from '@/components/JsonLd'
import { Pied } from '@/components/Pied'
import { Animations } from '@/components/ui/Animations'
import { dico, estLangue, lien, LANGUES } from '@/i18n'

import '../styles.css'

const titres = Fraunces({ subsets: ['latin'], variable: '--police-titres', display: 'swap', axes: ['opsz', 'SOFT'] })
const texte = Inter({ subsets: ['latin'], variable: '--police-texte', display: 'swap' })

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export function generateStaticParams() {
  return LANGUES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!estLangue(lang)) return {}
  const d = dico(lang)
  return {
    metadataBase: new URL(SITE),
    title: { default: d.meta.titre, template: '%s · ADET' },
    description: d.meta.description,
    manifest: '/manifest.webmanifest',
    alternates: { canonical: `/${lang}`, languages: { fr: '/fr', en: '/en', 'x-default': '/fr' } },
    openGraph: { siteName: 'ADET', locale: lang === 'fr' ? 'fr_SN' : 'en_GB', type: 'website' },
  }
}

export const viewport: Viewport = { themeColor: '#0F2240' }

export default async function Racine({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!estLangue(lang)) notFound()
  const d = dico(lang)
  const liens = [
    { href: lien(lang, '/a-propos'), label: d.nav.association },
    { href: lien(lang, '/realisations'), label: d.nav.realisations },
    { href: lien(lang, '/actualites'), label: d.nav.actualites },
    { href: lien(lang, '/equipe'), label: d.nav.equipe },
    { href: lien(lang, '/partenaires'), label: d.nav.partenaires },
  ]
  return (
    <html lang={lang} className={`${titres.variable} ${texte.variable}`} suppressHydrationWarning>
      <head>
        {/* Active les animations uniquement si JavaScript est disponible (sinon tout reste visible) */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a href="#contenu" className="lien-evitement">
          {d.nav.allerAuContenu}
        </a>
        <EnTete
          lang={lang}
          liens={liens}
          contact={{ href: lien(lang, '/contact'), label: d.nav.nousContacter }}
          libelles={{ menu: d.nav.menu, fermer: d.nav.fermer, accueil: d.nav.accueil, langue: d.nav.langue }}
        />
        <main id="contenu">{children}</main>
        <Pied lang={lang} />
        <Animations />
        <JsonLd lang={lang} />
      </body>
    </html>
  )
}
