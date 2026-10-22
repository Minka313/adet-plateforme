'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { LANGUES, type Langue } from '@/i18n/config'
import type { EntreeMenu, Lien } from '@/lib/menu'

export function EnTete({
  lang,
  menu,
  contact,
  libelles,
}: {
  lang: Langue
  menu: EntreeMenu[]
  contact: Lien
  libelles: { menu: string; fermer: string; accueil: string; langue: string }
}) {
  const chemin = usePathname()
  const [defile, setDefile] = useState(false)
  const [ouvert, setOuvert] = useState(false)
  const [sousMenu, setSousMenu] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const surDefilement = () => setDefile(window.scrollY > 24)
    surDefilement()
    window.addEventListener('scroll', surDefilement, { passive: true })
    return () => window.removeEventListener('scroll', surDefilement)
  }, [])

  // Referme les menus à chaque changement de page
  const [cheminPrecedent, setCheminPrecedent] = useState(chemin)
  if (chemin !== cheminPrecedent) {
    setCheminPrecedent(chemin)
    setOuvert(false)
    setSousMenu(null)
  }

  useEffect(() => {
    document.documentElement.classList.toggle('menu-ouvert', ouvert)
    const echap = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOuvert(false)
      setSousMenu(null)
    }
    // Ferme le sous-menu au clic en dehors de la navigation
    const clic = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setSousMenu(null)
    }
    window.addEventListener('keydown', echap)
    document.addEventListener('click', clic)
    return () => {
      window.removeEventListener('keydown', echap)
      document.removeEventListener('click', clic)
    }
  }, [ouvert])

  const autreLangue = (l: Langue) => chemin.replace(/^\/(fr|en)(?=\/|$)/, `/${l}`) || `/${l}`
  const actif = (href: string) => {
    const cible = href.split(/[?#]/)[0]
    if (!cible) return false
    return cible === `/${lang}` ? chemin === cible : chemin === cible || chemin.startsWith(`${cible}/`)
  }
  const fermerTout = () => {
    setOuvert(false)
    setSousMenu(null)
  }

  return (
    <header className={`entete ${defile ? 'entete--plein' : ''} ${ouvert ? 'entete--ouvert' : ''}`}>
      <div className="conteneur entete__barre">
        <Link href={`/${lang}`} className="entete__logo" aria-label={`ADET – ${libelles.accueil}`}>
          <Image src="/brand/adet-logo-blanc.png" alt="ADET" width={1251} height={795} priority sizes="120px" className="logo-clair" />
          <Image src="/brand/adet-logo.png" alt="" width={1251} height={795} priority sizes="120px" className="logo-sombre" />
        </Link>

        <nav className="entete__nav" aria-label="Navigation principale" ref={navRef}>
          <ul>
            {menu.map((e, i) =>
              'enfants' in e ? (
                <li key={e.label} className="a-sous-menu">
                  <button
                    type="button"
                    className={e.enfants.some((l) => actif(l.href)) ? 'est-actif' : undefined}
                    aria-expanded={sousMenu === e.label}
                    aria-controls={`sous-menu-${i}`}
                    onClick={() => setSousMenu((s) => (s === e.label ? null : e.label))}
                  >
                    {e.label}
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                  <ul id={`sous-menu-${i}`} className={`sous-menu ${sousMenu === e.label ? 'est-ouvert' : ''}`}>
                    {e.enfants.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} aria-current={actif(l.href) ? 'page' : undefined} onClick={fermerTout}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={e.href}>
                  <Link href={e.href} className={actif(e.href) ? 'est-actif' : undefined} aria-current={actif(e.href) ? 'page' : undefined}>
                    {e.label}
                  </Link>
                </li>
              ),
            )}
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
            {menu.map((e, i) =>
              'enfants' in e ? (
                <li key={e.label} className="menu-plein__groupe" style={{ ['--i' as string]: i }}>
                  <p className="menu-plein__titre">{e.label}</p>
                  <ul>
                    {e.enfants.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} onClick={fermerTout}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={e.href} style={{ ['--i' as string]: i }}>
                  <Link href={e.href} onClick={fermerTout}>
                    {e.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
