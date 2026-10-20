'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { LANGUES, type Langue } from '@/i18n/config'

type Lien = { href: string; label: string }

export function EnTete({
  lang,
  liens,
  contact,
  libelles,
}: {
  lang: Langue
  liens: Lien[]
  contact: Lien
  libelles: { menu: string; fermer: string; accueil: string; langue: string }
}) {
  const chemin = usePathname()
  const [defile, setDefile] = useState(false)
  const [ouvert, setOuvert] = useState(false)

  useEffect(() => {
    const surDefilement = () => setDefile(window.scrollY > 24)
    surDefilement()
    window.addEventListener('scroll', surDefilement, { passive: true })
    return () => window.removeEventListener('scroll', surDefilement)
  }, [])

  useEffect(() => setOuvert(false), [chemin])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-ouvert', ouvert)
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false)
    window.addEventListener('keydown', echap)
    return () => window.removeEventListener('keydown', echap)
  }, [ouvert])

  const autreLangue = (l: Langue) => chemin.replace(/^\/(fr|en)(?=\/|$)/, `/${l}`) || `/${l}`
  const actif = (href: string) => chemin === href || chemin.startsWith(`${href}/`)

  return (
    <header className={`entete ${defile ? 'entete--plein' : ''} ${ouvert ? 'entete--ouvert' : ''}`}>
      <div className="conteneur entete__barre">
        <Link href={`/${lang}`} className="entete__logo" aria-label={`ADET – ${libelles.accueil}`}>
          <Image src="/brand/adet-logo-blanc.png" alt="ADET" width={1251} height={795} priority sizes="120px" className="logo-clair" />
          <Image src="/brand/adet-logo.png" alt="" width={1251} height={795} priority sizes="120px" className="logo-sombre" />
        </Link>

        <nav className="entete__nav" aria-label="Navigation principale">
          <ul>
            {liens.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={actif(l.href) ? 'est-actif' : undefined} aria-current={actif(l.href) ? 'page' : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="entete__actions">
          <div className="langues" role="group" aria-label={libelles.langue}>
            {LANGUES.map((l) => (
              <Link key={l} href={autreLangue(l)} hrefLang={l} lang={l} className={l === lang ? 'est-actif' : undefined} aria-current={l === lang ? 'true' : undefined}>
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
          <Link href={contact.href} className="bouton bouton--or bouton--petit entete__contact">
            {contact.label}
          </Link>
          <button
            type="button"
            className="burger"
            aria-expanded={ouvert}
            aria-controls="menu-plein-ecran"
            aria-label={ouvert ? libelles.fermer : libelles.menu}
            onClick={() => setOuvert((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="menu-plein-ecran" className="menu-plein" hidden={!ouvert}>
        <nav className="conteneur" aria-label={libelles.menu}>
          <ul>
            {[...liens, contact].map((l, i) => (
              <li key={l.href} style={{ ['--i' as string]: i }}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
