'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { IconeEspace, type NomIconeEspace } from './Icones'

const LIENS: { href: string; label: string; icone: NomIconeEspace }[] = [
  { href: '/espace', label: 'Accueil', icone: 'accueil' },
  { href: '/espace/annonces', label: 'Annonces', icone: 'annonces' },
  { href: '/espace/annuaire', label: 'Équipe', icone: 'equipe' },
  { href: '/espace/profil', label: 'Profil', icone: 'profil' },
]

/** Onglets en haut sur ordinateur, barre du bas sur téléphone (comme une application) */
export function NavigationEspace() {
  const chemin = usePathname()
  const actif = (href: string) => (href === '/espace' ? chemin === href : chemin.startsWith(href))
  return (
    <nav className="espace-nav" aria-label="Espace pro">
      <ul>
        {LIENS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} aria-current={actif(l.href) ? 'page' : undefined}>
              <IconeEspace nom={l.icone} />
              <span>{l.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function BoutonDeconnexion() {
  const router = useRouter()
  async function sortir() {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).catch(() => null)
    router.replace('/espace/connexion')
    router.refresh()
  }
  return (
    <button type="button" className="bouton-icone" onClick={sortir} aria-label="Se déconnecter" title="Se déconnecter">
      <IconeEspace nom="sortie" />
    </button>
  )
}
